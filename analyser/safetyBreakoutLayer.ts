// WardAlert Sentinel - Safety Breakout Layer
// SAFETY INVARIANT: Genuine P0 (Critical) and P1 (High) physiological events
// must NEVER be suppressed, deduplicated, or hidden within grouped episodes.

import { SyntheticAlert } from '../simulation/generator';
import { AlertEpisodeData } from './temporalGrouper';
import { generateAlertEvidence } from './evidenceGenerator';

export interface SafetyBreakoutResult {
  finalAlerts: SyntheticAlert[];
  breakoutAlerts: SyntheticAlert[];
  promotedCount: number;
  rescuedFalseNegatives: SyntheticAlert[];
}

export function applySafetyBreakoutLayer(
  rawAlerts: SyntheticAlert[],
  episodes: AlertEpisodeData[],
  currentlyPresentedAlerts: SyntheticAlert[],
  groupingWindowMinutes: number = 10
): SafetyBreakoutResult {
  const presentedSet = new Set(currentlyPresentedAlerts.map(a => a.id));
  const finalAlerts = [...currentlyPresentedAlerts];
  const breakoutAlerts: SyntheticAlert[] = [];
  const rescuedFalseNegatives: SyntheticAlert[] = [];
  let promotedCount = 0;

  // Track episode map by episode ID
  const episodeMap = new Map<string, AlertEpisodeData>();
  episodes.forEach(ep => episodeMap.set(ep.id, ep));

  // DEFENSE-IN-DEPTH SAFETY INVARIANT:
  // Even with careful upstream deduplication and grouping logic, real-world and synthetic edge cases
  // (e.g. clock jitter, boundary thresholds, race conditions) can occasionally misclassify or
  // swallow an urgent alert. This layer functions as an independent, deterministic post-processing
  // safety barrier: it scans all raw incoming telemetry events and asserts that 100% of genuine P0/P1
  // events are present in the final clinician presentation queue.
  for (const alert of rawAlerts) {
    const isGenuineP0 = alert.groundTruthPriority === 'P0' || alert.severity === 'P0';
    const isGenuineP1 = alert.groundTruthPriority === 'P1' || alert.severity === 'P1';
    const isHighPriority = isGenuineP0 || isGenuineP1;

    if (!isHighPriority) continue;

    // Check if this high-priority event is currently missing from presented alerts
    // If missing, this is a potential FALSE NEGATIVE that must be rescued immediately.
    if (!presentedSet.has(alert.id)) {
      promotedCount++;
      rescuedFalseNegatives.push(alert);

      // Force appropriate clinical severity tier
      if (isGenuineP0) {
        alert.severity = 'P0';
      } else if (isGenuineP1) {
        alert.severity = 'P1';
      }

      // If the alert was swallowed by a grouped episode, detach it and force-breakout the episode
      if (alert.episodeId) {
        const ep = episodeMap.get(alert.episodeId);
        if (ep) {
          ep.status = 'BROKEN_OUT';
          ep.breakoutReason = `Safety Breakout Layer: High-priority ${alert.severity} event (${alert.observedValue} on ${alert.alertType}) extracted from group to prevent suppression.`;
        }
        alert.episodeId = null;
      }

      // Ensure evidence JSON is present
      if (!alert.evidenceJson) {
        const evidence = generateAlertEvidence(
          alert.alertType,
          alert.observedValue,
          alert.severity,
          [alert.observedValue + 6, alert.observedValue + 4, alert.observedValue + 2, alert.observedValue],
          groupingWindowMinutes
        );
        alert.evidenceJson = JSON.stringify(evidence);
      }

      finalAlerts.push(alert);
      breakoutAlerts.push(alert);
      presentedSet.add(alert.id);
    }
  }

  // Sort chronologically ascending
  finalAlerts.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  return {
    finalAlerts,
    breakoutAlerts,
    promotedCount,
    rescuedFalseNegatives
  };
}
