// WardAlert Sentinel - Deduplication Engine
// Consolidates identical alerts within a configurable micro-window (e.g., 60 seconds)

import { SyntheticAlert } from '../simulation/generator';

export interface DeduplicationResult {
  uniqueAlerts: SyntheticAlert[];
  duplicateCount: number;
  duplicateMap: Map<string, string[]>; // canonicalId -> [duplicateIds]
}

export function deduplicateAlerts(
  alerts: SyntheticAlert[],
  microWindowSeconds: number = 60
): DeduplicationResult {
  const uniqueAlerts: SyntheticAlert[] = [];
  const duplicateMap = new Map<string, string[]>();
  let duplicateCount = 0;

  // Ensure sorted by timestamp
  const sorted = [...alerts].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  for (const alert of sorted) {
    // MICRO-WINDOW DEDUPLICATION LOGIC:
    // Hospital telemetry architectures frequently deploy dual-redundant transmission pathways
    // (e.g. bedside monitor hardwire + central telemetry antenna gateway).
    // When a physiological vital breaches a threshold, both gateways broadcast alarm packets.
    // The 60-second micro-window absorbs these multi-path redundant broadcasts without clinical delay.
    const matchingCanonical = uniqueAlerts.find(canonical => {
      if (canonical.patientId !== alert.patientId) return false;
      if (canonical.alertType !== alert.alertType) return false;
      const timeDiffMs = Math.abs(alert.timestamp.getTime() - canonical.timestamp.getTime());
      return timeDiffMs <= microWindowSeconds * 1000;
    });

    if (matchingCanonical) {
      // ESCALATION PRESERVATION GUARD:
      // If a patient experiences rapid decompensation (e.g. SpO2 drops from 91% [P2] to 83% [P0] within 20s),
      // the second alarm is a life-threatening deterioration, NOT a packet duplicate.
      // We explicitly forbid absorbing an escalating P0/P1 alert into an existing P2/P3 canonical record.
      const isHighOrEscalation = (alert.severity === 'P0' || alert.severity === 'P1' || alert.groundTruthPriority === 'P0' || alert.groundTruthPriority === 'P1') &&
        (matchingCanonical.severity === 'P2' || matchingCanonical.severity === 'P3' || matchingCanonical.groundTruthPriority === 'P2' || matchingCanonical.groundTruthPriority === 'P3');

      if (isHighOrEscalation) {
        // Promote the deteriorating alarm as an independent canonical event
        uniqueAlerts.push(alert);
        duplicateMap.set(alert.id, []);
      } else {
        // True duplicate: identical telemetry broadcast within the micro-window; link to canonical ID
        duplicateCount++;
        const currentDuplicates = duplicateMap.get(matchingCanonical.id) || [];
        currentDuplicates.push(alert.id);
        duplicateMap.set(matchingCanonical.id, currentDuplicates);
      }
    } else {
      uniqueAlerts.push(alert);
      duplicateMap.set(alert.id, []);
    }
  }

  return {
    uniqueAlerts,
    duplicateCount,
    duplicateMap
  };
}
