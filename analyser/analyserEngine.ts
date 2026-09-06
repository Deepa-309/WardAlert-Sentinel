// WardAlert Sentinel - Unified Alert Fatigue Analyser Engine
// Orchestrates Deduplication -> Priority Classification -> Evidence Generation -> Temporal Grouping -> Safety Guardrails

import { SyntheticAlert } from '../simulation/generator';
import { deduplicateAlerts } from './deduplicator';
import { classifyAlertPriority, ThresholdConfig, DEFAULT_THRESHOLDS } from './priorityEngine';
import { generateAlertEvidence } from './evidenceGenerator';
import { groupAlertsTemporally, GroupingResult } from './temporalGrouper';

export interface AnalyserOutput {
  rawAlertCount: number;
  deduplicatedCount: number;
  presentedAlerts: SyntheticAlert[];
  episodes: GroupingResult['episodes'];
  criticalCount: number;
  highCount: number;
  moderateCount: number;
  groupedCount: number;
  breakouts: SyntheticAlert[];
  nonActionableReductionPct: number;
  highPrioritySensitivity: number;
}

export function runAlertFatigueAnalyser(
  rawAlerts: SyntheticAlert[],
  config: {
    microWindowSeconds?: number;
    groupingWindowMinutes?: number;
    thresholds?: ThresholdConfig;
  } = {}
): AnalyserOutput {
  const microWindow = config.microWindowSeconds ?? 60;
  const groupWindow = config.groupingWindowMinutes ?? 15;
  const thresholds = config.thresholds ?? DEFAULT_THRESHOLDS;

  // Step 1: Micro-window deduplication
  const dedupResult = deduplicateAlerts(rawAlerts, microWindow);
  const uniqueAlerts = dedupResult.uniqueAlerts;

  // Step 2: Priority classification & evidence attachment
  for (const alert of uniqueAlerts) {
    const classification = classifyAlertPriority(alert.alertType, alert.observedValue, thresholds);
    // Respect ground-truth anchors (P014, P007, P021) or apply engine classification
    if (!alert.evidenceJson && (classification.priority === 'P0' || classification.priority === 'P1')) {
      alert.severity = classification.priority;
      const evidence = generateAlertEvidence(
        alert.alertType,
        alert.observedValue,
        alert.severity,
        [alert.observedValue + 8, alert.observedValue + 5, alert.observedValue + 3, alert.observedValue],
        groupWindow
      );
      alert.evidenceJson = JSON.stringify(evidence);
    }
  }

  // Step 3: Temporal sliding window grouping with Critical Breakout Safety
  const groupingResult = groupAlertsTemporally(uniqueAlerts, groupWindow);

  // Step 4: Calculate metrics
  let criticalCount = 0;
  let highCount = 0;
  let moderateCount = 0;

  for (const alert of groupingResult.presentedAlerts) {
    if (alert.severity === 'P0') criticalCount++;
    else if (alert.severity === 'P1') highCount++;
    else if (alert.severity === 'P2') moderateCount++;
  }

  // Baseline non-actionable vs Analyser non-actionable
  const baselineNonActionable = rawAlerts.filter(a => a.groundTruthActionability === 'A0').length;
  const presentedNonActionable = groupingResult.presentedAlerts.filter(a => a.groundTruthActionability === 'A0').length;

  const nonActionableReductionPct = baselineNonActionable > 0
    ? parseFloat((((baselineNonActionable - presentedNonActionable) / baselineNonActionable) * 100).toFixed(1))
    : 0;

  // High-priority sensitivity (P0/P1 in presentedAlerts vs total ground truth P0/P1)
  const totalGTHighPriority = rawAlerts.filter(a => a.groundTruthPriority === 'P0' || a.groundTruthPriority === 'P1').length;
  const presentedHighPriority = groupingResult.presentedAlerts.filter(a => a.groundTruthPriority === 'P0' || a.groundTruthPriority === 'P1').length;

  const highPrioritySensitivity = totalGTHighPriority > 0
    ? parseFloat(((presentedHighPriority / totalGTHighPriority) * 100).toFixed(1))
    : 100.0;

  return {
    rawAlertCount: rawAlerts.length,
    deduplicatedCount: uniqueAlerts.length,
    presentedAlerts: groupingResult.presentedAlerts,
    episodes: groupingResult.episodes,
    criticalCount,
    highCount,
    moderateCount,
    groupedCount: groupingResult.groupedCount,
    breakouts: groupingResult.breakouts,
    nonActionableReductionPct,
    highPrioritySensitivity
  };
}
