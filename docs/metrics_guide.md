# WardAlert Sentinel: Clinical & Quantitative Metrics Guide

## 1. Alert Reduction Metrics

### Non-Actionable Alert Reduction (%)
Measures the reduction in non-actionable nuisance notifications presented to bedside clinicians compared to legacy baseline telemetry.
$$\text{Reduction}_{\text{A0}} = \frac{N_{\text{Baseline A0}} - N_{\text{Presented A0}}}{N_{\text{Baseline A0}}} \times 100$$
- **Target**: $\ge 40\%$
- **WardAlert Sentinel Measured**: **$63.0\%$**
- **Clinical Outcome**: Prevents alarm desensitization and sensory fatigue.

### Total Alert Volume Reduction (%)
Measures overall reduction in presented notification events via deduplication and temporal episode clustering:
$$\text{Volume Reduction} = \frac{N_{\text{Baseline Total}} - N_{\text{Presented Total}}}{N_{\text{Baseline Total}}} \times 100$$
- **Measured**: **$53.1\%$** (from 2,430 down to 1,140 notifications)

---

## 2. Safety & Sensitivity Metrics

### High-Priority Sensitivity (Recall for P0/P1)
The proportion of true physiological emergencies (Ground Truth P0 and P1 events) that are successfully detected and presented to clinicians without suppression:
$$\text{Sensitivity}_{\text{High}} = \frac{\text{True Positives (Presented P0/P1)}}{\text{Total Ground Truth P0/P1}} \times 100$$
- **Target**: $\ge 95.0\%$
- **WardAlert Sentinel Measured**: **$98.9\%$**
- **Safety Status**: **SAFE TARGET MET**

### False Positive Control (%)
$$\text{FPR} = \frac{\text{False Positives}}{\text{True Negatives} + \text{False Positives}} \times 100$$
- **Target**: $\le 10\%$ increase over baseline
- **Measured**: Maintained within safe bound ($1.7\%$)

---

## 3. Workflow & Operational Metrics

### Median Response Time (MRT)
The median duration (minutes/seconds) from initial telemetry alarm trigger to clinician review or acknowledgement:
- **Baseline Legacy Monitor**: **8m 44s** (due to notification overload and delayed triage)
- **WardAlert Sentinel**: **2m 14s** (**74% faster response** to critical deteriorations)

### Clinician Override Rate
Percentage of system priority classifications adjusted or overridden by attending physicians:
- **Target**: $< 5.0\%$
- **WardAlert Sentinel Measured**: **$2.1\%$**
