"use strict";
// WardAlert Sentinel - Experiment Runner Engine
// Executes reproducible comparative experiments (Baseline vs Analyser)
Object.defineProperty(exports, "__esModule", { value: true });
exports.runExperiment = runExperiment;
const generator_1 = require("../simulation/generator");
const analyserEngine_1 = require("../analyser/analyserEngine");
const baselineEngine_1 = require("./baselineEngine");
const evaluator_1 = require("./evaluator");
const priorityEngine_1 = require("../analyser/priorityEngine");
function runExperiment(params) {
    const patientCount = Math.min(Math.max(params.patientCount || 28, 10), 50);
    const alertVolume = Math.min(Math.max(params.alertVolume || 2430, 100), 10000);
    const seed = params.randomSeed || 42;
    const groupingWindow = params.groupingWindowMins || 15;
    const thresholds = params.thresholds || priorityEngine_1.DEFAULT_THRESHOLDS;
    // 1. Generate synthetic cohort
    const patients = (0, generator_1.generateWardPatients)(patientCount, seed);
    // 2. Generate raw alert stream
    const rawAlerts = (0, generator_1.generateWardAlertStream)(patients, alertVolume, seed);
    // 3. Run Baseline system
    const baseline = (0, baselineEngine_1.runBaselineSystem)(rawAlerts);
    // 4. Run Sentinel Analyser
    const analyser = (0, analyserEngine_1.runAlertFatigueAnalyser)(rawAlerts, {
        microWindowSeconds: 60,
        groupingWindowMinutes: groupingWindow,
        thresholds
    });
    // 5. Evaluate comparative performance
    const metrics = (0, evaluator_1.evaluatePerformance)(baseline, analyser);
    return {
        params,
        timestamp: new Date().toISOString(),
        baseline,
        analyser,
        metrics
    };
}
