// WardAlert Sentinel - 10-Step Guided Interactive Demo Scenario Modal
import React, { useState, useEffect } from 'react';
import {
  X,
  Play,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
  AlertTriangle,
  Siren,
  Activity,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  RotateCcw,
  ExternalLink
} from 'lucide-react';
import { useAlerts } from '../../context/AlertContext';
import { useAuth } from '../../context/AuthContext';

export const DemoModal: React.FC = () => {
  const { isDemoOpen, closeDemoModal, refreshData, openEvidenceModal, alerts, criticalAlerts } = useAlerts();
  const { getAuthHeaders } = useAuth();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isPlayingAuto, setIsPlayingAuto] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<boolean>(false);

  const demoSteps = [
    {
      step: 1,
      title: 'Generate Repetitive Alerts',
      subtitle: 'Bedside Telemetry Spike on Bed 21',
      icon: Activity,
      color: 'amber',
      description: 'Patient P021 (Bed 21) experiences borderline oxygen saturation. 7 repetitive bedside alarms fire within 18 minutes (readings between 90-92%).',
      details: 'In traditional telemetry monitoring, this produces 7 distinct auditory alarms causing sensory desensitization.',
      impact: 'Sensory fatigue baseline: 7 noisy auditory interruptions.'
    },
    {
      step: 2,
      title: 'Group Repetitive Alerts',
      subtitle: 'Sentinel Grouping Algorithm Engaged',
      icon: Layers,
      color: 'purple',
      description: 'Sentinel Analyser detects repeated low-acuity notifications from Bed 21 and consolidates them into Episode EP-P021-SPO2.',
      details: 'Temporal sliding window clusters the 7 alerts into 1 manageable episode, eliminating 6 redundant notifications.',
      impact: 'Reduces nuisance alarms on Bed 21 by 85%.'
    },
    {
      step: 3,
      title: 'Update Grouped Alert Count',
      subtitle: 'Cognitive Noise Eliminated',
      icon: CheckCircle2,
      color: 'blue',
      description: 'The Grouped Alerts counter increments dynamically on the hero banner and summary cards.',
      details: 'Clinicians see 1 clear episode instead of 7 interruptions. Non-actionable reduction metric climbs.',
      impact: 'Grouped alerts counter updates dynamically; alarm fatigue prevented.'
    },
    {
      step: 4,
      title: 'Generate Sudden Critical Deterioration',
      subtitle: 'Acute Respiratory Compromise on Bed 14',
      icon: AlertTriangle,
      color: 'red',
      description: 'Patient P014 (Bed 14) experiences acute oxygen deterioration: SpO2 plunges from 92% to 84% in 15 minutes (prior readings: 93 → 92 → 92 → 93 → 92 → 84%).',
      details: 'Severe hypoxemia breaches critical threshold (<85%). Emergency response is medically urgent.',
      impact: 'Acute physiological crisis generated on Bed 14.'
    },
    {
      step: 5,
      title: 'Critical Alert Breaks Through Grouping',
      subtitle: 'Safety Invariant: P0/P1 Never Suppressed',
      icon: Siren,
      color: 'red',
      description: 'SAFETY INVARIANT ACTIVATED: Grouping engine halts and forcibly BREAKS OUT the 84% critical alert into the Critical Attention queue.',
      details: 'Even during background alarm clusters, emergency deteriorations are isolated immediately and presented un-grouped.',
      impact: 'Zero suppression of emergency events. 100% sensitivity guaranteed.'
    },
    {
      step: 6,
      title: 'Notification Badge Increases',
      subtitle: 'Dynamic Unread Counter Updates',
      icon: Siren,
      color: 'red',
      description: 'The red notification bell badge in the top header increments dynamically to reflect the new unread critical emergency.',
      details: 'Clinicians receive an immediate visual cue indicating an active critical attention requirement.',
      impact: 'Red notification bell badge increments by +1.'
    },
    {
      step: 7,
      title: 'Critical Alert on Dashboard & Live Alerts',
      subtitle: 'Prominent High-Visibility Display',
      icon: AlertTriangle,
      color: 'red',
      description: 'Alert ALT-10014 appears at the top of "Critical attention required" on the Dashboard and in the Live Alerts table.',
      details: 'Card displays: Patient P014 • Bed 14 • Oxygen deterioration • SpO2 84% (↓ 8% in 15 min).',
      impact: 'Immediate situational awareness for all attending clinicians.'
    },
    {
      step: 8,
      title: 'Clinician Opens Evidence',
      subtitle: 'Transparent Explainable AI Rationale',
      icon: Activity,
      color: 'red',
      description: 'Clinician reviews explainable evidence: 15m trajectory (93 → 92 → 92 → 93 → 92 → 84%), critical threshold <85%, and recommended actions.',
      details: 'Clinician inspection logged to audit trail as ALERT_VIEWED.',
      impact: 'Evidence viewed and logged for clinical governance.',
      hasEvidenceAction: true
    },
    {
      step: 9,
      title: 'Clinician Escalates to Medical Registrar',
      subtitle: '1-Click Rapid Response Handover',
      icon: ArrowUpRight,
      color: 'red',
      description: 'Sister Emma Vance clicks [Escalate]. Rapid Response Team (RRT) alert is dispatched with 1-click telemetry handover.',
      details: 'Status updates from UNACKNOWLEDGED to ESCALATED. ALERT_ESCALATED recorded in audit log.',
      impact: 'Median response time 2m 14s (vs 8m 44s legacy baseline delay).',
      hasEscalateAction: true
    },
    {
      step: 10,
      title: 'Record Clinical Outcome',
      subtitle: 'Patient Stabilized & Audit Sealed',
      icon: ShieldCheck,
      color: 'emerald',
      description: 'Medical registrar arrives within 3 minutes; 4L high-flow oxygen cannula administered. Patient SpO2 stabilizes at 95%.',
      details: 'Outcome status saved as "RESOLVED_SAFE - Patient stabilized with High-Flow O2". Dashboard metrics update automatically.',
      impact: 'Full verification loop complete. All clinical targets met (SAFE TARGET MET).'
    }
  ];

  const current = demoSteps[currentStep - 1];
  const StepIcon = current.icon;

  // Auto-play interval
  useEffect(() => {
    let timer: any;
    if (isPlayingAuto && isDemoOpen) {
      timer = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= 10) {
            setIsPlayingAuto(false);
            return 10;
          }
          const next = prev + 1;
          handleExecuteStep(next);
          return next;
        });
      }, 4500);
    }
    return () => clearInterval(timer);
  }, [isPlayingAuto, isDemoOpen]);

  const handleExecuteStep = async (stepNum: number) => {
    setLoadingStep(true);
    try {
      await fetch(`/api/demo/run-step/${stepNum}`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      await refreshData();
      setCurrentStep(stepNum);
    } finally {
      setLoadingStep(false);
    }
  };

  const handleResetDemo = async () => {
    setLoadingStep(true);
    try {
      await fetch('/api/demo/reset', {
        method: 'POST',
        headers: getAuthHeaders()
      });
      await refreshData();
      setCurrentStep(1);
      setIsPlayingAuto(false);
    } finally {
      setLoadingStep(false);
    }
  };

  const p014Alert = criticalAlerts.find(a => a.patientId === 'P014') || alerts.find(a => a.patientId === 'P014');

  if (!isDemoOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Play className="w-5 h-5 fill-rose-500 text-rose-500" />
            </div>
            <div>
              <div className="text-[0.68rem] font-extrabold uppercase tracking-wider text-rose-400">
                INTERACTIVE CLINICAL SIMULATION
              </div>
              <h3 className="text-lg font-black text-white">
                WardAlert Sentinel Demo Scenario (10 Steps)
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetDemo}
              title="Reset demonstration to beginning"
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1 text-xs"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Reset</span>
            </button>
            <button
              type="button"
              onClick={closeDemoModal}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress Timeline Tracker (10 steps) */}
        <div className="px-6 py-3 bg-slate-800 border-b border-slate-700 flex items-center justify-between overflow-x-auto gap-1">
          {demoSteps.map((s) => (
            <button
              key={s.step}
              type="button"
              onClick={() => handleExecuteStep(s.step)}
              className={`flex-1 min-w-[24px] h-2 rounded-full transition-all ${
                s.step === currentStep
                  ? 'bg-rose-500 ring-2 ring-rose-400'
                  : s.step < currentStep
                  ? 'bg-emerald-500'
                  : 'bg-slate-700'
              }`}
              title={`Step ${s.step}: ${s.title}`}
            />
          ))}
        </div>

        {/* Main Step Display */}
        <div className="p-6 md:p-8 space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Step {current.step} of 10 • {current.title}
              </span>
              <h2 className="text-xl font-black text-slate-900 mt-1">
                {current.subtitle}
              </h2>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-[#8B1E2F] flex-shrink-0 shadow-sm">
              <StepIcon className="w-6 h-6" />
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <p className="text-sm font-semibold text-slate-800 leading-relaxed">
              {current.description}
            </p>
            <p className="text-xs text-slate-500 leading-relaxed">
              {current.details}
            </p>
          </div>

          {/* Direct Interactive Actions inside Simulation Step */}
          {current.hasEvidenceAction && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">
                Inspect P014 15-Minute SpO₂ Trajectory & Rationale
              </span>
              <button
                type="button"
                onClick={() => {
                  if (p014Alert) openEvidenceModal(p014Alert);
                }}
                className="px-3.5 py-1.5 bg-[#8B1E2F] text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm hover:bg-[#70121F] transition-all"
              >
                <span>Open Evidence Panel</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          )}

          {current.hasEscalateAction && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between">
              <span className="text-xs font-bold text-red-900">
                Dispatch Rapid Response Team for Patient P014 (SpO₂ 84%)
              </span>
              <button
                type="button"
                onClick={async () => {
                  await handleExecuteStep(9);
                  await refreshData();
                }}
                className="px-4 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold shadow-sm hover:bg-red-700 transition-all flex items-center gap-1"
              >
                <span>Dispatch RRT</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-xs text-emerald-800 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span><strong>Clinical Impact:</strong> {current.impact}</span>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setIsPlayingAuto(!isPlayingAuto)}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
              isPlayingAuto
                ? 'bg-rose-100 border-rose-300 text-rose-800'
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isPlayingAuto ? 'animate-spin' : ''}`} />
            <span>{isPlayingAuto ? 'Pause Auto-Play' : 'Auto-Play (4s/step)'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentStep === 1 || loadingStep}
              onClick={() => handleExecuteStep(currentStep - 1)}
              className="px-3.5 py-2 border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 text-slate-700 font-semibold text-xs rounded-xl flex items-center gap-1 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Prev</span>
            </button>

            {currentStep < 10 ? (
              <button
                type="button"
                disabled={loadingStep}
                onClick={() => handleExecuteStep(currentStep + 1)}
                className="px-4 py-2 bg-[#8B1E2F] hover:bg-[#70121F] text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1 transition-all"
              >
                <span>{loadingStep ? 'Running...' : 'Next Step'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={closeDemoModal}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
              >
                Complete Demo
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

