// WardAlert Sentinel - Demo Scenario Engine (10-Step Interactive Sequence)
import { Router, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

export interface DemoStep {
  stepIndex: number;
  stage: string;
  title: string;
  subtitle: string;
  description: string;
  details: string;
  impact: string;
  visualHighlight: string;
  evidenceData?: any;
  auditAction?: string;
}

export const DEMO_STEPS: DemoStep[] = [
  {
    stepIndex: 1,
    stage: 'Alert Storm Generation',
    title: 'Generate Repetitive Alerts',
    subtitle: 'Bedside Telemetry Spike on Bed 21',
    description: 'Patient P021 (Bed 21) experiences borderline oxygen saturation. 7 repetitive bedside telemetry alarms fire in rapid succession.',
    details: 'Readings between 90-92% trigger repetitive baseline alarms at 10:04, 10:07, 10:10, 10:13, 10:16, 10:19, and 10:22.',
    impact: 'Sensory fatigue baseline: 7 noisy auditory interruptions.',
    visualHighlight: 'Flash bedside notifications on Bed 21 telemetry channel.',
    auditAction: 'DEMO_STARTED'
  },
  {
    stepIndex: 2,
    stage: 'Temporal Clustering',
    title: 'Group Repetitive Alerts',
    subtitle: 'Sentinel Grouping Algorithm Engaged',
    description: 'The Sentinel Analyser detects repetitive non-critical notifications from the same sensor and consolidates them into Episode EP-P021-SPO2.',
    details: 'Sliding 15-minute window clusters the 7 alarms, eliminating 6 redundant notifications.',
    impact: 'Reduces nuisance alarms on Bed 21 by 85%.',
    visualHighlight: 'Consolidation animation in Grouped Repetitive Alerts section.'
  },
  {
    stepIndex: 3,
    stage: 'Metric Synchronization',
    title: 'Update Grouped Alert Count',
    subtitle: 'Dashboard Reflects Noise Reduction',
    description: 'Grouped alerts counter updates dynamically across all summary cards. Clinicians see 1 clear episode instead of 7 interruptions.',
    details: 'The Grouped Alerts badge increments, showing 7 alarms consolidated into 1 active episode.',
    impact: 'Grouped alerts count increases; cognitive overload avoided.',
    visualHighlight: 'Grouped alerts metric card increments dynamically.'
  },
  {
    stepIndex: 4,
    stage: 'Acute Deterioration',
    title: 'Generate Sudden Critical Deterioration',
    subtitle: 'Severe SpO2 Plunge on Bed 14 (P014)',
    description: 'Patient P014 (Bed 14) experiences acute respiratory decompensation. SpO2 drops sharply from 92% to 84% in 15 minutes.',
    details: 'Prior stable readings [93%, 92%, 92%, 93%, 92%] followed by acute plunge to 84% (critical threshold <85%).',
    impact: 'Active Critical alert created; immediate medical intervention mandatory.',
    visualHighlight: 'Red deterioration pulse on Bed 14.'
  },
  {
    stepIndex: 5,
    stage: 'Safety Guardrail Activated',
    title: 'Critical Alert Breaks Through Grouping',
    subtitle: 'Safety Invariant: P0 Never Suppressed',
    description: 'SAFETY INVARIANT ACTIVATED: Grouping engine halts and forcibly BREAKS OUT the 84% critical alert into the Critical Attention queue.',
    details: 'Even during an active episode or repetitive background alarms, the critical event is isolated and elevated immediately.',
    impact: 'Zero suppression of emergency events. 100% sensitivity guaranteed.',
    visualHighlight: 'Breakout banner displayed; emergency alert elevated to priority queue.'
  },
  {
    stepIndex: 6,
    stage: 'Notification Broadcast',
    title: 'Notification Badge Increases',
    subtitle: 'Urgent Unread Counter Increments',
    description: 'The top notification bell increments dynamically to reflect the unread critical emergency.',
    details: 'Clinicians across the ward receive high-priority alert notification in header and status panels.',
    impact: 'Notification badge increments by +1; visual attention drawn.',
    visualHighlight: 'Red notification bell badge updates.'
  },
  {
    stepIndex: 7,
    stage: 'Console Highlighting',
    title: 'Critical Alert on Dashboard & Live Alerts',
    subtitle: 'Primary Clinical Visibility',
    description: 'Alert ALT-10014 appears at the top of "Critical attention required" and on the Live Alerts page.',
    details: 'Patient P014 • Bed 14 • SpO2 84% (↓ 8% in 15 min) highlighted with urgent red status and "View Evidence" / "Escalate" buttons.',
    impact: 'Immediate situational awareness for all attending clinicians.',
    visualHighlight: 'Card 1 in Critical Attention glows with active P0 indicator.'
  },
  {
    stepIndex: 8,
    stage: 'Explainable AI Evidence',
    title: 'Clinician Opens Evidence',
    subtitle: 'Transparent Trend & Clinical Rationale',
    description: 'Attending clinician opens the explainable evidence panel to review trajectory, threshold delta, and plain-language guidance.',
    details: 'Displays prior sequence [93, 92, 92, 93, 92, 84%], critical threshold <85%, rapid deterioration trend, and recommendation to notify registrar.',
    impact: 'Evidence viewed and logged into audit trail for clinical governance.',
    visualHighlight: 'Clinical Evidence Audit panel opened.',
    auditAction: 'ALERT_VIEWED'
  },
  {
    stepIndex: 9,
    stage: 'Clinical Escalation',
    title: 'Clinician Escalates to Medical Registrar',
    subtitle: '1-Click Rapid Response Team Dispatch',
    description: 'Clinician clicks [Escalate]. Rapid Response Team (RRT) alert dispatched with 1-click clinical telemetry handover.',
    details: 'Emergency alert dispatched to Registrar on-call. Status updates from UNACKNOWLEDGED to ESCALATED.',
    impact: 'Response time reduced to 2m 14s (vs 8m 44s legacy delay).',
    visualHighlight: 'Status badge changes to ESCALATED in red.',
    auditAction: 'ALERT_ESCALATED'
  },
  {
    stepIndex: 10,
    stage: 'Clinical Resolution',
    title: 'Record Clinical Outcome',
    subtitle: 'Patient Stabilized & Audit Sealed',
    description: 'Medical registrar arrives within 3 minutes; 4L high-flow oxygen cannula administered. Patient SpO2 stabilizes at 95%.',
    details: 'Clinical outcome recorded as "RESOLVED_SAFE - Patient stabilized with High-Flow O2". Audit trail sealed.',
    impact: 'Complete medico-legal audit trail sealed; ward telemetry metrics updated.',
    visualHighlight: 'Outcome resolution badge green (SAFE TARGET MET).',
    auditAction: 'OUTCOME_RESOLVED_SAFE'
  }
];

// Ensure required demonstration patients exist
async function ensurePatientsExist() {
  const p014 = await prisma.patient.findUnique({ where: { id: 'P014' } });
  if (!p014) {
    await prisma.patient.create({
      data: {
        id: 'P014',
        bed: 'Bed 14',
        age: 68,
        gender: 'M',
        syntheticDiagnosis: 'Acute Exacerbation of COPD',
        riskLevel: 'CRITICAL',
        baselineSpO2: 95.0,
        baselineHR: 82,
        baselineBPSys: 130
      }
    });
  }

  const p021 = await prisma.patient.findUnique({ where: { id: 'P021' } });
  if (!p021) {
    await prisma.patient.create({
      data: {
        id: 'P021',
        bed: 'Bed 21',
        age: 54,
        gender: 'F',
        syntheticDiagnosis: 'Post-operative Recovery (Abdominal)',
        riskLevel: 'MODERATE',
        baselineSpO2: 97.0,
        baselineHR: 76,
        baselineBPSys: 118
      }
    });
  }
}

// GET /api/demo/steps - Get all 10 steps
router.get('/steps', (req: AuthenticatedRequest, res: Response) => {
  res.json({ steps: DEMO_STEPS, totalSteps: DEMO_STEPS.length });
});

// POST /api/demo/run-step/:stepIndex or /api/demo/run-step - Execute specific simulation step & persist state
router.post(['/run-step/:stepIndex', '/run-step'], async (req: AuthenticatedRequest, res: Response) => {
  try {
    await ensurePatientsExist();
    const stepIdx = parseInt(String(req.params.stepIndex || req.body.step || req.body.stepIndex || 1), 10);
    const step = DEMO_STEPS.find(s => s.stepIndex === stepIdx);

    if (!step) {
      return res.status(404).json({ error: 'Step not found' });
    }

    const userName = req.userName || 'Sister Emma Vance (RN)';
    const userRole = req.userRole || 'Charge Nurse';
    const now = new Date();

    // Perform database operations matching each simulation step
    switch (stepIdx) {
      case 1: {
        // Step 1: Generate repetitive alerts on P021
        await prisma.auditLog.create({
          data: {
            user: userName,
            role: userRole,
            action: 'DEMO_STARTED',
            reason: 'Interactive Clinical Simulation initiated',
            details: JSON.stringify({ scenario: 'Oxygen Deterioration & Breakout Safeguard', step: 1 })
          }
        });

        // Create 7 mild alerts
        for (let i = 0; i < 7; i++) {
          const alertId = `ALT-DEMO-P021-${i + 1}`;
          const alertTime = new Date(now.getTime() - (20 - i * 3) * 60 * 1000);
          await prisma.alert.upsert({
            where: { id: alertId },
            update: {
              clinicianResponse: 'UNACKNOWLEDGED',
              observedValue: 91,
              timestamp: alertTime,
              episodeId: null
            },
            create: {
              id: alertId,
              patientId: 'P021',
              timestamp: alertTime,
              alertType: 'LOW_SPO2',
              source: 'Bedside Pulse Oximeter',
              severity: 'P2',
              observedValue: 91,
              referenceRange: '>=92%',
              deviation: 'Borderline mild hypoxia',
              context: 'Mild SpO2 notification',
              groundTruthPriority: 'P2',
              groundTruthActionability: 'A0',
              clinicianResponse: 'UNACKNOWLEDGED'
            }
          });
        }
        break;
      }

      case 2:
      case 3: {
        // Step 2 & 3: Group repetitive alerts into episode EP-P021-SPO2
        const epId = 'EP-P021-SPO2';
        await prisma.alertEpisode.upsert({
          where: { id: epId },
          update: {
            status: 'ACTIVE',
            alertCount: 7,
            updatedAt: new Date()
          },
          create: {
            id: epId,
            patientId: 'P021',
            alertType: 'LOW_SPO2',
            status: 'ACTIVE',
            alertCount: 7,
            startTime: new Date(now.getTime() - 20 * 60 * 1000),
            representativeAlertId: 'ALT-DEMO-P021-1'
          }
        });

        // Link the 7 alerts to this episode
        for (let i = 0; i < 7; i++) {
          const alertId = `ALT-DEMO-P021-${i + 1}`;
          await prisma.alert.update({
            where: { id: alertId },
            data: { episodeId: epId }
          }).catch(() => {});
        }
        break;
      }

      case 4:
      case 5:
      case 6:
      case 7: {
        // Sudden deterioration in P014 -> Critical breakout alert
        const evidenceJson = JSON.stringify({
          currentValue: '84%',
          threshold: '<85%',
          previousObservations: ['93%', '92%', '92%', '93%', '92%', '84%'],
          trend: 'Rapid deterioration (-8% in 15 min)',
          duration: '15 minutes',
          supportingObservations: 6,
          reason: 'Critical threshold crossed after persistent deterioration.',
          clinicalImplication: 'Severe acute hypoxemia with risk of acute tissue hypoperfusion.',
          recommendedAction: 'Immediate high-flow oxygen, airway evaluation, notify Medical Registrar / RRT.'
        });

        await prisma.alert.upsert({
          where: { id: 'ALT-10014' },
          update: {
            observedValue: 84,
            severity: 'P0',
            timestamp: new Date(),
            clinicianResponse: 'UNACKNOWLEDGED',
            episodeId: null, // BREAKOUT: never grouped
            deviation: '↓ 8% in 15 min',
            context: 'Oxygen deterioration',
            evidenceJson
          },
          create: {
            id: 'ALT-10014',
            patientId: 'P014',
            timestamp: new Date(),
            alertType: 'LOW_SPO2',
            source: 'Bedside Monitor',
            severity: 'P0',
            observedValue: 84,
            referenceRange: '>=92%',
            deviation: '↓ 8% in 15 min',
            context: 'Oxygen deterioration',
            groundTruthPriority: 'P0',
            groundTruthActionability: 'A1',
            clinicianResponse: 'UNACKNOWLEDGED',
            evidenceJson
          }
        });
        break;
      }

      case 8: {
        // Step 8: View Evidence
        await prisma.auditLog.create({
          data: {
            user: userName,
            role: userRole,
            action: 'ALERT_VIEWED',
            alertId: 'ALT-10014',
            reason: 'Clinician reviewed 15-minute SpO2 trajectory and explainable evidence for P014',
            details: JSON.stringify({ patientId: 'P014', vital: 'SpO2', value: '84%' })
          }
        });
        break;
      }

      case 9: {
        // Step 9: Escalate to Registrar
        await prisma.alert.update({
          where: { id: 'ALT-10014' },
          data: {
            clinicianResponse: 'ESCALATED',
            responseTimestamp: new Date()
          }
        });

        await prisma.clinicianResponse.create({
          data: {
            alertId: 'ALT-10014',
            clinicianRole: userRole,
            action: 'ESCALATE',
            overrideReason: 'Severe acute SpO2 deterioration to 84%; RRT emergency dispatch',
            responseTimeSeconds: 134
          }
        });

        await prisma.auditLog.create({
          data: {
            user: userName,
            role: userRole,
            action: 'ALERT_ESCALATED',
            alertId: 'ALT-10014',
            reason: 'Sister Emma Vance escalated Patient P014 to Medical Registrar on-call',
            details: JSON.stringify({ handover: 'Rapid Response Team alert dispatched with telemetry snippet.' })
          }
        });
        break;
      }

      case 10: {
        // Step 10: Record Outcome
        await prisma.alert.update({
          where: { id: 'ALT-10014' },
          data: {
            outcome: 'RESOLVED_SAFE - Patient stabilized with High-Flow O2; SpO2 recovered to 95%',
            resolutionTimestamp: new Date()
          }
        });

        await prisma.outcome.create({
          data: {
            alertId: 'ALT-10014',
            outcomeType: 'RESOLVED_SAFE',
            notes: '4L High-flow oxygen cannula administered by Registrar; patient stabilized.',
            resolvedByRole: 'Doctor'
          }
        });

        await prisma.auditLog.create({
          data: {
            user: 'Dr. Michael Chen',
            role: 'Doctor',
            action: 'OUTCOME_RECORDED',
            alertId: 'ALT-10014',
            reason: 'Patient stabilized with High-Flow O2; SpO2 recovered to 95%',
            details: JSON.stringify({ outcome: 'RESOLVED_SAFE', targetMet: true })
          }
        });
        break;
      }
    }

    res.json({
      success: true,
      currentStep: step,
      nextStepIndex: stepIdx < DEMO_STEPS.length ? stepIdx + 1 : null,
      isComplete: stepIdx === DEMO_STEPS.length
    });
  } catch (error) {
    console.error('Error running demo step:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/demo/reset - Reset demo scenario to initial state
router.post('/reset', async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Reset P014 alert back to unacknowledged
    await prisma.alert.updateMany({
      where: { id: 'ALT-10014' },
      data: {
        clinicianResponse: 'UNACKNOWLEDGED',
        observedValue: 84,
        severity: 'P0'
      }
    });

    res.json({ success: true, message: 'Demo scenario reset to initial state' });
  } catch (error) {
    console.error('Error resetting demo:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
