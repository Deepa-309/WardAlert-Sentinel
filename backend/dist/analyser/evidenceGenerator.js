"use strict";
// WardAlert Sentinel - Evidence Generation Engine
// Generates explainable, plain-language clinical evidence for P0/P1 alerts
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAlertEvidence = generateAlertEvidence;
function generateAlertEvidence(alertType, observedValue, severity, priorReadings = [], timespanMinutes = 15) {
    let thresholdStr = '';
    let trendStr = '';
    let reasonStr = '';
    let implicationStr = '';
    let recommendationStr = '';
    const formattedPrior = priorReadings.length > 0
        ? priorReadings.map(v => `${v}${alertType === 'LOW_SPO2' ? '%' : alertType === 'HYPOTENSION' ? ' mmHg' : ' bpm'}`)
        : [];
    switch (alertType) {
        case 'LOW_SPO2':
            thresholdStr = severity === 'P0' ? '<85%' : '<90%';
            if (priorReadings.length > 1) {
                const delta = priorReadings[0] - observedValue;
                trendStr = delta > 0 ? `Rapid deterioration (-${delta}% in ${timespanMinutes} min)` : 'Persistent hypoxemia';
            }
            else {
                trendStr = 'Acute downward deviation';
            }
            reasonStr = severity === 'P0'
                ? 'Critical threshold crossed after persistent deterioration.'
                : 'Sustained hypoxemia requiring supplemental oxygen adjustment.';
            implicationStr = 'Risk of tissue hypoxia and end-organ hypoperfusion.';
            recommendationStr = 'Auscultate lung fields, increase O2 flow/FiO2, verify probe placement, notify Medical Registrar.';
            break;
        case 'HYPOTENSION':
            thresholdStr = severity === 'P0' ? '<80 mmHg' : '<90 mmHg';
            if (priorReadings.length > 1) {
                const delta = priorReadings[0] - observedValue;
                trendStr = `Significant progressive hypotension (-${delta} mmHg in ${timespanMinutes} min)`;
            }
            else {
                trendStr = 'Rapid blood pressure decline';
            }
            reasonStr = 'Mean arterial pressure compromised; high risk of hypoperfusion.';
            implicationStr = 'Inadequate organ perfusion; potential septic, hypovolemic, or cardiogenic etiology.';
            recommendationStr = 'Lower head of bed, administer IV crystalloid bolus as charted, check lactate and fluid balance.';
            break;
        case 'TACHYCARDIA':
            thresholdStr = severity === 'P0' ? '>140 bpm' : '>120 bpm';
            if (priorReadings.length > 1) {
                const delta = observedValue - priorReadings[0];
                trendStr = `Sustained worsening tachycardia (+${delta} bpm in ${timespanMinutes} min)`;
            }
            else {
                trendStr = 'Acute heart rate acceleration';
            }
            reasonStr = 'Sustained heart rate above high threshold without baseline recovery.';
            implicationStr = 'Increased myocardial oxygen demand; potential decompensation or arrhythmia.';
            recommendationStr = 'Obtain 12-lead ECG, assess pain/hydration/infection markers, review rate-limiting medications.';
            break;
        default:
            thresholdStr = 'Out of physiological range';
            trendStr = 'Abnormal progression';
            reasonStr = 'Observed physiological metric breached predefined safe ward threshold.';
            implicationStr = 'Requires bedside clinical evaluation.';
            recommendationStr = 'Perform complete bedside vital signs check and review patient chart.';
            break;
    }
    return {
        currentValue: `${observedValue}${alertType === 'LOW_SPO2' ? '%' : alertType === 'HYPOTENSION' ? ' mmHg' : ' bpm'}`,
        threshold: thresholdStr,
        previousObservations: formattedPrior,
        trend: trendStr,
        duration: `${timespanMinutes} minutes`,
        supportingObservations: Math.max(priorReadings.length, 1),
        reason: reasonStr,
        clinicalImplication: implicationStr,
        recommendedAction: recommendationStr
    };
}
