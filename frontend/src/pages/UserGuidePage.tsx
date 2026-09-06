// WardAlert Sentinel - User Guide & Comprehensive Documentation Page
import React, { useState } from 'react';
import { BookOpen, FileText, ShieldAlert, Users, CheckCircle2, Server, HelpCircle, Layers } from 'lucide-react';

export const UserGuidePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'ARCHITECTURE' | 'RISKS' | 'STAKEHOLDERS' | 'VALIDATION'>('OVERVIEW');

  const tabs = [
    { id: 'OVERVIEW', label: 'User Manual & Workflows', icon: BookOpen },
    { id: 'ARCHITECTURE', label: 'System Architecture', icon: Server },
    { id: 'RISKS', label: 'Clinical Risk Register', icon: ShieldAlert },
    { id: 'STAKEHOLDERS', label: 'Stakeholder Assumptions', icon: Users },
    { id: 'VALIDATION', label: 'Simulated Validation', icon: CheckCircle2 }
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800">
            <BookOpen className="w-5 h-5" />
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            WardAlert Sentinel Documentation & Clinical Guide
          </h1>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Complete specifications, operational guidance, risk mitigations, and simulated validation protocol.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-[#8B1E2F] text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-sm space-y-6">
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-6 text-slate-800 text-xs leading-relaxed">
            <h2 className="text-lg font-bold text-slate-900">Clinical User Manual & Ward Workflow Guide</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span className="font-bold text-sm text-[#8B1E2F] block">1. Ingestion & Deduplication</span>
                <p className="text-slate-600">
                  Telemetry signals are ingested from multi-parameter bedside monitors. Micro-window deduplication (60 seconds) prevents multiple gateways from spamming identical audible beeps.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span className="font-bold text-sm text-[#8B1E2F] block">2. Temporal Grouping</span>
                <p className="text-slate-600">
                  Repetitive stable alerts (e.g. 7 borderline SpO2 notifications) are unified into a single clinical episode card. Bedside clinicians review the whole cluster with 1 click.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span className="font-bold text-sm text-[#8B1E2F] block">3. Safety Breakout Guarantee</span>
                <p className="text-slate-600">
                  Whenever a vital reading deteriorates into a P0 Critical emergency (e.g. SpO2 plunges to 84%), the system breaks out of the group immediately. Emergencies are NEVER suppressed.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200">
              <h3 className="font-bold text-red-950 text-sm mb-1">How to Triage a Critical Alert</h3>
              <ol className="list-decimal pl-5 space-y-1 text-red-900">
                <li>Observe the <strong>Critical Attention Required</strong> queue on the dashboard.</li>
                <li>Click <strong>[View Evidence]</strong> to inspect the 15-minute trajectory sparkline and physiological rate of change.</li>
                <li>Click <strong>[Escalate]</strong> to notify the Rapid Response Team (RRT) and on-call Medical Registrar with 1-click clinical handover context.</li>
              </ol>
            </div>
          </div>
        )}

        {activeTab === 'ARCHITECTURE' && (
          <div className="space-y-4 text-xs">
            <h2 className="text-lg font-bold text-slate-900">System Architecture & Event Stream Pipeline</h2>
            <p className="text-slate-600">
              WardAlert Sentinel processes physiological events through a 12-stage explainable pipeline:
            </p>

            <div className="p-4 bg-slate-900 text-slate-200 rounded-2xl font-mono text-xs space-y-1">
              <div>Synthetic Alert Generator (28 Ward Beds, Seeded PRNG)</div>
              <div className="text-rose-400">  ↓ Event Stream</div>
              <div>Validation (Bounds & Signal Quality Checks)</div>
              <div className="text-rose-400">  ↓ Normalisation</div>
              <div>Duplicate Detection (Micro-Window 60s Consolidation)</div>
              <div className="text-rose-400">  ↓ Temporal Grouping (15-min Sliding Window)</div>
              <div>Priority Engine (P0 Critical, P1 High, P2 Moderate, P3 Low)</div>
              <div className="text-rose-400">  ↓ Evidence Generator</div>
              <div>Safety Guardrails (Critical Breakout Check)</div>
              <div className="text-rose-400">  ↓ Clinician Console</div>
              <div>Responses / Overrides (Acknowledge, Escalate, Review)</div>
              <div className="text-rose-400">  ↓ Outcomes & Immutable Audit Trail</div>
              <div>Quantitative Evaluation Engine (Baseline vs Analyser Benchmarks)</div>
            </div>
          </div>
        )}

        {activeTab === 'RISKS' && (
          <div className="space-y-4 text-xs">
            <h2 className="text-lg font-bold text-slate-900">Clinical & Algorithmic Risk Register (10 Key Risks)</h2>
            <div className="space-y-2">
              {[
                { r: 'Missed Critical Alert (False Negative)', imp: 'High', mit: 'Architectural breakout rule: any P0 threshold breach forcibly breaks through grouping; automated unit tests enforce 100% preservation.' },
                { r: 'Over-Suppression of Multi-System Trends', imp: 'Moderate', mit: 'Maximum episode duration cap (30m); periodic summary digest shown in Clinician Console; multi-signal cross-correlation.' },
                { r: 'False Reassurance during Data Gaps', imp: 'High', mit: 'Telemetry heartbeat monitor: displays explicit warning "Insufficient data — cannot safely determine trend" whenever observations drop.' },
                { r: 'Sensor Noise & Motion Artifacts', imp: 'Low', mit: 'Waveform Signal Quality Index (SQI) check; filters transient spikes (<5s) with low plethysmography perfusion index.' },
                { r: 'Incorrect Grouping of Disparate Etiologies', imp: 'Moderate', mit: 'Strict grouping key: composite of patientId + alertType + physiological domain; orthogonal metrics never bundled together.' },
                { r: 'Threshold Misconfiguration by Operator', imp: 'High', mit: 'Strict RBAC constraint: only Administrators can update thresholds; audit log records all modifications; non-clinical disclaimer displayed.' },
                { r: 'Privacy Leak / PHI Exposure', imp: 'Critical', mit: 'Zero Real PHI Architecture: system strictly executes on 100% synthetic, pseudorandomly generated ward cohorts.' },
                { r: 'Role Permission Failure', imp: 'Moderate', mit: 'Server-side cryptographic role validation on all mutation endpoints; unauthorized requests return HTTP 403 Forbidden.' },
                { r: 'Poor Accessibility for Night-Shift Staff', imp: 'Moderate', mit: 'Dedicated "Simple View" accessibility toggle; WCAG 2.1 AA compliance; non-color-dependent status badges with icons + explicit text.' },
                { r: 'Misunderstood AI Evidence', imp: 'Moderate', mit: 'Transparent, rule-based clinical evidence engine; uses plain-language rationales and objective 15-minute physiological sparklines.' }
              ].map((item, idx) => (
                <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start justify-between gap-3">
                  <div>
                    <span className="font-bold text-slate-900 text-xs block">{idx + 1}. {item.r}</span>
                    <span className="text-slate-500 text-[0.72rem] mt-0.5 block">Mitigation: {item.mit}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[0.65rem] font-bold bg-rose-100 text-red-800 flex-shrink-0">
                    Impact: {item.imp}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'STAKEHOLDERS' && (
          <div className="space-y-4 text-xs">
            <h2 className="text-lg font-bold text-slate-900">Stakeholder Personas & Clinical Assumptions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { role: 'Bedside Nurses', desc: 'Assumed to manage 4-6 acute beds with 150-350 alarms per shift. 70%+ alarms are nuisance noise. Needs consolidated episodes without missing subtle trends.' },
                { role: 'Ward Doctors & Registrars', desc: 'Assumed to require trajectory context (rate of drop, duration) before accepting phone escalations. High noise causes communication breakdown.' },
                { role: 'Charge Nurses / Ward Sisters', desc: 'Needs bird-eye situational awareness of active ward emergencies, active episodes, and nurse workload distribution.' },
                { role: 'Hospital IT & Biomedical', desc: 'Assumes multi-vendor gateway jitter and packet drops. Requires lightweight micro-window deduplication without message loss.' },
                { role: 'Patient Safety Team', desc: 'Zero tolerance for missed P0 emergencies. Requires immutable audit log for clinical governance.' },
                { role: 'Clinical Informatics & Researchers', desc: 'Requires reproducible seeds, standardized F1/recall metrics, and confusion matrices for academic publication.' }
              ].map((s, idx) => (
                <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="font-extrabold text-sm text-slate-900 block">{s.role}</span>
                  <p className="text-slate-600 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'VALIDATION' && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Simulated Stakeholder Validation Results</h2>
                <div className="text-slate-400 text-[0.7rem]">
                  Clearly labeled: “Simulated stakeholder validation”
                </div>
              </div>
              <div className="text-right">
                <span className="text-[0.65rem] font-bold text-slate-400 uppercase block">Average Clinician Confidence</span>
                <span className="text-xl font-black text-emerald-600">4.9 / 5.0</span>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { stakeholder: 'Staff Nurse (Cardiothoracic)', rating: '5/5', quote: 'The color tags and plain-English deviation tags (↓ 8% in 15 min) tell me immediately what needs triage without decoding waveform numbers.' },
                { stakeholder: 'Medical Registrar (Acute Medicine)', rating: '5/5', quote: 'Extremely clear. The rapid trend analysis (e.g. -22 mmHg in 20 min) is exactly what we ask nurses for during phone escalations.' },
                { stakeholder: 'Ward Sister / Charge Nurse', rating: '5/5', quote: 'The top hero card gives an immediate bird-eye view of active ward safety without searching.' }
              ].map((v, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{v.stakeholder}</span>
                    <span className="font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-[0.7rem]">
                      Rating: {v.rating}
                    </span>
                  </div>
                  <p className="text-slate-600 italic leading-relaxed">“{v.quote}”</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
