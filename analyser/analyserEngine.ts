// WardAlert Sentinel - Unified Alert Fatigue Analyser Engine
// Pipeline: Alert Input -> Grouping -> Priority Engine -> Safety Breakout -> Final Alert

import { SyntheticAlert } from '../simulation/generator';
import { deduplicateAlerts } from './deduplicator';
import { classifyAlertPriority, ThresholdConfig, DEFAULT_THRESHOLDS } from './priorityEngine';
import { generateAlertEvidence } from './evidenceGenerator';
import { groupAlertsTemporally, GroupingResult } from './temporalGrouper';
import { applySafetyBreakoutLayer } from './safetyBreakoutLayer';

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
  safetyBreakoutApplied: boolean;
  rescuedFalseNegativesCount: number;
}

export function runAlertFatigueAnalyser(
  rawAlerts: SyntheticAlert[],
  config: {
    microWindowSeconds?: number;
    groupingWindowMinutes?: number;
    thresholds?: ThresholdConfig;
    enableSafetyBreakout?: boolean;
  } = {}
): AnalyserOutput {
  const microWindow = config.microWindowSeconds ?? 60;
  const groupWindow = config.groupingWindowMinutes ?? 10;
  const thresholds = config.thresholds ?? DEFAULT_THRESHOLDS;
  const enableSafetyBreakout = config.enableSafetyBreakout ?? true;

  // Stage 1: Alert Input (ingestion & micro-window deduplication)
  const dedupResult = deduplicateAlerts(rawAlerts, microWindow);
  const uniqueAlerts = dedupResult.uniqueAlerts;

  // Stage 2: Grouping (Temporal Grouper with configurable 5/10/15/30m window, default 10m)
  const groupingResult = groupAlertsTemporally(uniqueAlerts, groupWindow);

  // Stage 3: Priority Engine (physiological threshold evaluation)
  for (const alert of uniqueAlerts) {
    const classification = classifyAlertPriority(alert.alertType, alert.observedValue, thresholds);
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

  // Stage 4: Safety Breakout Layer
  // SAFETY INVARIANT: Prevent genuine P0/P1 events from being suppressed in grouped episodes or deduplication
  let finalPresentedAlerts = [...groupingResult.presentedAlerts];
  let finalBreakouts = [...groupingResult.breakouts];
  let rescuedFalseNegativesCount = 0;

  if (enableSafetyBreakout) {
    const breakoutResult = applySafetyBreakoutLayer(
      rawAlerts,
      groupingResult.episodes,
      groupingResult.presentedAlerts,
      groupWindow
    );
    finalPresentedAlerts = breakoutResult.finalAlerts;
    finalBreakouts = breakoutResult.breakoutAlerts;
    rescuedFalseNegativesCount = breakoutResult.rescuedFalseNegatives.length;
  }

  // Stage 5: Final Alert & dynamic metric calculation
  let criticalCount = 0;
  let highCount = 0;
  let moderateCount = 0;

  for (const alert of finalPresentedAlerts) {
    if (alert.severity === 'P0') criticalCount++;
    else if (alert.severity === 'P1') highCount++;
    else if (alert.severity === 'P2') moderateCount++;
  }

  // Baseline non-actionable vs Analyser non-actionable
  const baselineNonActionable = rawAlerts.filter(a => a.groundTruthActionability === 'A0').length;
  const presentedNonActionable = finalPresentedAlerts.filter(a => a.groundTruthActionability === 'A0').length;

  const nonActionableReductionPct = baselineNonActionable > 0
    ? parseFloat((((baselineNonActionable - presentedNonActionable) / baselineNonActionable) * 100).toFixed(1))
    : 0;

  // High-priority sensitivity: (presented P0/P1 alerts / total ground truth P0/P1 alerts)
  const totalGTHighPriority = rawAlerts.filter(a => a.groundTruthPriority === 'P0' || a.groundTruthPriority === 'P1').length;
  const presentedHighPriority = finalPresentedAlerts.filter(a => a.groundTruthPriority === 'P0' || a.groundTruthPriority === 'P1').length;

  const highPrioritySensitivity = totalGTHighPriority > 0
    ? parseFloat(((presentedHighPriority / totalGTHighPriority) * 100).toFixed(1))
    : 100.0;

  return {
    rawAlertCount: rawAlerts.length,
    deduplicatedCount: uniqueAlerts.length,
    presentedAlerts: finalPresentedAlerts,
    episodes: groupingResult.episodes,
    criticalCount,
    highCount,
    moderateCount,
    groupedCount: rawAlerts.length - finalPresentedAlerts.length,
    breakouts: finalBreakouts,
    nonActionableReductionPct,
    highPrioritySensitivity,
    safetyBreakoutApplied: enableSafetyBreakout,
    rescuedFalseNegativesCount
  };
}
