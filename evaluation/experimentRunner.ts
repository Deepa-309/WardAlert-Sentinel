// WardAlert Sentinel - Experiment Runner Engine
// Executes reproducible comparative experiments (Baseline vs Analyser)

import { generateWardPatients, generateWardAlertStream, SyntheticPatient, SyntheticAlert } from '../simulation/generator';
import { runAlertFatigueAnalyser, AnalyserOutput } from '../analyser/analyserEngine';
import { runBaselineSystem, BaselineOutput } from './baselineEngine';
import { evaluatePerformance, DetailedEvaluationMetrics } from './evaluator';
import { ThresholdConfig, DEFAULT_THRESHOLDS } from '../analyser/priorityEngine';

export interface ExperimentParams {
  id?: string;
  name: string;
  patientCount: number;
  simulationDuration: number;
  alertVolume: number;
  randomSeed: number;
  groupingWindowMins: number;
  thresholds?: ThresholdConfig;
}

export interface ExperimentExecutionResult {
  params: ExperimentParams;
  timestamp: string;
  baseline: BaselineOutput;
  analyser: AnalyserOutput;
  metrics: DetailedEvaluationMetrics;
}

export function runExperiment(params: ExperimentParams): ExperimentExecutionResult {
  const patientCount = Math.min(Math.max(params.patientCount || 28, 10), 50);
  const alertVolume = Math.min(Math.max(params.alertVolume || 2430, 100), 10000);
  const seed = params.randomSeed || 42;
  const groupingWindow = params.groupingWindowMins || 15;
  const thresholds = params.thresholds || DEFAULT_THRESHOLDS;

  // 1. Generate synthetic cohort
  const patients = generateWardPatients(patientCount, seed);

  // 2. Generate raw alert stream
  const rawAlerts = generateWardAlertStream(patients, alertVolume, seed);

  // 3. Run Baseline system
  const baseline = runBaselineSystem(rawAlerts);

  // 4. Run Sentinel Analyser
  const analyser = runAlertFatigueAnalyser(rawAlerts, {
    microWindowSeconds: 60,
    groupingWindowMinutes: groupingWindow,
    thresholds
  });

  // 5. Evaluate comparative performance
  const metrics = evaluatePerformance(baseline, analyser);

  return {
    params,
    timestamp: new Date().toISOString(),
    baseline,
    analyser,
    metrics
  };
}
