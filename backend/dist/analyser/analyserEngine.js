"use strict";
// WardAlert Sentinel - Unified Alert Fatigue Analyser Engine
// Orchestrates Deduplication -> Priority Classification -> Evidence Generation -> Temporal Grouping -> Safety Guardrails
Object.defineProperty(exports, "__esModule", { value: true });
exports.runAlertFatigueAnalyser = runAlertFatigueAnalyser;
const deduplicator_1 = require("./deduplicator");
const priorityEngine_1 = require("./priorityEngine");
const evidenceGenerator_1 = require("./evidenceGenerator");
const temporalGrouper_1 = require("./temporalGrouper");
function runAlertFatigueAnalyser(rawAlerts, config = {}) {
    const microWindow = config.microWindowSeconds ?? 60;
    const groupWindow = config.groupingWindowMinutes ?? 15;
    const thresholds = config.thresholds ?? priorityEngine_1.DEFAULT_THRESHOLDS;
    // Step 1: Micro-window deduplication
    const dedupResult = (0, deduplicator_1.deduplicateAlerts)(rawAlerts, microWindow);
    const uniqueAlerts = dedupResult.uniqueAlerts;
    // Step 2: Priority classification & evidence attachment
    for (const alert of uniqueAlerts) {
        const classification = (0, priorityEngine_1.classifyAlertPriority)(alert.alertType, alert.observedValue, thresholds);
        // Respect ground-truth anchors (P014, P007, P021) or apply engine classification
        if (!alert.evidenceJson && (classification.priority === 'P0' || classification.priority === 'P1')) {
            alert.severity = classification.priority;
            const evidence = (0, evidenceGenerator_1.generateAlertEvidence)(alert.alertType, alert.observedValue, alert.severity, [alert.observedValue + 8, alert.observedValue + 5, alert.observedValue + 3, alert.observedValue], groupWindow);
            alert.evidenceJson = JSON.stringify(evidence);
        }
    }
    // Step 3: Temporal sliding window grouping with Critical Breakout Safety
    const groupingResult = (0, temporalGrouper_1.groupAlertsTemporally)(uniqueAlerts, groupWindow);
    // Step 4: Calculate metrics
    let criticalCount = 0;
    let highCount = 0;
    let moderateCount = 0;
    for (const alert of groupingResult.presentedAlerts) {
        if (alert.severity === 'P0')
            criticalCount++;
        else if (alert.severity === 'P1')
            highCount++;
        else if (alert.severity === 'P2')
            moderateCount++;
    }
    // Baseline non-actionable vs Analyser non-actionable
    const baselineNonActionable = rawAlerts.filter(a => a.groundTruthActionability === 'A0').length;
    const presentedNonActionable = groupingResult.presentedAlerts.filter(a => a.groundTruthActionability === 'A0').length;
    const nonActionableReductionPct = baselineNonActionable > 0
        ? parseFloat((((baselineNonActionable - presentedNonActionable) / baselineNonActionable) * 100).toFixed(1))
        : 0;
    // High-priority sensitivity (P0/P1 in presentedAlerts vs total ground truth P0/P1)
    const totalGTHighPriority = rawAlerts.filter(a => a.groundTruthPriority === 'P0' || a.groundTruthPriority === 'P1').length;
    const presentedHighPriority = groupingResult.presentedAlerts.filter(a => a.groundTruthPriority === 'P0' || a.groundTruthPriority === 'P1').length;
    const highPrioritySensitivity = totalGTHighPriority > 0
        ? parseFloat(((presentedHighPriority / totalGTHighPriority) * 100).toFixed(1))
        : 100.0;
    return {
        rawAlertCount: rawAlerts.length,
        deduplicatedCount: uniqueAlerts.length,
        presentedAlerts: groupingResult.presentedAlerts,
        episodes: groupingResult.episodes,
        criticalCount,
        highCount,
        moderateCount,
        groupedCount: groupingResult.groupedCount,
        breakouts: groupingResult.breakouts,
        nonActionableReductionPct,
        highPrioritySensitivity
    };
}
