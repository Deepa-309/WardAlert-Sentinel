// WardAlert Sentinel - Clinical Edge Case Scenarios
// 5 specialized edge cases demonstrating safety guardrails and anti-fatigue capabilities.

export interface EdgeCaseScenario {
  id: string;
  name: string;
  category: string;
  description: string;
  patientId: string;
  bed: string;
  expectedBehavior: string;
  timelineEvents: Array<{
    timeOffsetMins: number;
    timeLabel: string;
    vital: string;
    value: number | string;
    rawSignal: string;
    baselineAction: string;
    sentinelAction: string;
    isBreakout?: boolean;
    isSuppressed?: boolean;
    evidenceNotes?: string;
  }>;
  safetyCheck: string;
}

export const EDGE_CASE_SCENARIOS: EdgeCaseScenario[] = [
  {
    id: 'sudden-deterioration',
    name: 'Sudden Deterioration Breakout',
    category: 'Safety Guardrail',
    description: 'Patient in mild hypoxia episode suddenly deteriorates past critical threshold (SpO2 84%). Grouping must NOT hide critical event.',
    patientId: 'P014',
    bed: 'Bed 14',
    expectedBehavior: 'Low-priority episode is automatically broken out into an urgent P0 Critical Alert with prior trend history attached.',
    safetyCheck: 'PASSED: 100% Critical Alert Preservation - Zero Suppression of P0 Event.',
    timelineEvents: [
      {
        timeOffsetMins: -20,
        timeLabel: '16:15',
        vital: 'SpO2',
        value: '92%',
        rawSignal: 'P2 - Mild hypoxia notification',
        baselineAction: 'Fires audible Bedside Alarm #1',
        sentinelAction: 'Initiates Episode EP-P014-SPO2 (Grouped)',
        isBreakout: false
      },
      {
        timeOffsetMins: -15,
        timeLabel: '16:20',
        vital: 'SpO2',
        value: '91%',
        rawSignal: 'P2 - Mild hypoxia notification',
        baselineAction: 'Fires audible Bedside Alarm #2',
        sentinelAction: 'Appends to Episode EP-P014-SPO2 (Count: 2)',
        isBreakout: false
      },
      {
        timeOffsetMins: -10,
        timeLabel: '16:25',
        vital: 'SpO2',
        value: '90%',
        rawSignal: 'P2 - Mild hypoxia notification',
        baselineAction: 'Fires audible Bedside Alarm #3',
        sentinelAction: 'Appends to Episode EP-P014-SPO2 (Count: 3)',
        isBreakout: false
      },
      {
        timeOffsetMins: -5,
        timeLabel: '16:30',
        vital: 'SpO2',
        value: '89%',
        rawSignal: 'P1 - High hypoxia notification',
        baselineAction: 'Fires audible Bedside Alarm #4',
        sentinelAction: 'Flags trend escalation (-3% over 15m)',
        isBreakout: false
      },
      {
        timeOffsetMins: -2,
        timeLabel: '16:33',
        vital: 'SpO2',
        value: '84%',
        rawSignal: 'P0 - Critical hypoxia threshold crossed',
        baselineAction: 'Fires Bedside Alarm #5 (Clinician numb from 4 prior alerts)',
        sentinelAction: 'BREAKS OUT OF GROUP -> Fires P0 Critical Attention Required with 15-min deterioration evidence',
        isBreakout: true,
        evidenceNotes: 'SpO2 84% (<85% threshold), ↓ 8% in 15 min. Full telemetry trend attached.'
      }
    ]
  },
  {
    id: 'sensor-noise',
    name: 'Sensor Noise & Motion Artifact',
    category: 'False Positive Suppression',
    description: 'Patient repositioning causes pulse oximeter probe slippage. Telemetry signal quality flags poor plethysmography waveform with erratic single spikes.',
    patientId: 'P009',
    bed: 'Bed 09',
    expectedBehavior: 'Analyzer checks signal quality flag (deviceStatus: POOR_SIGNAL). Filters spurious nuisance alarm and requests probe re-alignment instead of RRT code.',
    safetyCheck: 'PASSED: Nuisance alarm suppressed without compromising safety verification.',
    timelineEvents: [
      {
        timeOffsetMins: -8,
        timeLabel: '16:26',
        vital: 'SpO2 Waveform',
        value: 'Poor Signal (SQI 18%)',
        rawSignal: 'Motion artifact detected',
        baselineAction: 'No filter applied',
        sentinelAction: 'Logs sensor stability warning (Quality: 18%)',
        isSuppressed: false
      },
      {
        timeOffsetMins: -6,
        timeLabel: '16:28',
        vital: 'SpO2',
        value: '72% (Transient 4s)',
        rawSignal: 'P0 Critical Alarm (Transient Artifact)',
        baselineAction: 'Fires Red Emergency Siren (Wakes patient, distracts nurse)',
        sentinelAction: 'SUPPRESSED from Ward Emergency Queue. Diagnostic flag: "Suspected motion artifact / probe repositioning".',
        isSuppressed: true,
        evidenceNotes: 'Pulse rate unchanged (74 bpm), Perfusion Index <0.1, duration 4 seconds.'
      },
      {
        timeOffsetMins: -4,
        timeLabel: '16:30',
        vital: 'SpO2',
        value: '97%',
        rawSignal: 'Normal waveform restored',
        baselineAction: 'Silent auto-reset without context',
        sentinelAction: 'Telemetry confirmed normal. Saved clinician from false emergency response.',
        isSuppressed: false
      }
    ]
  },
  {
    id: 'missing-data',
    name: 'Missing Telemetry Data Gap',
    category: 'Safety Guardrail',
    description: 'Patient transported for CT scan or telemetry battery depleted, causing a 35-minute observation gap. The system must NOT interpret data silence as clinical recovery.',
    patientId: 'P018',
    bed: 'Bed 18',
    expectedBehavior: 'Displays explicit clinical warning: "Insufficient data — cannot safely determine trend" and flags missing telemetry.',
    safetyCheck: 'PASSED: Zero false reassurance during monitoring outages.',
    timelineEvents: [
      {
        timeOffsetMins: -45,
        timeLabel: '15:50',
        vital: 'Heart Rate',
        value: '112 bpm',
        rawSignal: 'P1 Tachycardia warning',
        baselineAction: 'Fires alert',
        sentinelAction: 'Logs observation trend baseline',
        isBreakout: false
      },
      {
        timeOffsetMins: -35,
        timeLabel: '16:00',
        vital: 'Telemetry Feed',
        value: 'DISCONNECTED',
        rawSignal: 'Signal lost',
        baselineAction: 'Beeps once, then silence (Risk: assumes patient is fine)',
        sentinelAction: 'Flags "Monitoring Gap Active" (35 mins elapsed)',
        isBreakout: false
      },
      {
        timeOffsetMins: -5,
        timeLabel: '16:30',
        vital: 'Heart Rate',
        value: '98 bpm (Single ping)',
        rawSignal: 'Normal range return',
        baselineAction: 'Marks episode as resolved safely',
        sentinelAction: 'HOLDS RESOLUTION: "Insufficient data — cannot safely determine trend. Verify patient status manually."',
        isBreakout: false,
        evidenceNotes: '35 min data dropout precedes reading. Hysteresis check requires 3 consecutive stable observations.'
      }
    ]
  },
  {
    id: 'duplicate-alert-storm',
    name: 'Duplicate Alert Storm Consolidation',
    category: 'Noise Reduction',
    description: 'Multi-parameter central monitor and 2 auxiliary bedside gateways send redundant alerts for the same tachycardia event within 30 seconds.',
    patientId: 'P003',
    bed: 'Bed 03',
    expectedBehavior: 'Consolidates 12 duplicate alarms across gateways into 1 canonical High-Priority Alert within 60s micro-window.',
    safetyCheck: 'PASSED: 92% reduction in duplicate audible interruptions with full gateway trace retained.',
    timelineEvents: [
      {
        timeOffsetMins: -2,
        timeLabel: '16:33:02',
        vital: 'Heart Rate (Monitor A)',
        value: '132 bpm',
        rawSignal: 'P1 Tachycardia',
        baselineAction: 'Alarm #1 Chime',
        sentinelAction: 'Canonical Alert ALT-10003 Created',
        isBreakout: false
      },
      {
        timeOffsetMins: -2,
        timeLabel: '16:33:08',
        vital: 'Heart Rate (Gateway B)',
        value: '131 bpm',
        rawSignal: 'P1 Tachycardia',
        baselineAction: 'Alarm #2 Chime (Pager)',
        sentinelAction: 'Deduplicated into ALT-10003 (+Gateway B ref)',
        isSuppressed: true
      },
      {
        timeOffsetMins: -2,
        timeLabel: '16:33:14',
        vital: 'Heart Rate (Central Station)',
        value: '133 bpm',
        rawSignal: 'P1 Tachycardia',
        baselineAction: 'Alarm #3 Chime (Central)',
        sentinelAction: 'Deduplicated into ALT-10003 (+Station ref)',
        isSuppressed: true
      },
      {
        timeOffsetMins: -2,
        timeLabel: '16:33:20',
        vital: 'Heart Rate (Bedside Repeat)',
        value: '132 bpm',
        rawSignal: 'P1 Tachycardia',
        baselineAction: 'Alarm #4 Chime',
        sentinelAction: 'Deduplicated into ALT-10003 (Total duplicates merged: 11)',
        isSuppressed: true
      }
    ]
  },
  {
    id: 'threshold-boundary',
    name: 'Threshold Boundary Oscillation (Hysteresis)',
    category: 'Anti-Thrashing',
    description: 'Patient SpO2 oscillates right on the 90% threshold (89.9% -> 90.1% -> 89.8% -> 90.2%) over 12 minutes.',
    patientId: 'P012',
    bed: 'Bed 12',
    expectedBehavior: 'Dampened hysteresis algorithm prevents alarm cycling on/off/on/off (8 separate alarms avoided).',
    safetyCheck: 'PASSED: Zero alert thrashing while continuously tracking boundary state.',
    timelineEvents: [
      {
        timeOffsetMins: -12,
        timeLabel: '16:23',
        vital: 'SpO2',
        value: '89.9%',
        rawSignal: 'Threshold cross (<90%)',
        baselineAction: 'Alarm ON #1',
        sentinelAction: 'Alert logged; boundary hysteresis window activated (deadband +/- 1.5%)',
        isBreakout: false
      },
      {
        timeOffsetMins: -9,
        timeLabel: '16:26',
        vital: 'SpO2',
        value: '90.2%',
        rawSignal: 'Threshold cross (>90%)',
        baselineAction: 'Alarm OFF #1',
        sentinelAction: 'Maintained inside boundary deadband (No toggle chime)',
        isSuppressed: true
      },
      {
        timeOffsetMins: -6,
        timeLabel: '16:29',
        vital: 'SpO2',
        value: '89.8%',
        rawSignal: 'Threshold cross (<90%)',
        baselineAction: 'Alarm ON #2',
        sentinelAction: 'Maintained inside boundary deadband (No toggle chime)',
        isSuppressed: true
      },
      {
        timeOffsetMins: -3,
        timeLabel: '16:32',
        vital: 'SpO2',
        value: '90.1%',
        rawSignal: 'Threshold cross (>90%)',
        baselineAction: 'Alarm OFF #2',
        sentinelAction: 'Episode remains unified without nurse pager churn',
        isSuppressed: true
      }
    ]
  }
];
