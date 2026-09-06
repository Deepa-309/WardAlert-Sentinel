// WardAlert Sentinel - Frontend Type Definitions

export type UserRole = 'Nurse' | 'Doctor' | 'Charge Nurse' | 'Researcher' | 'Administrator';

export interface Alert {
  id: string;
  patientId: string;
  timestamp: string;
  alertType: string;
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
  responseTimestamp?: string;
  outcome?: string;
  evidenceJson?: string;
  patient?: Patient;
}

export interface Patient {
  id: string;
  bed: string;
  age: number;
  gender: string;
  syntheticDiagnosis: string;
  riskLevel: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  admissionTime: string;
  baselineHR: number;
  baselineBPSys: number;
  baselineBPDia: number;
  baselineSpO2: number;
  baselineRR: number;
  baselineTemp: number;
  alerts?: Alert[];
  observations?: Observation[];
}

export interface Observation {
  id: string;
  patientId: string;
  timestamp: string;
  heartRate?: number;
  bpSys?: number;
  bpDia?: number;
  spO2?: number;
  respiratoryRate?: number;
  temperature?: number;
  glucose?: number;
  painScore?: number;
  deviceStatus: string;
}

export interface Episode {
  id: string;
  patientId: string;
  alertType: string;
  startTime: string;
  endTime?: string;
  alertCount: number;
  status: 'ACTIVE' | 'RESOLVED' | 'BROKEN_OUT';
  representativeAlertId?: string;
  breakoutReason?: string;
  patient?: Patient;
  alerts?: Alert[];
}

export interface SummaryMetrics {
  activeCritical: number;
  highPriority: number;
  moderate: number;
  low: number;
  groupedAlerts: number;
  nonActionableReductionPct: number;
  sensitivityPct: number;
  clinicianResponse: {
    acknowledgedPct: number;
    reviewedPct: number;
    escalatedPct: number;
    dismissedPct: number;
    medianResponseTimeStr: string;
    medianResponseTimeSec: number;
  };
  totalAlerts?: number;
  patientsCount?: number;
  activeEpisodesCount?: number;
  overrideRatePct?: number;
  medianResponseTimeSeconds?: number;
}

export interface EvidenceData {
  currentValue: string;
  threshold: string;
  previousObservations: string[];
  trend: string;
  duration: string;
  supportingObservations: number;
  reason: string;
  clinicalImplication?: string;
  recommendedAction?: string;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  alertId?: string;
  reason?: string;
  details?: string;
}
