// WardAlert Sentinel - Synthetic Ward Data Generator
// Generates 20-30 realistic patients and 1,000-5,000 alerts with reproducible pseudorandom seed.

export interface SyntheticPatient {
  id: string;
  bed: string;
  age: number;
  gender: string;
  syntheticDiagnosis: string;
  riskLevel: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  admissionTime: Date;
  baselineHR: number;
  baselineBPSys: number;
  baselineBPDia: number;
  baselineSpO2: number;
  baselineRR: number;
  baselineTemp: number;
}

export interface SyntheticObservation {
  id: string;
  patientId: string;
  timestamp: Date;
  heartRate: number;
  bpSys: number;
  bpDia: number;
  spO2: number;
  respiratoryRate: number;
  temperature: number;
  glucose: number;
  painScore: number;
  deviceStatus: 'NORMAL' | 'POOR_SIGNAL' | 'DETACHED' | 'DISCONNECTED';
}

export interface SyntheticAlert {
  id: string;
  patientId: string;
  timestamp: Date;
  alertType: 'LOW_SPO2' | 'HYPOTENSION' | 'TACHYCARDIA' | 'BRADYCARDIA' | 'TACHYPNEA' | 'HYPERTHERMIA' | 'LEAD_OFF';
  source: string;
  severity: 'P0' | 'P1' | 'P2' | 'P3';
  observedValue: number;
  referenceRange: string;
  deviation: string;
  context: string;
  episodeId: string | null;
  groundTruthPriority: 'P0' | 'P1' | 'P2' | 'P3';
  groundTruthActionability: 'A1' | 'A0';
  clinicianResponse: 'UNACKNOWLEDGED' | 'ACKNOWLEDGED' | 'REVIEWED' | 'ACTED' | 'SNOOZED' | 'DISMISSED' | 'OVERRIDDEN' | 'ESCALATED';
  overrideStatus: boolean;
  responseTimestamp?: Date;
  outcome?: string;
  resolutionTimestamp?: Date;
  evidenceJson?: string;
}

// DETERMINISTIC PSEUDORANDOM GENERATOR (Mulberry32):
// Generates reproducible 32-bit pseudo-random sequences from a fixed integer seed.
// This is critical for academic reproducibility and regression testing: benchmark runs with seed=42
// always produce identical patient vitals, alert distributions, and confusion matrices across different machines.
function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const DIAGNOSES = [
  'Acute exacerbation of COPD',
  'Post-op partial colectomy',
  'Community-acquired pneumonia',
  'Congestive heart failure (NYHA III)',
  'Severe sepsis secondary to UTI',
  'Post-coronary artery bypass graft (Day 3)',
  'Acute kidney injury on CKD stage 3',
  'Diabetic ketoacidosis (resolving)',
  'Pulmonary embolism on anticoagulation',
  'Subacute bacterial endocarditis',
  'Acute pancreatitis',
  'Cellulitis with systemic inflammatory response',
  'Post-hip arthroplasty with blood loss',
  'Asthma with bronchospasm',
  'Liver cirrhosis with ascites'
];

export function generateWardPatients(count: number = 28, seed: number = 42): SyntheticPatient[] {
  const rand = mulberry32(seed);
  const patients: SyntheticPatient[] = [];

  for (let i = 1; i <= count; i++) {
    const id = `P${String(i).padStart(3, '0')}`;
    const bed = `Bed ${String(i).padStart(2, '0')}`;
    const age = 30 + Math.floor(rand() * 55);
    const gender = rand() > 0.5 ? 'M' : 'F';
    const diagnosis = DIAGNOSES[(i - 1) % DIAGNOSES.length];

    let riskLevel: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW' = 'LOW';
    if (i === 14 || i === 7) {
      riskLevel = 'CRITICAL';
    } else if (i === 21 || i === 3 || i === 11) {
      riskLevel = 'HIGH';
    } else if (i % 3 === 0) {
      riskLevel = 'MODERATE';
    }

    const baselineHR = 65 + Math.floor(rand() * 25);
    const baselineBPSys = 110 + Math.floor(rand() * 25);
    const baselineBPDia = 70 + Math.floor(rand() * 15);
    const baselineSpO2 = 96 + Math.floor(rand() * 4);
    const baselineRR = 14 + Math.floor(rand() * 6);
    const baselineTemp = parseFloat((36.5 + rand() * 0.8).toFixed(1));

    const admissionTime = new Date(Date.now() - (12 + (i % 48)) * 3600 * 1000);

    patients.push({
      id,
      bed,
      age,
      gender,
      syntheticDiagnosis: diagnosis,
      riskLevel,
      admissionTime,
      baselineHR,
      baselineBPSys,
      baselineBPDia,
      baselineSpO2,
      baselineRR,
      baselineTemp
    });
  }

  return patients;
}

export function generateWardAlertStream(
  patients: SyntheticPatient[],
  totalAlerts: number = 2430,
  seed: number = 42
): SyntheticAlert[] {
  const rand = mulberry32(seed);
  const alerts: SyntheticAlert[] = [];
  const now = Date.now();

  // Anchor target alerts matching the dashboard reference:
  // 1. Patient P014 (Bed 14): Critical Oxygen deterioration, SpO2 84%, ↓ 8% in 15 min, 2 min ago
  const p014Alert: SyntheticAlert = {
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
    episodeId: null, // Critical breakout
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
      reason: 'Critical threshold crossed after persistent deterioration.'
    })
  };
  alerts.push(p014Alert);

  // 2. Patient P007 (Bed 07): Critical Low Blood Pressure, 78 mmHg, ↓ 22 mmHg in 20 min, 4 min ago
  const p007Alert: SyntheticAlert = {
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
      reason: 'Mean arterial pressure compromised; high risk of hypoperfusion.'
    })
  };
  alerts.push(p007Alert);

  // 3. Patient P021 (Bed 21): High Heart Rate, 126 bpm, ↑ 26 bpm in 15 min, 7 min ago
  const p021Alert: SyntheticAlert = {
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
      reason: 'Sustained heart rate above 120 bpm without pause.'
    })
  };
  alerts.push(p021Alert);

  // 4. Patient P021 Grouped repetitive Low SpO2 episode: 7 alerts over 18 minutes (10:04 to 10:22)
  const p021EpisodeTimes = [18, 15, 12, 9, 6, 3, 0]; // minutes relative
  const episodeBaseTime = now - 30 * 60 * 1000;
  p021EpisodeTimes.forEach((mOffset, idx) => {
    alerts.push({
      id: `ALT-EP21-${idx + 1}`,
      patientId: 'P021',
      timestamp: new Date(episodeBaseTime + mOffset * 60 * 1000),
      alertType: 'LOW_SPO2',
      source: 'Bedside Monitor',
      severity: 'P2',
      observedValue: 91,
      referenceRange: '≥92%',
      deviation: 'Stable mild hypoxia',
      context: 'Low SpO2 (repetitive boundary alarm)',
      episodeId: 'EP-P021-SPO2',
      groundTruthPriority: 'P2',
      groundTruthActionability: 'A0',
      clinicianResponse: idx === p021EpisodeTimes.length - 1 ? 'REVIEWED' : 'UNACKNOWLEDGED',
      overrideStatus: false
    });
  });

  // Generate remainder of totalAlerts across the 28 patients over the last 24 hours
  const alertTypes: Array<'LOW_SPO2' | 'HYPOTENSION' | 'TACHYCARDIA' | 'BRADYCARDIA' | 'TACHYPNEA' | 'HYPERTHERMIA' | 'LEAD_OFF'> = [
    'LOW_SPO2',
    'HYPOTENSION',
    'TACHYCARDIA',
    'BRADYCARDIA',
    'TACHYPNEA',
    'HYPERTHERMIA',
    'LEAD_OFF'
  ];

  let currentId = 10100;
  const remainingCount = totalAlerts - alerts.length;

  for (let i = 0; i < remainingCount; i++) {
    const p = patients[Math.floor(rand() * patients.length)];
    const timeOffsetHours = rand() * 24; // 0 to 24 hours ago
    const alertTime = new Date(now - timeOffsetHours * 3600 * 1000);
    const alertType = alertTypes[Math.floor(rand() * alertTypes.length)];

    // Majority of hospital telemetry alerts are non-actionable nuisance/repetitive alarms (60-70%)
    const isActionable = rand() > 0.65;
    const isCritical = isActionable && rand() < 0.05; // small % P0
    const isHigh = isActionable && !isCritical && rand() < 0.20; // P1
    const isModerate = rand() < 0.40; // P2

    let severity: 'P0' | 'P1' | 'P2' | 'P3' = 'P3';
    let gtPriority: 'P0' | 'P1' | 'P2' | 'P3' = 'P3';
    let observedValue = 0;
    let refRange = '';
    let dev = '';

    if (isCritical) {
      severity = 'P0';
      gtPriority = 'P0';
    } else if (isHigh) {
      severity = 'P1';
      gtPriority = 'P1';
    } else if (isModerate) {
      severity = 'P2';
      gtPriority = 'P2';
    } else {
      severity = 'P3';
      gtPriority = 'P3';
    }

    switch (alertType) {
      case 'LOW_SPO2':
        refRange = '≥92%';
        observedValue = severity === 'P0' ? 82 + Math.floor(rand() * 3) : severity === 'P1' ? 86 + Math.floor(rand() * 4) : 90 + Math.floor(rand() * 2);
        dev = `↓ ${observedValue < 88 ? '10%' : '3%'} vs baseline`;
        break;
      case 'HYPOTENSION':
        refRange = '90-140 mmHg';
        observedValue = severity === 'P0' ? 70 + Math.floor(rand() * 9) : severity === 'P1' ? 80 + Math.floor(rand() * 9) : 88;
        dev = `↓ ${120 - observedValue} mmHg`;
        break;
      case 'TACHYCARDIA':
        refRange = '50-100 bpm';
        observedValue = severity === 'P0' ? 140 + Math.floor(rand() * 20) : severity === 'P1' ? 121 + Math.floor(rand() * 15) : 105 + Math.floor(rand() * 10);
        dev = `↑ ${observedValue - 80} bpm`;
        break;
      case 'BRADYCARDIA':
        refRange = '50-100 bpm';
        observedValue = severity === 'P0' ? 35 + Math.floor(rand() * 5) : 45 + Math.floor(rand() * 5);
        dev = `↓ ${observedValue} bpm`;
        break;
      case 'TACHYPNEA':
        refRange = '12-20 /min';
        observedValue = severity === 'P0' ? 32 + Math.floor(rand() * 6) : 24 + Math.floor(rand() * 5);
        dev = `↑ ${observedValue} /min`;
        break;
      case 'HYPERTHERMIA':
        refRange = '36.0-37.5 °C';
        observedValue = parseFloat((38.2 + rand() * 1.5).toFixed(1));
        dev = `↑ ${observedValue} °C`;
        break;
      // MISSING DATA & HARDWARE DISCONNECTION MODELING:
      // When an electrode lead or pulse oximeter slips, telemetry receives no valid biometric signal.
      // Rather than synthesizing an arrest (e.g. Asystole / 0% SpO2), the system emits a LEAD_OFF technical advisory (P3).
      // This distinguishes equipment displacement from genuine physiological collapse.
      case 'LEAD_OFF':
        refRange = 'Signal OK';
        observedValue = 0;
        dev = 'Telemetry lead detached';
        break;
    }

    // Clinician responses in synthetic baseline:
    const randResp = rand();
    let clinicianResponse: 'UNACKNOWLEDGED' | 'ACKNOWLEDGED' | 'REVIEWED' | 'ACTED' | 'SNOOZED' | 'DISMISSED' | 'OVERRIDDEN' | 'ESCALATED' = 'UNACKNOWLEDGED';
    if (randResp < 0.40) clinicianResponse = 'ACKNOWLEDGED';
    else if (randResp < 0.65) clinicianResponse = 'REVIEWED';
    else if (randResp < 0.75) clinicianResponse = 'ESCALATED';
    else if (randResp < 0.88) clinicianResponse = 'DISMISSED';

    alerts.push({
      id: `ALT-${currentId++}`,
      patientId: p.id,
      timestamp: alertTime,
      alertType,
      source: 'Bedside Monitor',
      severity,
      observedValue,
      referenceRange: refRange,
      deviation: dev,
      context: `${alertType.replace('_', ' ')} detected on ${p.bed}`,
      episodeId: null, // to be populated by grouping analyser
      groundTruthPriority: gtPriority,
      groundTruthActionability: isActionable ? 'A1' : 'A0',
      clinicianResponse,
      overrideStatus: false
    });
  }

  // Sort chronologically ascending
  alerts.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  return alerts;
}
