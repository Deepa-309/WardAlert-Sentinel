// WardAlert Sentinel - Analyser Unit Tests
import { deduplicateAlerts } from '../analyser/deduplicator';
import { classifyAlertPriority, DEFAULT_THRESHOLDS } from '../analyser/priorityEngine';
import { groupAlertsTemporally } from '../analyser/temporalGrouper';
import { SyntheticAlert } from '../simulation/generator';

export function runAnalyserTests(): Array<{ name: string; passed: boolean; details: string }> {
  const results = [];
  const now = Date.now();

  // Test 1: Deduplication
  const duplicateAlerts: SyntheticAlert[] = [
    {
      id: 'DEDUP-1',
      patientId: 'P003',
      timestamp: new Date(now),
      alertType: 'TACHYCARDIA',
      source: 'Monitor 1',
      severity: 'P1',
      observedValue: 130,
      referenceRange: '50-100',
      deviation: '+30',
      context: 'Tachycardia',
      episodeId: null,
      groundTruthPriority: 'P1',
      groundTruthActionability: 'A1',
      clinicianResponse: 'UNACKNOWLEDGED',
      overrideStatus: false
    },
    {
      id: 'DEDUP-2',
      patientId: 'P003',
      timestamp: new Date(now + 10 * 1000), // 10s later, same vital
      alertType: 'TACHYCARDIA',
      source: 'Gateway 2',
      severity: 'P1',
      observedValue: 130,
      referenceRange: '50-100',
      deviation: '+30',
      context: 'Tachycardia',
      episodeId: null,
      groundTruthPriority: 'P1',
      groundTruthActionability: 'A1',
      clinicianResponse: 'UNACKNOWLEDGED',
      overrideStatus: false
    }
  ];

  const dedupResult = deduplicateAlerts(duplicateAlerts, 60);
  results.push({
    name: 'Duplicate Detection Engine',
    passed: dedupResult.duplicateCount === 1 && dedupResult.uniqueAlerts.length === 1,
    details: `Deduplicated ${dedupResult.duplicateCount} duplicate alert within 60s micro-window.`
  });

  // Test 2: Priority Engine Classification
  const critSpO2 = classifyAlertPriority('LOW_SPO2', 83, DEFAULT_THRESHOLDS);
  const highHR = classifyAlertPriority('TACHYCARDIA', 125, DEFAULT_THRESHOLDS);
  const modBP = classifyAlertPriority('HYPOTENSION', 88, DEFAULT_THRESHOLDS);
  const lowLead = classifyAlertPriority('LEAD_OFF', 0, DEFAULT_THRESHOLDS);

  const priorityPassed =
    critSpO2.priority === 'P0' && critSpO2.isCritical &&
    highHR.priority === 'P1' &&
    modBP.priority === 'P1' &&
    lowLead.priority === 'P3';

  results.push({
    name: 'Priority & Actionability Classification',
    passed: priorityPassed,
    details: 'Correctly mapped physiological breaches to P0, P1, P2, and P3 tiers.'
  });

  // Test 3: Temporal Grouping without breakout
  const mildAlerts: SyntheticAlert[] = [];
  for (let i = 0; i < 7; i++) {
    mildAlerts.push({
      id: `MILD-${i}`,
      patientId: 'P021',
      timestamp: new Date(now + i * 3 * 60 * 1000),
      alertType: 'LOW_SPO2',
      source: 'Bedside Monitor',
      severity: 'P2',
      observedValue: 91,
      referenceRange: '>=92%',
      deviation: 'Mild hypoxia',
      context: 'Stable low SpO2',
      episodeId: null,
      groundTruthPriority: 'P2',
      groundTruthActionability: 'A0',
      clinicianResponse: 'UNACKNOWLEDGED',
      overrideStatus: false
    });
  }

  const groupResult = groupAlertsTemporally(mildAlerts, 15);
  results.push({
    name: 'Temporal Window Episode Grouping',
    passed: groupResult.episodes.length === 1 && groupResult.groupedCount === 6,
    details: `Grouped 7 consecutive mild alarms into 1 episode (Consolidated: ${groupResult.groupedCount}).`
  });

  return results;
}
