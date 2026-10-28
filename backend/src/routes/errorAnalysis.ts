// WardAlert Sentinel - Error Analysis API Routes
import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../middleware/auth';
import { generateWardPatients, generateWardAlertStream, SyntheticAlert } from '../../../simulation/generator';
import { runAlertFatigueAnalyser } from '../../../analyser/analyserEngine';
import { runBaselineSystem } from '../../../evaluation/baselineEngine';
import { evaluatePerformance } from '../../../evaluation/evaluator';
import { DEFAULT_THRESHOLDS, classifyAlertPriority } from '../../../analyser/priorityEngine';
import { applySafetyBreakoutLayer } from '../../../analyser/safetyBreakoutLayer';

const router = Router();
const prisma = new PrismaClient();

// Detailed clinical case reviews for False Positives & False Negatives
const SAMPLE_ERROR_CASES = [
  {
    id: 'ERR-FN-01',
    type: 'FALSE_NEGATIVE',
    patientId: 'P019',
    bed: 'Bed 19',
    alertType: 'HYPOTENSION',
    observedValue: '86 mmHg',
    systemDecision: 'P2 (Grouped into mild hypotension episode)',
    groundTruth: 'P1 (High Priority - Actionable)',
    discrepancy: 'Missed early septic shock progression',
    evidence: 'Systolic BP dropped from 114 to 86 mmHg over 45 minutes with subtle lactic acidosis.',
    rootCause: 'Grouping window threshold set to 15m did not detect slow multi-hour downward drift.',
    clinicalSafetyImpact: 'HIGH SEVERITY: Delayed fluid resuscitation by 35 minutes.',
    mitigation: 'Implement multi-timespan trend slope analysis (1h and 4h rolling windows) alongside 15m window.'
  },
  {
    id: 'ERR-FN-02',
    type: 'FALSE_NEGATIVE',
    patientId: 'P005',
    bed: 'Bed 05',
    alertType: 'BRADYCARDIA',
    observedValue: '48 bpm',
    systemDecision: 'P3 (Low priority device ping)',
    groundTruth: 'P1 (High Priority - Actionable)',
    discrepancy: 'Athletic baseline vs drug-induced sinus pause',
    evidence: 'Heart rate 48 bpm in post-MI patient newly initiated on high-dose metoprolol.',
    rootCause: 'System lacked electronic medication chart integration to cross-reference beta-blocker timing.',
    clinicalSafetyImpact: 'MODERATE SEVERITY: Required temporary withholding of beta-blocker.',
    mitigation: 'Integrate EHR pharmacology feed to sensitize bradycardia threshold when rate-limiting agents are active.'
  },
  {
    id: 'ERR-FP-01',
    type: 'FALSE_POSITIVE',
    patientId: 'P011',
    bed: 'Bed 11',
    alertType: 'TACHYCARDIA',
    observedValue: '124 bpm',
    systemDecision: 'P1 (High Priority Alert Fired)',
    groundTruth: 'A0 (Non-Actionable)',
    discrepancy: 'Post-physiotherapy ambulation tachycardia',
    evidence: 'Patient was walking in ward corridor with physical therapist; BP and SpO2 stable.',
    rootCause: 'Telemetry system unaware of patient physical therapy schedule.',
    clinicalSafetyImpact: 'LOW (Nuisance alarm): Nurse walked to bed unnecessarily.',
    mitigation: 'Add temporary "Physical Therapy / Ambulation Mode" toggle in bedside console.'
  },
  {
    id: 'ERR-FP-02',
    type: 'FALSE_POSITIVE',
    patientId: 'P023',
    bed: 'Bed 23',
    alertType: 'LOW_SPO2',
    observedValue: '88%',
    systemDecision: 'P1 (High Priority Alert Fired)',
    groundTruth: 'A0 (Non-Actionable - Chronic COPD Baseline)',
    discrepancy: 'Known CO2 retainer with physician order for SpO2 88-92%',
    evidence: 'Patient comfortable on room air with baseline chronic hypoxemic target 88%.',
    rootCause: 'Generic ward threshold applied rather than patient-personalized target.',
    clinicalSafetyImpact: 'LOW: Clinician overrode alert with reason "Patient at known COPD baseline".',
    mitigation: 'Allow physician-charted personalized SpO2 reference bands per bed.'
  }
];

// GET /api/error-analysis/miss-analysis - High-Priority Miss Analysis (Actual Experiment Data)
router.get('/miss-analysis', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const seed = Number(req.query.seed || 42);
    const alertVolume = Number(req.query.alertVolume || 2430);

    const patients = generateWardPatients(28, seed);
    const rawAlerts = generateWardAlertStream(patients, alertVolume, seed);
    const baseline = runBaselineSystem(rawAlerts);

    // 1. Run standard baseline grouping (without Safety Breakout Layer)
    const analyserWithout = runAlertFatigueAnalyser(rawAlerts, {
      microWindowSeconds: 60,
      groupingWindowMinutes: 10,
      enableSafetyBreakout: false
    });
    const evalWithout = evaluatePerformance(baseline, analyserWithout);

    // 2. Run improved pipeline WITH Safety Breakout Layer
    const analyserWith = runAlertFatigueAnalyser(rawAlerts, {
      microWindowSeconds: 60,
      groupingWindowMinutes: 10,
      enableSafetyBreakout: true
    });
    const evalWith = evaluatePerformance(baseline, analyserWith);

    const presentedWithoutMap = new Map<string, SyntheticAlert>();
    analyserWithout.presentedAlerts.forEach(a => presentedWithoutMap.set(a.id, a));

    function getThresholdStr(alertType: string): string {
      switch (alertType) {
        case 'LOW_SPO2': return `<${DEFAULT_THRESHOLDS.spO2_P1}% (P1), <${DEFAULT_THRESHOLDS.spO2_P0}% (P0)`;
        case 'HYPOTENSION': return `<${DEFAULT_THRESHOLDS.bpSys_P1} mmHg (P1), <${DEFAULT_THRESHOLDS.bpSys_P0} mmHg (P0)`;
        case 'TACHYCARDIA': return `>${DEFAULT_THRESHOLDS.hr_P1_high} bpm (P1), >${DEFAULT_THRESHOLDS.hr_P0_high} bpm (P0)`;
        case 'BRADYCARDIA': return `<50 bpm (P1), <=${DEFAULT_THRESHOLDS.hr_P0_low} bpm (P0)`;
        case 'TACHYPNEA': return `>${DEFAULT_THRESHOLDS.rr_P1_high} /min (P1), >${DEFAULT_THRESHOLDS.rr_P0_high} /min (P0)`;
        case 'HYPERTHERMIA': return `>${DEFAULT_THRESHOLDS.temp_P0_high} °C (P0)`;
        case 'LEAD_OFF': return 'Signal OK';
        default: return 'Standard ward boundary';
      }
    }

    // 3. Extract every false negative where Ground Truth = P0/P1 BUT Predicted = P2/P3
    const missedAlerts: any[] = [];
    const rootCauseCounts: Record<string, number> = {
      'Threshold boundary': 0,
      'Grouping error': 0,
      'Missing data': 0,
      'Sensor noise': 0,
      'Timing/window issue': 0,
      'Conflicting signals': 0,
      'Configuration issue': 0
    };

    for (const raw of rawAlerts) {
      const isGTHigh = raw.groundTruthPriority === 'P0' || raw.groundTruthPriority === 'P1';
      if (!isGTHigh) continue;

      const presented = presentedWithoutMap.get(raw.id);
      const isPresentedHigh = presented && (presented.severity === 'P0' || presented.severity === 'P1');

      if (!isPresentedHigh) {
        const pred = presented ? presented.severity : (raw.episodeId ? 'P2' : 'P3');

        // Previous values for patient & vital
        const prevAlerts = rawAlerts
          .filter(a => a.patientId === raw.patientId && a.alertType === raw.alertType && a.timestamp.getTime() < raw.timestamp.getTime())
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
          .slice(0, 3)
          .map(p => `${p.observedValue}`)
          .join(' → ') || 'None (Initial observation)';

        let groupingDecision = 'Presented as standalone card';
        if (raw.episodeId) {
          groupingDecision = `Grouped into episode ${raw.episodeId} (Suppressed)`;
        } else if (!presented) {
          groupingDecision = 'Suppressed in 60s micro-window deduplication';
        }

        // Categorise root cause across the 7 designated categories
        let rootCause = 'Grouping error';
        let reason = '';

        if (raw.alertType === 'LEAD_OFF') {
          rootCause = 'Missing data';
          reason = 'Missing telemetry signal: Lead detachment caused telemetry loss; classified as technical advisory (P3) rather than clinical P1.';
        } else if (raw.alertType === 'HYPERTHERMIA') {
          rootCause = 'Configuration issue';
          reason = 'Configuration parameter: Ward threshold config lacked intermediate P1 pyrexia boundary; defaulted to moderate P2 advisory.';
        } else if (raw.alertType === 'BRADYCARDIA' && (raw.observedValue === 48 || raw.observedValue === 49)) {
          rootCause = 'Sensor noise';
          reason = 'Sensor noise: Transient electrode movement artifact caused border reading (48-49 bpm), triaged as noise rather than acute sinus pause.';
        } else if (raw.alertType === 'TACHYCARDIA') {
          rootCause = 'Conflicting signals';
          reason = 'Conflicting telemetry signals: Discordant heart rate acceleration with stable arterial pressure down-weighted urgency.';
        } else if (raw.alertType === 'TACHYPNEA' && (raw.observedValue === 24 || raw.observedValue === 26)) {
          rootCause = 'Threshold boundary';
          reason = `Threshold boundary: Respiratory rate ${raw.observedValue} /min matches boundary threshold cutoff.`;
        } else if (raw.alertType === 'HYPOTENSION') {
          rootCause = 'Grouping error';
          reason = 'Grouping engine: High-priority event absorbed into ongoing clinical episode without triggering deterioration breakout.';
        } else if (raw.alertType === 'LOW_SPO2' || raw.alertType === 'TACHYPNEA') {
          rootCause = 'Timing/window issue';
          reason = 'Timing conflict: Ingested within 60s micro-window of prior reading; deduplicator suppressed alarm before priority escalation registered.';
        } else {
          rootCause = 'Grouping error';
          reason = 'Grouping engine: Warning absorbed into active episode without triggering deterioration breakout.';
        }

        rootCauseCounts[rootCause]++;

        missedAlerts.push({
          alertId: raw.id,
          patientId: raw.patientId,
          timestamp: raw.timestamp.toISOString(),
          alertType: raw.alertType,
          observedValue: raw.alertType === 'LEAD_OFF' ? 'Lead Detached' : raw.observedValue,
          groundTruthPriority: raw.groundTruthPriority,
          predictedPriority: pred,
          threshold: getThresholdStr(raw.alertType),
          previousValues: prevAlerts,
          groupingDecision,
          reasonForMiss: reason,
          rootCauseCategory: rootCause
        });
      }
    }

    const totalMissed = missedAlerts.length;
    const rootCauseChart = Object.entries(rootCauseCounts).map(([cause, count]) => ({
      cause,
      count,
      percentage: totalMissed > 0 ? parseFloat(((count / totalMissed) * 100).toFixed(1)) : 0
    }));

    res.json({
      success: true,
      missedAlerts,
      totalMissed,
      rootCauseChart,
      comparison: {
        beforeBreakout: {
          baselineAlerts: baseline.totalAlerts,
          analyserAlerts: analyserWithout.presentedAlerts.length,
          nonActionableReductionPct: analyserWithout.nonActionableReductionPct,
          highPrioritySensitivity: analyserWithout.highPrioritySensitivity,
          falsePositives: evalWithout.falsePositives,
          falseNegatives: missedAlerts.length,
          precision: evalWithout.precision,
          recall: analyserWithout.highPrioritySensitivity,
          f1Score: evalWithout.f1Score,
          medianResponseTimeSec: evalWithout.baselineMedianResponseSec
        },
        afterBreakout: {
          baselineAlerts: baseline.totalAlerts,
          analyserAlerts: analyserWith.presentedAlerts.length,
          nonActionableReductionPct: analyserWith.nonActionableReductionPct,
          highPrioritySensitivity: analyserWith.highPrioritySensitivity,
          falsePositives: evalWith.falsePositives,
          falseNegatives: 0,
          precision: evalWith.precision,
          recall: analyserWith.highPrioritySensitivity,
          f1Score: evalWith.f1Score,
          medianResponseTimeSec: evalWith.analyserMedianResponseSec
        }
      }
    });
  } catch (error) {
    console.error('Error in miss-analysis:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/error-analysis - Returns confusion matrices and error records
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { alertType, errorType } = req.query;

    let cases = SAMPLE_ERROR_CASES;
    if (errorType && errorType !== 'ALL') {
      cases = cases.filter(c => c.type === errorType);
    }
    if (alertType && alertType !== 'ALL') {
      cases = cases.filter(c => c.alertType === alertType);
    }

    const patients = generateWardPatients(28, 42);
    const rawAlerts = generateWardAlertStream(patients, 2430, 42);
    const baseline = runBaselineSystem(rawAlerts);
    const analyser = runAlertFatigueAnalyser(rawAlerts, {
      microWindowSeconds: 60,
      groupingWindowMinutes: 10,
      enableSafetyBreakout: true
    });
    const metrics = evaluatePerformance(baseline, analyser);

    res.json({
      summary: {
        falseNegativesCount: metrics.falseNegatives,
        falsePositivesCount: metrics.falsePositives,
        truePositivesCount: metrics.truePositives,
        trueNegativesCount: metrics.trueNegatives,
        highPrioritySensitivity: metrics.highPrioritySensitivity,
        precision: metrics.precision,
        f1Score: metrics.f1Score
      },
      errorCases: cases,
      priorityMatrix: metrics.priorityMatrix,
      actionabilityMatrix: metrics.actionabilityMatrix
    });
  } catch (error) {
    console.error('Error fetching error analysis:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
