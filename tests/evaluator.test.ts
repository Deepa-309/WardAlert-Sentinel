// WardAlert Sentinel - Quantitative Evaluator Unit Tests
import { evaluatePerformance } from '../evaluation/evaluator';
import { BaselineOutput } from '../evaluation/baselineEngine';
import { AnalyserOutput } from '../analyser/analyserEngine';

export function runEvaluatorTests(): Array<{ name: string; passed: boolean; details: string }> {
  const results = [];

  // Mock baseline & analyser
  const baselineMock: BaselineOutput = {
    totalAlerts: 2430,
    actionableAlerts: 850,
    nonActionableAlerts: 1580,
    highPriorityAlerts: 89,
    medianResponseTimeSec: 524,
    ignoredAlertRate: 34.2,
    overrideRate: 18.5,
    alerts: []
  };

  const analyserMock: AnalyserOutput = {
    rawAlertCount: 2430,
    deduplicatedCount: 2100,
    presentedAlerts: [],
    episodes: [],
    criticalCount: 3,
    highCount: 8,
    moderateCount: 21,
    groupedCount: 147,
    breakouts: [],
    nonActionableReductionPct: 63.0,
    highPrioritySensitivity: 98.9
  };

  const metrics = evaluatePerformance(baselineMock, analyserMock);

  results.push({
    name: 'Non-Actionable Reduction Metric Target Check',
    passed: metrics.reductionTargetMet && metrics.nonActionableReductionPct >= 40.0,
    details: `Reduction: ${metrics.nonActionableReductionPct}% (Target: >=40.0%) -> ${metrics.reductionTargetMet ? 'PASS' : 'FAIL'}`
  });

  results.push({
    name: 'High-Priority Sensitivity Target Check',
    passed: metrics.sensitivityTargetMet && metrics.highPrioritySensitivity >= 95.0,
    details: `Sensitivity: ${metrics.highPrioritySensitivity}% (Target: >=95.0%) -> ${metrics.sensitivityTargetMet ? 'PASS' : 'FAIL'}`
  });

  return results;
}
