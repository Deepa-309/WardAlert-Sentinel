// WardAlert Sentinel - Priority Classification Engine
// Labels: P0 (Critical), P1 (High), P2 (Moderate), P3 (Low)
// Actionability: A1 (Actionable), A0 (Non-actionable)
// Note: "Synthetic demonstration thresholds — not clinically validated."

export interface ThresholdConfig {
  spO2_P0: number; // <85%
  spO2_P1: number; // <90%
  bpSys_P0: number; // <80 mmHg
  bpSys_P1: number; // <90 mmHg
  hr_P0_high: number; // >140 bpm
  hr_P1_high: number; // >120 bpm
  hr_P0_low: number; // <40 bpm
  rr_P0_high: number; // >32 /min
  rr_P1_high: number; // >24 /min
  temp_P0_high: number; // >39.5 C
}

export const DEFAULT_THRESHOLDS: ThresholdConfig = {
  spO2_P0: 85,
  spO2_P1: 90,
  bpSys_P0: 80,
  bpSys_P1: 90,
  hr_P0_high: 140,
  hr_P1_high: 120,
  hr_P0_low: 40,
  rr_P0_high: 32,
  rr_P1_high: 24,
  temp_P0_high: 39.5
};

export interface PriorityEvaluation {
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  actionability: 'A1' | 'A0';
  rationale: string;
  isCritical: boolean;
}

export function classifyAlertPriority(
  alertType: string,
  observedValue: number,
  config: ThresholdConfig = DEFAULT_THRESHOLDS,
  trendContext?: { delta: number; timeSpanMinutes: number }
): PriorityEvaluation {
  switch (alertType) {
    case 'LOW_SPO2':
      if (observedValue < config.spO2_P0) {
        return {
          priority: 'P0',
          actionability: 'A1',
          rationale: `SpO2 ${observedValue}% is below critical threshold (<${config.spO2_P0}%). Immediate respiratory intervention required.`,
          isCritical: true
        };
      } else if (observedValue < config.spO2_P1) {
        return {
          priority: 'P1',
          actionability: 'A1',
          rationale: `SpO2 ${observedValue}% indicates significant hypoxemia (<${config.spO2_P1}%). Escalation recommended.`,
          isCritical: false
        };
      } else if (observedValue <= 92) {
        return {
          priority: 'P2',
          actionability: 'A0',
          rationale: `SpO2 ${observedValue}% reflects mild stable hypoxia. Continuous monitoring indicated.`,
          isCritical: false
        };
      }
      return {
        priority: 'P3',
        actionability: 'A0',
        rationale: `SpO2 ${observedValue}% is near normal reference range.`,
        isCritical: false
      };

    case 'HYPOTENSION':
      if (observedValue < config.bpSys_P0) {
        return {
          priority: 'P0',
          actionability: 'A1',
          rationale: `Systolic BP ${observedValue} mmHg below critical threshold (<${config.bpSys_P0} mmHg). Severe hypoperfusion risk.`,
          isCritical: true
        };
      } else if (observedValue < config.bpSys_P1) {
        return {
          priority: 'P1',
          actionability: 'A1',
          rationale: `Systolic BP ${observedValue} mmHg shows significant hypotension (<${config.bpSys_P1} mmHg).`,
          isCritical: false
        };
      }
      return {
        priority: 'P2',
        actionability: 'A0',
        rationale: `Borderline low systolic BP ${observedValue} mmHg.`,
        isCritical: false
      };

    case 'TACHYCARDIA':
      if (observedValue >= config.hr_P0_high) {
        return {
          priority: 'P0',
          actionability: 'A1',
          rationale: `Heart Rate ${observedValue} bpm exceeds critical limit (>${config.hr_P0_high} bpm). Risk of hemodynamic collapse.`,
          isCritical: true
        };
      } else if (observedValue >= config.hr_P1_high) {
        return {
          priority: 'P1',
          actionability: 'A1',
          rationale: `Heart Rate ${observedValue} bpm shows sustained tachycardia (>${config.hr_P1_high} bpm).`,
          isCritical: false
        };
      }
      return {
        priority: 'P2',
        actionability: 'A0',
        rationale: `Heart Rate ${observedValue} bpm represents moderate elevation.`,
        isCritical: false
      };

    case 'BRADYCARDIA':
      if (observedValue <= config.hr_P0_low) {
        return {
          priority: 'P0',
          actionability: 'A1',
          rationale: `Severe bradycardia ${observedValue} bpm (<= ${config.hr_P0_low} bpm). Immediate pacing/atropine evaluation.`,
          isCritical: true
        };
      }
      return {
        priority: 'P1',
        actionability: 'A1',
        rationale: `Moderate bradycardia ${observedValue} bpm.`,
        isCritical: false
      };

    case 'TACHYPNEA':
      if (observedValue >= config.rr_P0_high) {
        return {
          priority: 'P0',
          actionability: 'A1',
          rationale: `Severe tachypnea ${observedValue} /min (>= ${config.rr_P0_high} /min). Impending respiratory failure.`,
          isCritical: true
        };
      } else if (observedValue >= config.rr_P1_high) {
        return {
          priority: 'P1',
          actionability: 'A1',
          rationale: `Elevated respiratory rate ${observedValue} /min.`,
          isCritical: false
        };
      }
      return {
        priority: 'P2',
        actionability: 'A0',
        rationale: `Mildly elevated respiratory rate ${observedValue} /min.`,
        isCritical: false
      };

    case 'HYPERTHERMIA':
      if (observedValue >= config.temp_P0_high) {
        return {
          priority: 'P0',
          actionability: 'A1',
          rationale: `Extreme pyrexia ${observedValue} °C. Neurological/metabolic stress risk.`,
          isCritical: true
        };
      }
      return {
        priority: 'P2',
        actionability: 'A0',
        rationale: `Elevated body temperature ${observedValue} °C.`,
        isCritical: false
      };

    case 'LEAD_OFF':
    default:
      return {
        priority: 'P3',
        actionability: 'A0',
        rationale: 'Hardware/electrode status advisory.',
        isCritical: false
      };
  }
}
