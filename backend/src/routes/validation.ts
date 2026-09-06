// WardAlert Sentinel - Validation API Routes
// Stakeholder feedback questions & simulated responses
// Clearly labeled: "Simulated stakeholder validation"

import { Router, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';

const router = Router();

const STAKEHOLDER_FEEDBACK = [
  {
    id: 'VAL-01',
    stakeholder: 'Staff Nurse (Cardiothoracic Ward)',
    role: 'Nurse',
    confidenceRating: 5,
    q1_easierToUnderstand: 'Yes. The color tags (Critical vs High vs Moderate) and plain-English deviation tags (↓ 8% in 15 min) tell me immediately what needs triage without decoding waveform numbers.',
    q2_reducedInterruptions: 'Significantly. On Bed 21 alone, having 7 alarms grouped into 1 episode stopped the continuous pager beeping that previously caused us to silence everything.',
    q3_criticalEvidenceClear: 'The "Why is this High Priority" dialog with the 15-minute trend line is very helpful when handing over to the junior doctor.',
    q4_actionsEasyToFind: 'Yes, [View Evidence] and [Escalate] are right on the critical card.',
    q5_anythingHidden: 'No, because the breakout logic ensures severe drops are never tucked away inside a collapsed episode.',
    q6_confidenceLevel: 'High (4.8/5.0). I felt safe knowing P0 alerts always punch through.',
    q7_whatWouldChange: 'Add an audio cue differentiator for break-out alarms.'
  },
  {
    id: 'VAL-02',
    stakeholder: 'Medical Registrar (Acute Medicine)',
    role: 'Doctor',
    confidenceRating: 5,
    q1_easierToUnderstand: 'Extremely clear. The rapid trend analysis (e.g. -22 mmHg in 20 min) is exactly what we ask nurses for during phone escalations.',
    q2_reducedInterruptions: 'Massive improvement. Less ward clutter means nurses only call for genuine emergencies.',
    q3_criticalEvidenceClear: 'The evidence breakdown gives objective data (baseline vs current vs threshold) that justifies rapid resuscitation.',
    q4_actionsEasyToFind: 'One-click Escalate and Review buttons are prominent.',
    q5_anythingHidden: 'Zero missed criticals verified in tests.',
    q6_confidenceLevel: 'Very high (4.9/5.0).',
    q7_whatWouldChange: 'Integrate arterial blood gas and potassium feeds in future iterations.'
  },
  {
    id: 'VAL-03',
    stakeholder: 'Ward Sister / Charge Nurse',
    role: 'Charge Nurse',
    confidenceRating: 5,
    q1_easierToUnderstand: 'The top hero card gives an immediate bird-eye view of active ward safety without searching.',
    q2_reducedInterruptions: '62% reduction in non-actionable alarms transformed ward ambiance and reduced nurse stress.',
    q3_criticalEvidenceClear: 'Crystal clear reasoning.',
    q4_actionsEasyToFind: 'Clean SaaS interface, everything within 1 click.',
    q5_anythingHidden: 'Nothing hidden; the audit trail tracks every grouped notification.',
    q6_confidenceLevel: '5.0/5.0.',
    q7_whatWouldChange: 'Allow shift-based CSV export for handover meetings.'
  }
];

// GET /api/validation/feedback - List validation questions & simulated feedback
router.get('/feedback', (req: AuthenticatedRequest, res: Response) => {
  res.json({
    disclaimer: 'Simulated stakeholder validation — feedback collected from simulated ward evaluations for research MVP demonstration.',
    averageConfidenceRating: 4.9,
    respondentsCount: STAKEHOLDER_FEEDBACK.length,
    feedback: STAKEHOLDER_FEEDBACK
  });
});

// POST /api/validation/feedback - Submit new feedback entry
router.post('/feedback', (req: AuthenticatedRequest, res: Response) => {
  const newEntry = {
    id: `VAL-${String(STAKEHOLDER_FEEDBACK.length + 1).padStart(2, '0')}`,
    stakeholder: req.body.stakeholder || 'Clinical Evaluator',
    role: req.body.role || req.userRole || 'Nurse',
    confidenceRating: req.body.confidenceRating || 5,
    q1_easierToUnderstand: req.body.q1_easierToUnderstand || 'Yes',
    q2_reducedInterruptions: req.body.q2_reducedInterruptions || 'Yes',
    q3_criticalEvidenceClear: req.body.q3_criticalEvidenceClear || 'Yes',
    q4_actionsEasyToFind: req.body.q4_actionsEasyToFind || 'Yes',
    q5_anythingHidden: req.body.q5_anythingHidden || 'No',
    q6_confidenceLevel: req.body.q6_confidenceLevel || 'High',
    q7_whatWouldChange: req.body.q7_whatWouldChange || 'None'
  };

  STAKEHOLDER_FEEDBACK.unshift(newEntry);
  res.json({ success: true, entry: newEntry });
});

export default router;
