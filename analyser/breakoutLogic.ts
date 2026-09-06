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
  // Rule 1: Any P0 Critical alert MUST immediately break out of any group
  if (currentAlert.severity === 'P0' || currentAlert.groundTruthPriority === 'P0') {
    return {
      shouldBreakout: true,
      reason: `Critical P0 threshold breached (${currentAlert.observedValue} on ${currentAlert.alertType}). Immediate emergency breakout enforced.`,
      triggerAlert: currentAlert
    };
  }

  // Rule 2: Worsening trend transition (e.g. P2 -> P1 escalation)
  if (currentAlert.severity === 'P1' && episodeAlerts.every(a => a.severity === 'P2' || a.severity === 'P3')) {
    return {
      shouldBreakout: true,
      reason: `Severity escalation from moderate/low to P1 High Priority (${currentAlert.observedValue} on ${currentAlert.alertType}). Breakout enforced.`,
      triggerAlert: currentAlert
    };
  }

  // Rule 3: Rapid drop in SpO2 (e.g. drop >= 5% within 15 minutes)
  if (currentAlert.alertType === 'LOW_SPO2' && episodeAlerts.length > 0) {
    const firstReading = episodeAlerts[0].observedValue;
    const drop = firstReading - currentAlert.observedValue;
    if (drop >= 5) {
      return {
        shouldBreakout: true,
        reason: `Rapid acute SpO2 drop of ${drop}% detected over episode duration. Escalating to breakout alert.`,
        triggerAlert: currentAlert
      };
    }
  }

  return {
    shouldBreakout: false
  };
}
