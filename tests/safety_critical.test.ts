// WardAlert Sentinel - Critical Safety Preservation Test
// REGULATORY SAFETY INVARIANT: Under NO circumstances may a P0 Critical or P1 High-Priority alert
// be suppressed, dropped, or hidden by alert consolidation/grouping algorithms.

import { generateWardPatients, SyntheticAlert } from '../simulation/generator';
import { runAlertFatigueAnalyser } from '../analyser/analyserEngine';

export function runSafetyCriticalTest(): { name: string; passed: boolean; details: string } {
  const patients = generateWardPatients(5, 101);
  const now = Date.now();

  // Construct synthetic batch with ground-truth emergencies embedded among repetitive nuisance alarms
  const testAlerts: SyntheticAlert[] = [];

  // Patient P001: 5 mild repetitive SpO2 alarms (92%) followed by a sudden CRITICAL drop to 83%
  for (let i = 0; i < 5; i++) {
    testAlerts.push({
      id: `TEST-ALT-MILD-${i}`,
      patientId: 'P001',
      timestamp: new Date(now - (20 - i * 3) * 60 * 1000),
      alertType: 'LOW_SPO2',
      source: 'Bedside Monitor',
      severity: 'P2',
      observedValue: 92,
      referenceRange: '>=92%',
      deviation: 'Stable hypoxia',
      context: 'Mild SpO2 notification',
      episodeId: null,
      groundTruthPriority: 'P2',
      groundTruthActionability: 'A0',
      clinicianResponse: 'UNACKNOWLEDGED',
      overrideStatus: false
    });
  }

  // The critical breakout event
  const criticalEvent: SyntheticAlert = {
    id: 'TEST-ALT-CRITICAL-P0',
    patientId: 'P001',
    timestamp: new Date(now - 2 * 60 * 1000),
    alertType: 'LOW_SPO2',
    source: 'Bedside Monitor',
    severity: 'P0',
    observedValue: 83,
    referenceRange: '>=92%',
    deviation: 'Rapid drop to 83%',
    context: 'Acute respiratory deterioration',
    episodeId: null,
    groundTruthPriority: 'P0',
    groundTruthActionability: 'A1',
    clinicianResponse: 'UNACKNOWLEDGED',
    overrideStatus: false
  };
  testAlerts.push(criticalEvent);

  // Patient P002: 4 repetitive tachycardias (108 bpm) followed by severe tachycardia (145 bpm)
  for (let i = 0; i < 4; i++) {
    testAlerts.push({
      id: `TEST-ALT-TACHY-MILD-${i}`,
      patientId: 'P002',
      timestamp: new Date(now - (15 - i * 3) * 60 * 1000),
      alertType: 'TACHYCARDIA',
      source: 'Telemetry',
      severity: 'P2',
      observedValue: 108,
      referenceRange: '50-100 bpm',
      deviation: 'Moderate elevation',
      context: 'Tachycardia notification',
      episodeId: null,
      groundTruthPriority: 'P2',
      groundTruthActionability: 'A0',
      clinicianResponse: 'UNACKNOWLEDGED',
      overrideStatus: false
    });
  }

  const highTachyEvent: SyntheticAlert = {
    id: 'TEST-ALT-TACHY-P0',
    patientId: 'P002',
    timestamp: new Date(now - 1 * 60 * 1000),
    alertType: 'TACHYCARDIA',
    source: 'Telemetry',
    severity: 'P0',
    observedValue: 145,
    referenceRange: '50-100 bpm',
    deviation: 'Severe tachycardia >140 bpm',
    context: 'Potential ventricular tachycardia or rapid AF',
    episodeId: null,
    groundTruthPriority: 'P0',
    groundTruthActionability: 'A1',
    clinicianResponse: 'UNACKNOWLEDGED',
    overrideStatus: false
  };
  testAlerts.push(highTachyEvent);

  // Run the Analyser
  const output = runAlertFatigueAnalyser(testAlerts, { groupingWindowMinutes: 15 });

  // Verification 1: Critical alert P001 MUST be present in presentedAlerts
  const foundCriticalP001 = output.presentedAlerts.find(a => a.id === 'TEST-ALT-CRITICAL-P0');
  // Verification 2: Critical alert P002 MUST be present in presentedAlerts
  const foundCriticalP002 = output.presentedAlerts.find(a => a.id === 'TEST-ALT-TACHY-P0');

  // Verification 3: High Priority Sensitivity on this batch must be 100%
  const allGroundTruthHighPriority = testAlerts.filter(a => a.groundTruthPriority === 'P0' || a.groundTruthPriority === 'P1');
  const presentedHighPriority = output.presentedAlerts.filter(a => a.groundTruthPriority === 'P0' || a.groundTruthPriority === 'P1');

  const passed =
    !!foundCriticalP001 &&
    !!foundCriticalP002 &&
    presentedHighPriority.length === allGroundTruthHighPriority.length;

  return {
    name: 'CRITICAL SAFETY PRESERVATION TEST (P0/P1 Never Suppressed)',
    passed,
    details: passed
      ? `PASSED: 100% of P0/P1 emergency alerts (${presentedHighPriority.length}/${allGroundTruthHighPriority.length}) successfully broke out of grouped episodes and were presented to clinicians.`
      : `FAILED: Missed emergency alert! Found P001: ${!!foundCriticalP001}, Found P002: ${!!foundCriticalP002}`
  };
}
