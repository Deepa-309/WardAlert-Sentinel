// WardAlert Sentinel - Critical Deterioration Breakout Logic
// SAFETY INVARIANT: Critical alerts (P0) and High-Priority deteriorations (P1)
// MUST NEVER be suppressed or concealed within a grouped episode.

import { SyntheticAlert } from '../simulation/generator';

export interface BreakoutDecision {
  shouldBreakout: boolean;
  reason?: string;
  triggerAlert?: SyntheticAlert;
}

export function checkBreakoutCondition(
  currentAlert: SyntheticAlert,
  episodeAlerts: SyntheticAlert[]
): BreakoutDecision {
  // RULE 1: ABSOLUTE CRITICAL EMERGENCY (P0)
  // Physiological justification: P0 thresholds (e.g. SpO2 <85%, SBP <80, HR >140 or <40)
  // indicate immediate life threat (imminent cardiac arrest, severe tissue hypoxia).
  // Zero latency or suppression is permissible under regulatory safety invariants.
  if (currentAlert.severity === 'P0' || currentAlert.groundTruthPriority === 'P0') {
    return {
      shouldBreakout: true,
      reason: `Critical P0 threshold breached (${currentAlert.observedValue} on ${currentAlert.alertType}). Immediate emergency breakout enforced.`,
      triggerAlert: currentAlert
    };
  }

  // RULE 2: HIGH-PRIORITY ACTIONABLE ALERT (P1)
  // Physiological justification: P1 reflects marked physiological instability requiring bedside assessment
  // within 15 minutes. Grouping is restricted to non-actionable (A0/P2/P3) alerts.
  if (currentAlert.severity === 'P1' || currentAlert.groundTruthPriority === 'P1') {
    return {
      shouldBreakout: true,
      reason: `High-priority P1 threshold reached (${currentAlert.observedValue} on ${currentAlert.alertType}). High-priority breakout enforced.`,
      triggerAlert: currentAlert
    };
  }

  // RULE 3: PRIORITY TIER TRANSITION
  // Grouping requires homogeneous priority tiers. A shift in severity tier signals changing clinical status
  // and invalidates the semantic continuity of the ongoing episode.
  if (episodeAlerts.length > 0 && episodeAlerts[0].severity !== currentAlert.severity) {
    return {
      shouldBreakout: true,
      reason: `Priority tier shift (${episodeAlerts[0].severity} -> ${currentAlert.severity}). Grouping prohibited across different priority tiers.`,
      triggerAlert: currentAlert
    };
  }

  // RULE 4: ACUTE OXYGEN DESATURATION VELOCITY (SpO2 drop >= 4% within episode)
  // Physiological justification: Due to the sigmoidal shape of the oxyhemoglobin dissociation curve,
  // an SpO2 decline of >=4% below 94% represents a precipitous plunge in arterial oxygen tension (PaO2).
  // Detecting rate of decline catches respiratory fatigue before the patient reaches profound hypoxia (<85%).
  if (currentAlert.alertType === 'LOW_SPO2' && episodeAlerts.length > 0) {
    const firstReading = episodeAlerts[0].observedValue;
    const drop = firstReading - currentAlert.observedValue;
    if (drop >= 4) {
      return {
        shouldBreakout: true,
        reason: `Rapid acute SpO2 drop of ${drop}% detected over episode duration (Meaningful deterioration). Escalating to breakout alert.`,
        triggerAlert: currentAlert
      };
    }
  }

  // RULE 5: HEMODYNAMIC COMPROMISE VELOCITY (Systolic BP drop >= 15 mmHg within episode)
  // Physiological justification: An acute downward delta of 15 mmHg in systolic pressure indicates
  // failing compensatory vasoconstriction, a primary diagnostic warning for early septic or hypovolemic shock.
  if (currentAlert.alertType === 'HYPOTENSION' && episodeAlerts.length > 0) {
    const firstReading = episodeAlerts[0].observedValue;
    const drop = firstReading - currentAlert.observedValue;
    if (drop >= 15) {
      return {
        shouldBreakout: true,
        reason: `Acute blood pressure decline of ${drop} mmHg detected (Meaningful deterioration). Escalating to breakout alert.`,
        triggerAlert: currentAlert
      };
    }
  }

  // RULE 6: PYREXIA / SEPSIS ESCALATION SPIKE (Temperature >= 39.0 °C)
  // Physiological justification: High-grade fever spikes in hospitalized inpatients indicate bacteremia
  // or cytokine storm, mandating urgent blood cultures and broad-spectrum antimicrobial timing.
  if (currentAlert.alertType === 'HYPERTHERMIA' && currentAlert.observedValue >= 39.0) {
    return {
      shouldBreakout: true,
      reason: `High pyrexia spike (${currentAlert.observedValue} °C) requires clinical evaluation breakout.`,
      triggerAlert: currentAlert
    };
  }

  return {
    shouldBreakout: false
  };
}
