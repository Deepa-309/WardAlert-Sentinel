// WardAlert Sentinel - Database Seeding Script
import { PrismaClient } from '@prisma/client';
import { generateWardPatients, generateWardAlertStream, SyntheticAlert } from './generator';

const prisma = new PrismaClient();

async function seed() {
  console.log('--- Starting WardAlert Sentinel Database Seed ---');

  // 1. Seed Roles & Permissions
  console.log('Seeding Roles...');
  const roles = [
    {
      name: 'Nurse',
      description: 'Bedside nurse monitoring assigned patients',
      permissions: JSON.stringify(['view_alerts', 'acknowledge_alert', 'snooze_alert', 'view_patients'])
    },
    {
      name: 'Doctor',
      description: 'Medical registrar / physician evaluating ward deteriorations',
      permissions: JSON.stringify(['view_alerts', 'view_evidence', 'escalate_alert', 'override_alert', 'view_patients'])
    },
    {
      name: 'Charge Nurse',
      description: 'Ward manager overseeing ward safety and shift workflow',
      permissions: JSON.stringify(['view_all', 'view_analytics', 'view_alerts', 'view_episodes', 'manage_ward'])
    },
    {
      name: 'Researcher',
      description: 'Clinical informatician conducting alert fatigue experiments',
      permissions: JSON.stringify(['view_experiments', 'run_experiments', 'view_error_analysis', 'export_data'])
    },
    {
      name: 'Administrator',
      description: 'System administrator managing thresholds and audit logs',
      permissions: JSON.stringify(['all', 'configure_settings', 'view_audit_logs', 'manage_users'])
    }
  ];

  for (const r of roles) {
    await prisma.role.upsert({
      where: { name: r.name },
      update: r,
      create: r
    });
  }

  // 2. Seed Default Users
  console.log('Seeding Users...');
  const users = [
    { username: 'charge_emma', name: 'Sister Emma Vance (RN)', roleName: 'Charge Nurse' },
    { username: 'nurse_sarah', name: 'Sarah Miller (RN)', roleName: 'Nurse' },
    { username: 'dr_chen', name: 'Dr. Michael Chen (Registrar)', roleName: 'Doctor' },
    { username: 'res_david', name: 'Dr. David Aris (Informatics)', roleName: 'Researcher' },
    { username: 'admin_alex', name: 'Alex Rivera (IT Admin)', roleName: 'Administrator' }
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { username: u.username },
      update: u,
      create: u
    });
  }

  // 3. Generate 28 Patients
  console.log('Generating 28 ward patients...');
  const syntheticPatients = generateWardPatients(28, 42);

  for (const p of syntheticPatients) {
    await prisma.patient.upsert({
      where: { id: p.id },
      update: {
        bed: p.bed,
        age: p.age,
        gender: p.gender,
        syntheticDiagnosis: p.syntheticDiagnosis,
        riskLevel: p.riskLevel,
        admissionTime: p.admissionTime,
        baselineHR: p.baselineHR,
        baselineBPSys: p.baselineBPSys,
        baselineBPDia: p.baselineBPDia,
        baselineSpO2: p.baselineSpO2,
        baselineRR: p.baselineRR,
        baselineTemp: p.baselineTemp
      },
      create: {
        id: p.id,
        bed: p.bed,
        age: p.age,
        gender: p.gender,
        syntheticDiagnosis: p.syntheticDiagnosis,
        riskLevel: p.riskLevel,
        admissionTime: p.admissionTime,
        baselineHR: p.baselineHR,
        baselineBPSys: p.baselineBPSys,
        baselineBPDia: p.baselineBPDia,
        baselineSpO2: p.baselineSpO2,
        baselineRR: p.baselineRR,
        baselineTemp: p.baselineTemp
      }
    });

    await prisma.observation.create({
      data: {
        patientId: p.id,
        timestamp: new Date(),
        heartRate: p.baselineHR,
        bpSys: p.baselineBPSys,
        bpDia: p.baselineBPDia,
        spO2: p.baselineSpO2,
        respiratoryRate: p.baselineRR,
        temperature: p.baselineTemp,
        glucose: 6.2,
        painScore: p.riskLevel === 'CRITICAL' ? 6 : 2,
        deviceStatus: 'NORMAL'
      }
    });
  }

  // Clear existing alerts and episodes for clean seed
  console.log('Clearing old alert records...');
  await prisma.clinicianResponse.deleteMany();
  await prisma.override.deleteMany();
  await prisma.outcome.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.alert.deleteMany();
  await prisma.alertEpisode.deleteMany();

  // 4. Create Key Demonstration Episodes
  console.log('Creating Demonstration Episodes...');
  // Episode 1: Patient P021 Low SpO2 (7 repetitive alerts over 18 min)
  const now = Date.now();
  const ep21Start = new Date(now - 30 * 60 * 1000);
  const ep21End = new Date(now - 12 * 60 * 1000);

  const ep21 = await prisma.alertEpisode.create({
    data: {
      id: 'EP-P021-SPO2',
      patientId: 'P021',
      alertType: 'LOW_SPO2',
      startTime: ep21Start,
      endTime: ep21End,
      alertCount: 7,
      status: 'ACTIVE',
      representativeAlertId: 'ALT-EP21-1'
    }
  });

  // Create additional ward episodes to match the 12 active episodes
  for (let e = 2; e <= 12; e++) {
    const patId = `P${String((e * 2) % 28 + 1).padStart(3, '0')}`;
    const aType = e % 2 === 0 ? 'TACHYCARDIA' : 'HYPOTENSION';
    await prisma.alertEpisode.create({
      data: {
        id: `EP-0${String(e).padStart(2, '0')}`,
        patientId: patId,
        alertType: aType,
        startTime: new Date(now - (e * 15) * 60 * 1000),
        endTime: new Date(now - (e * 5) * 60 * 1000),
        alertCount: 5 + (e % 4),
        status: 'ACTIVE'
      }
    });
  }

  // 5. Create Core Demonstrator Alerts Matching UI Reference
  console.log('Creating Core Demonstration Alerts...');
  const keyAlerts: any[] = [
    {
      id: 'ALT-10014',
      patientId: 'P014',
      timestamp: new Date(now - 2 * 60 * 1000),
      alertType: 'LOW_SPO2',
      source: 'Bedside Monitor',
      severity: 'P0',
      observedValue: 84,
      referenceRange: '≥92%',
      deviation: '↓ 8% in 15 min',
      context: 'Oxygen deterioration',
      episodeId: null,
      groundTruthPriority: 'P0',
      groundTruthActionability: 'A1',
      clinicianResponse: 'UNACKNOWLEDGED',
      overrideStatus: false,
      evidenceJson: JSON.stringify({
        currentValue: '84%',
        threshold: '<85%',
        previousObservations: ['93%', '92%', '92%', '93%', '92%', '84%'],
        trend: 'Rapid deterioration (-8% in 15 min)',
        duration: '15 minutes',
        supportingObservations: 6,
        reason: 'Critical threshold crossed after persistent deterioration.',
        clinicalImplication: 'Severe hypoxemia with risk of acute respiratory decompensation.',
        recommendedAction: 'Immediate high-flow O2, auscultation, notify Medical Registrar / RRT.'
      })
    },
    {
      id: 'ALT-10007',
      patientId: 'P007',
      timestamp: new Date(now - 4 * 60 * 1000),
      alertType: 'HYPOTENSION',
      source: 'Bedside Monitor',
      severity: 'P0',
      observedValue: 78,
      referenceRange: '≥90 mmHg',
      deviation: '↓ 22 mmHg in 20 min',
      context: 'Low Blood Pressure',
      episodeId: null,
      groundTruthPriority: 'P0',
      groundTruthActionability: 'A1',
      clinicianResponse: 'UNACKNOWLEDGED',
      overrideStatus: false,
      evidenceJson: JSON.stringify({
        currentValue: '78 mmHg',
        threshold: '<80 mmHg',
        previousObservations: ['108 mmHg', '100 mmHg', '94 mmHg', '88 mmHg', '78 mmHg'],
        trend: 'Significant progressive hypotension (-22 mmHg in 20 min)',
        duration: '20 minutes',
        supportingObservations: 5,
        reason: 'Mean arterial pressure compromised; high risk of hypoperfusion.',
        clinicalImplication: 'Hypoperfusion of vital organs; evaluate for septic or hypovolemic etiology.',
        recommendedAction: 'Immediate IV fluid challenge, lower head of bed, recheck lactate.'
      })
    },
    {
      id: 'ALT-10021',
      patientId: 'P021',
      timestamp: new Date(now - 7 * 60 * 1000),
      alertType: 'TACHYCARDIA',
      source: 'Telemetry Unit',
      severity: 'P1',
      observedValue: 126,
      referenceRange: '50-100 bpm',
      deviation: '↑ 26 bpm in 15 min',
      context: 'High Heart Rate',
      episodeId: null,
      groundTruthPriority: 'P1',
      groundTruthActionability: 'A1',
      clinicianResponse: 'UNACKNOWLEDGED',
      overrideStatus: false,
      evidenceJson: JSON.stringify({
        currentValue: '126 bpm',
        threshold: '>120 bpm',
        previousObservations: ['98 bpm', '102 bpm', '110 bpm', '118 bpm', '126 bpm'],
        trend: 'Sustained worsening tachycardia (+26 bpm in 15 min)',
        duration: '15 minutes',
        supportingObservations: 5,
        reason: 'Sustained heart rate above 120 bpm without pause.',
        clinicalImplication: 'Potential rapid atrial fibrillation, dehydration, or occult sepsis.',
        recommendedAction: 'Perform 12-lead ECG and assess hemodynamic stability.'
      })
    }
  ];

  // Also add P021 constituent episode alerts
  const p021Times = [18, 15, 12, 9, 6, 3, 0];
  const p021Labels = ['10:04', '10:07', '10:10', '10:13', '10:16', '10:19', '10:22'];
  p021Times.forEach((mOffset, idx) => {
    keyAlerts.push({
      id: `ALT-EP21-${idx + 1}`,
      patientId: 'P021',
      timestamp: new Date(now - (30 - mOffset) * 60 * 1000),
      alertType: 'LOW_SPO2',
      source: 'Bedside Monitor',
      severity: 'P2',
      observedValue: 91,
      referenceRange: '≥92%',
      deviation: 'Stable mild hypoxia',
      context: `Low SpO2 (Sample point ${p021Labels[idx]})`,
      episodeId: 'EP-P021-SPO2',
      groundTruthPriority: 'P2',
      groundTruthActionability: 'A0',
      clinicianResponse: idx === p021Times.length - 1 ? 'REVIEWED' : 'UNACKNOWLEDGED',
      overrideStatus: false
    });
  });

  // Generate an additional realistic sample of alerts
  const rawStream = generateWardAlertStream(syntheticPatients, 300, 42);
  for (const a of rawStream) {
    if (!keyAlerts.some(k => k.id === a.id)) {
      keyAlerts.push(a);
    }
  }

  console.log(`Inserting ${keyAlerts.length} alerts into database...`);
  for (const a of keyAlerts) {
    await prisma.alert.create({
      data: {
        id: a.id,
        patientId: a.patientId,
        timestamp: a.timestamp,
        alertType: a.alertType,
        source: a.source,
        severity: a.severity,
        observedValue: a.observedValue,
        referenceRange: a.referenceRange,
        deviation: a.deviation,
        context: a.context,
        episodeId: a.episodeId === 'EP-P021-SPO2' ? 'EP-P021-SPO2' : null,
        groundTruthPriority: a.groundTruthPriority,
        groundTruthActionability: a.groundTruthActionability,
        clinicianResponse: a.clinicianResponse,
        overrideStatus: a.overrideStatus,
        evidenceJson: a.evidenceJson
      }
    });
  }

  // 6. Seed Experiment Record (Baseline 2,430 alerts -> Analyzer 1,140 alerts, 63% reduction, 98.9% sensitivity)
  console.log('Seeding Experiment result...');
  await prisma.experiment.deleteMany();
  const exp = await prisma.experiment.create({
    data: {
      name: 'Ward 4B Baseline Telemetry vs Sentinel Analyser Run',
      description: '24-hour simulation across 28 beds comparing legacy telemetry alerts vs Sentinel fatigue engine.',
      patientCount: 28,
      simulationDuration: 24,
      alertVolume: 2430,
      randomSeed: 42,
      groupingWindowMins: 15
    }
  });

  await prisma.experimentResult.create({
    data: {
      experimentId: exp.id,
      baselineAlerts: 2430,
      analyserAlerts: 1140,
      baselineNonActionable: 1580,
      analyserNonActionable: 585,
      nonActionableReductionPct: 63.0,
      highPrioritySensitivity: 98.9,
      precision: 91.4,
      recall: 98.9,
      f1Score: 95.0,
      falsePositives: 18,
      falseNegatives: 2,
      medianResponseTimeSec: 134,
      overrideRate: 2.1,
      reductionTargetMet: true,
      sensitivityTargetMet: true,
      fpTargetMet: true,
      allTargetsMet: true,
      confusionMatrixJson: JSON.stringify({
        priority: {
          P0: { P0: 14, P1: 0, P2: 0, P3: 0 },
          P1: { P0: 1, P1: 72, P2: 0, P3: 1 },
          P2: { P0: 0, P1: 5, P2: 182, P3: 42 },
          P3: { P0: 0, P1: 0, P2: 12, P3: 811 }
        }
      })
    }
  });

  // 7. Seed Audit Logs
  console.log('Seeding Audit Trail...');
  const initialAuditLogs = [
    {
      timestamp: new Date(now - 60 * 60 * 1000),
      user: 'admin_alex',
      role: 'Administrator',
      action: 'SYSTEM_INITIALIZED',
      reason: 'WardAlert Sentinel system started in Ward 4B (Simulation Mode)',
      details: JSON.stringify({ version: '1.0.0-mvp', seed: 42, bedsMonitored: 28 })
    },
    {
      timestamp: new Date(now - 35 * 60 * 1000),
      user: 'charge_emma',
      role: 'Charge Nurse',
      action: 'SHIFT_HANDOVER_VERIFIED',
      reason: 'Charge Nurse verified ward safety snapshot and active episodes',
      details: JSON.stringify({ activeCritical: 3, highPriority: 8, episodes: 12 })
    },
    {
      timestamp: new Date(now - 15 * 60 * 1000),
      user: 'res_david',
      role: 'Researcher',
      action: 'RUN_EXPERIMENT',
      reason: 'Executed 24-hour comparative simulation run with seed 42',
      details: JSON.stringify({ baseline: 2430, analyser: 1140, reductionPct: 63.0 })
    },
    {
      timestamp: new Date(now - 2 * 60 * 1000),
      user: 'System',
      role: 'System',
      action: 'CRITICAL_BREAKOUT_TRIGGERED',
      alertId: 'ALT-10014',
      reason: 'Patient P014 SpO2 plunged to 84% - broke out of grouped episode',
      details: JSON.stringify({ delta: '-8% in 15 min', priorSpO2: [93, 92, 92, 93, 92, 84] })
    }
  ];

  for (const log of initialAuditLogs) {
    await prisma.auditLog.create({
      data: log
    });
  }

  console.log('--- WardAlert Sentinel Database Seed Complete! ---');
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
