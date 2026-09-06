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
    // Check if there is an existing recent alert with same patient and alertType
    const matchingCanonical = uniqueAlerts.find(canonical => {
      if (canonical.patientId !== alert.patientId) return false;
      if (canonical.alertType !== alert.alertType) return false;
      const timeDiffMs = Math.abs(alert.timestamp.getTime() - canonical.timestamp.getTime());
      return timeDiffMs <= microWindowSeconds * 1000;
    });

    if (matchingCanonical) {
      // It's a duplicate of matchingCanonical
      duplicateCount++;
      const currentDuplicates = duplicateMap.get(matchingCanonical.id) || [];
      currentDuplicates.push(alert.id);
      duplicateMap.set(matchingCanonical.id, currentDuplicates);
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
