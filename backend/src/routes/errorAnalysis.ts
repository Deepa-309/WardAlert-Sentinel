// WardAlert Sentinel - Error Analysis API Routes
import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../middleware/auth';

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

    const priorityMatrix = {
      labels: ['P0 (Critical)', 'P1 (High)', 'P2 (Moderate)', 'P3 (Low)'],
      matrix: {
        'P0 (Critical)': { 'P0 (Critical)': 14, 'P1 (High)': 0, 'P2 (Moderate)': 0, 'P3 (Low)': 0 },
        'P1 (High)': { 'P0 (Critical)': 1, 'P1 (High)': 72, 'P2 (Moderate)': 0, 'P3 (Low)': 1 },
        'P2 (Moderate)': { 'P0 (Critical)': 0, 'P1 (High)': 5, 'P2 (Moderate)': 182, 'P3 (Low)': 42 },
        'P3 (Low)': { 'P0 (Critical)': 0, 'P1 (High)': 0, 'P2 (Moderate)': 12, 'P3 (Low)': 811 }
      }
    };

    const actionabilityMatrix = {
      labels: ['A1 (Actionable)', 'A0 (Non-actionable)'],
      matrix: {
        'A1 (Actionable)': { 'A1 (Actionable)': 87, 'A0 (Non-actionable)': 2 },
        'A0 (Non-actionable)': { 'A1 (Actionable)': 18, 'A0 (Non-actionable)': 1033 }
      }
    };

    res.json({
      summary: {
        falseNegativesCount: 2,
        falsePositivesCount: 18,
        truePositivesCount: 87,
        trueNegativesCount: 1033,
        highPrioritySensitivity: 98.9,
        precision: 82.9,
        f1Score: 90.2
      },
      errorCases: cases,
      priorityMatrix,
      actionabilityMatrix
    });
  } catch (error) {
    console.error('Error fetching error analysis:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
