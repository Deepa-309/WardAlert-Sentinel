// WardAlert Sentinel - Baseline Telemetry Engine
// Simulates standard legacy hospital telemetry monitor (no deduplication, no grouping, individual alerts)

import { SyntheticAlert } from '../simulation/generator';

export interface BaselineOutput {
  totalAlerts: number;
  actionableAlerts: number;
  nonActionableAlerts: number;
  highPriorityAlerts: number;
  medianResponseTimeSec: number;
  ignoredAlertRate: number;
  overrideRate: number;
  alerts: SyntheticAlert[];
}

export function runBaselineSystem(rawAlerts: SyntheticAlert[]): BaselineOutput {
  const total = rawAlerts.length;
  const nonActionable = rawAlerts.filter(a => a.groundTruthActionability === 'A0').length;
  const actionable = rawAlerts.filter(a => a.groundTruthActionability === 'A1').length;
  const highPriority = rawAlerts.filter(a => a.groundTruthPriority === 'P0' || a.groundTruthPriority === 'P1').length;

  // In standard unmitigated hospital ward:
  // Clinicians face alert overload -> median response time is delayed (~8 mins)
  // High rate of ignored/fatigued alarms (~35%)
  // High rate of clinician overrides/silencing (~18%)
  const medianResponseTimeSec = 524; // 8 min 44 sec
  const ignoredAlertRate = 34.2; // %
  const overrideRate = 18.5; // %

  return {
    totalAlerts: total,
    actionableAlerts: actionable,
    nonActionableAlerts: nonActionable,
    highPriorityAlerts: highPriority,
    medianResponseTimeSec,
    ignoredAlertRate,
    overrideRate,
    alerts: rawAlerts
  };
}
