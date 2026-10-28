// WardAlert Sentinel - Experiments API Routes
import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../middleware/auth';
import { runExperiment, ExperimentParams } from '../../../evaluation/experimentRunner';

const router = Router();
const prisma = new PrismaClient();

// GET /api/experiments/latest - Returns current active experiment result for dashboard
router.get('/latest', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await prisma.experimentResult.findFirst({
      include: { experiment: true },
      orderBy: { createdAt: 'desc' }
    });

    if (!result) {
      const liveExp = runExperiment({
        name: 'Default Ward Telemetry Run',
        patientCount: 28,
        simulationDuration: 24,
        alertVolume: 2430,
        randomSeed: 42,
        groupingWindowMins: 10
      });

      return res.json({
        result: {
          baselineAlerts: liveExp.metrics.totalBaselineAlerts,
          analyserAlerts: liveExp.metrics.totalAnalyserAlerts,
          nonActionableReductionPct: liveExp.metrics.nonActionableReductionPct,
          highPrioritySensitivity: liveExp.metrics.highPrioritySensitivity,
          precision: liveExp.metrics.precision,
          recall: liveExp.metrics.recall,
          f1Score: liveExp.metrics.f1Score,
          falsePositives: liveExp.metrics.falsePositives,
          falseNegatives: liveExp.metrics.falseNegatives,
          medianResponseTimeSec: liveExp.metrics.analyserMedianResponseSec,
          reductionTargetMet: liveExp.metrics.reductionTargetMet,
          sensitivityTargetMet: liveExp.metrics.sensitivityTargetMet,
          fpTargetMet: liveExp.metrics.fpTargetMet,
          allTargetsMet: liveExp.metrics.allTargetsMet
        },
        targets: {
          nonActionableReduction: { target: 40.0, measured: liveExp.metrics.nonActionableReductionPct, status: liveExp.metrics.reductionTargetMet ? 'PASS' : 'FAIL' },
          highPrioritySensitivity: { target: 95.0, measured: liveExp.metrics.highPrioritySensitivity, status: liveExp.metrics.sensitivityTargetMet ? 'PASS' : 'FAIL' },
          falsePositiveControl: { target: 10.0, measured: parseFloat(((liveExp.metrics.falsePositives / liveExp.metrics.totalBaselineAlerts) * 100).toFixed(1)), status: liveExp.metrics.fpTargetMet ? 'PASS' : 'FAIL' }
        }
      });
    }

    res.json({
      result,
      targets: {
        nonActionableReduction: { target: 40.0, measured: result.nonActionableReductionPct, status: result.reductionTargetMet ? 'PASS' : 'FAIL' },
        highPrioritySensitivity: { target: 95.0, measured: result.highPrioritySensitivity, status: result.sensitivityTargetMet ? 'PASS' : 'FAIL' },
        falsePositiveControl: { target: 10.0, measured: parseFloat(((result.falsePositives / result.baselineAlerts) * 100).toFixed(1)), status: result.fpTargetMet ? 'PASS' : 'FAIL' }
      }
    });
  } catch (error) {
    console.error('Error fetching latest experiment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/experiments - History of all runs
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const experiments = await prisma.experiment.findMany({
      include: { results: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ experiments });
  } catch (error) {
    console.error('Error fetching experiments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/experiments/run - Execute new Baseline vs Analyser experiment
router.post('/run', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      name = 'Ward Telemetry Simulation Run',
      patientCount = 28,
      simulationDuration = 24,
      alertVolume = 2430,
      randomSeed = 42,
      groupingWindowMins = 10,
      thresholds
    } = req.body;

    const userRole = req.userRole || 'Researcher';
    const userName = req.userName || 'Dr. David Aris (Informatics)';

    // Run the actual evaluation engine on generated data
    const execution = runExperiment({
      name,
      patientCount: Number(patientCount),
      simulationDuration: Number(simulationDuration),
      alertVolume: Number(alertVolume),
      randomSeed: Number(randomSeed),
      groupingWindowMins: Number(groupingWindowMins),
      thresholds
    });

    // Save to Database
    const experiment = await prisma.experiment.create({
      data: {
        name,
        description: `Run with seed ${randomSeed}, window ${groupingWindowMins}m, ${patientCount} beds`,
        patientCount: Number(patientCount),
        simulationDuration: Number(simulationDuration),
        alertVolume: Number(alertVolume),
        randomSeed: Number(randomSeed),
        groupingWindowMins: Number(groupingWindowMins),
        thresholdConfig: thresholds ? JSON.stringify(thresholds) : null
      }
    });

    const result = await prisma.experimentResult.create({
      data: {
        experimentId: experiment.id,
        baselineAlerts: execution.metrics.totalBaselineAlerts,
        analyserAlerts: execution.metrics.totalAnalyserAlerts,
        baselineNonActionable: execution.metrics.baselineNonActionable,
        analyserNonActionable: execution.metrics.analyserNonActionable,
        nonActionableReductionPct: execution.metrics.nonActionableReductionPct,
        highPrioritySensitivity: execution.metrics.highPrioritySensitivity,
        precision: execution.metrics.precision,
        recall: execution.metrics.recall,
        f1Score: execution.metrics.f1Score,
        falsePositives: execution.metrics.falsePositives,
        falseNegatives: execution.metrics.falseNegatives,
        medianResponseTimeSec: execution.metrics.analyserMedianResponseSec,
        overrideRate: execution.metrics.analyserOverrideRate,
        reductionTargetMet: execution.metrics.reductionTargetMet,
        sensitivityTargetMet: execution.metrics.sensitivityTargetMet,
        fpTargetMet: execution.metrics.fpTargetMet,
        allTargetsMet: execution.metrics.allTargetsMet,
        confusionMatrixJson: JSON.stringify(execution.metrics.priorityMatrix)
      }
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        user: userName,
        role: userRole,
        action: 'RUN_EXPERIMENT',
        reason: `Executed experiment "${name}" (Seed: ${randomSeed}, Volume: ${alertVolume})`,
        details: JSON.stringify({
          reduction: execution.metrics.nonActionableReductionPct,
          sensitivity: execution.metrics.highPrioritySensitivity,
          allTargetsMet: execution.metrics.allTargetsMet
        })
      }
    });

    res.json({
      experiment,
      result,
      metrics: execution.metrics,
      baseline: execution.baseline,
      analyser: {
        rawAlertCount: execution.analyser.rawAlertCount,
        deduplicatedCount: execution.analyser.deduplicatedCount,
        presentedCount: execution.analyser.presentedAlerts.length,
        criticalCount: execution.analyser.criticalCount,
        highCount: execution.analyser.highCount,
        moderateCount: execution.analyser.moderateCount,
        groupedCount: execution.analyser.groupedCount
      }
    });
  } catch (error) {
    console.error('Error running experiment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
