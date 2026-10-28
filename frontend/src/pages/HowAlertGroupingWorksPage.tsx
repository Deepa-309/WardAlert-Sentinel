// WardAlert Sentinel - How Temporal Alert Grouping Works Page
import React, { useState } from 'react';
import {
  Layers,
  Clock,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Siren,
  Filter,
  Sliders,
  TrendingDown,
  Activity,
  Heart,
  Info
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

export const HowAlertGroupingWorksPage: React.FC = () => {
  const [selectedWindow, setSelectedWindow] = useState<number>(10);
  const [simScenario, setSimScenario] = useState<'stable' | 'deteriorating'>('stable');

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700">
              <Layers className="w-5 h-5" />
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              How Alert Grouping Works
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Algorithmic principles, sliding temporal windows, and critical breakout invariants for ward telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <NavLink
            to="/episodes"
            className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold hover:bg-purple-100 transition-colors flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>View Active Episodes</span>
          </NavLink>
        </div>
      </div>

      {/* Mandatory Safety Invariant Banner */}
      <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-[#8B1E2F] flex-shrink-0 mt-0.5" />
        <div className="text-xs text-rose-950">
          <span className="font-extrabold text-sm block mb-0.5 text-[#8B1E2F]">
            Absolute Clinical Safety Invariant: P0 & P1 Never Suppressed
          </span>
          P0 (Critical Emergency) and P1 (High Priority Deterioration) alerts must <strong>always break out of grouping</strong>. Only repetitive, non-deteriorating P2 (Moderate) and P3 (Low) alarms are consolidated into clinical episodes.
        </div>
      </div>

      {/* Visual Flow Pipeline Diagram */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 md:p-6 shadow-sm space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Visual Alert Grouping Decision Pipeline
          </h2>
          <p className="text-xs text-slate-500">
            Sequential stages executed for every incoming vital alarm before presentation to the clinical team.
          </p>
        </div>

        {/* Step Flowchart */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3 pt-2">
          {[
            {
              step: '1',
              title: 'Incoming Alerts',
              desc: 'Continuous real-time bedside telemetry stream (SpO2, HR, BP, RR, Temp)',
              color: 'bg-slate-100 border-slate-300 text-slate-700'
            },
            {
              step: '2',
              title: 'Patient Match',
              desc: 'Identifies patient bed ID; grouping is strictly per individual patient',
              color: 'bg-blue-50 border-blue-200 text-blue-700'
            },
            {
              step: '3',
              title: 'Alert Type Match',
              desc: 'Matches physiological parameter (e.g. SpO2 with SpO2, BP with BP)',
              color: 'bg-indigo-50 border-indigo-200 text-indigo-700'
            },
            {
              step: '4',
              title: 'Time Window',
              desc: `Evaluates if alert falls within the ${selectedWindow}m sliding window`,
              color: 'bg-purple-50 border-purple-200 text-purple-700'
            },
            {
              step: '5',
              title: 'Trend Check',
              desc: 'Verifies no meaningful acute deterioration (e.g., drop >= 4%)',
              color: 'bg-amber-50 border-amber-200 text-amber-700'
            },
            {
              step: '6',
              title: 'Priority Check',
              desc: 'Verifies identical priority tier (P2/P3); P0/P1 never group',
              color: 'bg-orange-50 border-orange-200 text-orange-700'
            },
            {
              step: '7',
              title: 'Group OR Breakout',
              desc: 'Consolidates into Episode OR immediately fires breakout alarm card',
              color: 'bg-emerald-50 border-emerald-300 text-emerald-800'
            }
          ].map((s, idx) => (
            <div
              key={s.step}
              className={`p-3.5 rounded-xl border ${s.color} flex flex-col justify-between relative`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="w-5 h-5 rounded-full bg-white text-[0.7rem] font-black flex items-center justify-center shadow-xs">
                    {s.step}
                  </span>
                  {idx < 6 && (
                    <ArrowRight className="w-3.5 h-3.5 opacity-40 hidden lg:block" />
                  )}
                </div>
                <h3 className="text-xs font-black mb-1">{s.title}</h3>
                <p className="text-[0.68rem] leading-relaxed opacity-90">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Core Rules & Parameters Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Exact Rules Used by Analyser */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 md:p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">
              Exact Grouping Rules Enforced by Analyser
            </h2>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-extrabold text-slate-900 block">1. Same Patient Required</span>
              <p className="text-slate-600 leading-relaxed">
                Alerts are strictly partitioned by patient ID (e.g. P014). Telemetry from different ward beds is never co-mingled or grouped across patients.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-extrabold text-slate-900 block">2. Same or Related Alert Type</span>
              <p className="text-slate-600 leading-relaxed">
                Grouping applies to identical vital sign channels (e.g., consecutive LOW_SPO2 alarms). Heterogeneous alerts (e.g. SpO2 + Bradycardia) trigger multi-channel review rather than grouping.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-extrabold text-slate-900 block">3. Same Priority Level Required</span>
              <p className="text-slate-600 leading-relaxed">
                All constituent alarms in an episode must share the same priority tier (e.g., mild P2 alarms). An incoming P1 or P0 alarm cannot join a P2 episode.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-extrabold text-slate-900 block">4. No Meaningful Deterioration</span>
              <p className="text-slate-600 leading-relaxed">
                The vital sign trend must remain stable within acceptable clinical tolerance. A rapid drop in SpO2 (≥4%), sharp BP fall (≥15 mmHg), or acute tachycardic spike immediately halts grouping and triggers an emergency breakout.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 space-y-1">
              <span className="font-extrabold text-[#8B1E2F] block">5. Mandatory P0 & P1 Breakout Invariant</span>
              <p className="text-rose-950 leading-relaxed">
                Any P0 Critical alert or P1 High Priority deterioration immediately breaks out of grouping and displays as an unsuppressed high-priority clinical card with full evidence.
              </p>
            </div>
          </div>
        </div>

        {/* Configurable Window Limit & Interactive Controls */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 md:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-[#8B1E2F]" />
              <h2 className="text-base font-bold text-slate-900">
                Configurable Grouping Windows
              </h2>
            </div>
            <span className="text-[0.68rem] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
              Default: 10 Minutes
            </span>
          </div>

          <p className="text-xs text-slate-600">
            Administrators and clinical informatics leads can configure the sliding grouping window according to ward acuity:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[5, 10, 15, 30].map(mins => (
              <button
                key={mins}
                type="button"
                id={`window-btn-${mins}`}
                onClick={() => setSelectedWindow(mins)}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  selectedWindow === mins
                    ? 'bg-[#8B1E2F] text-white border-[#8B1E2F] shadow-sm font-black'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 font-bold'
                }`}
              >
                <span className="text-lg block">{mins}m</span>
                <span className="text-[0.65rem] opacity-80 block">
                  {mins === 10 ? 'Default' : mins === 5 ? 'High Acuity' : mins === 15 ? 'General Ward' : 'Step-Down'}
                </span>
              </button>
            ))}
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
            <span className="font-extrabold text-slate-900 block flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-purple-700" />
              Active Sliding Window: {selectedWindow} Minutes
            </span>
            <p className="text-slate-600 text-[0.72rem] leading-relaxed">
              If another repetitive moderate alarm occurs within <strong>{selectedWindow} minutes</strong> of the active episode start time, it is appended to the episode. If no alarms arrive for &gt;{selectedWindow} minutes, the episode automatically closes as RESOLVED.
            </p>
          </div>

          {/* Interactive Scenario Toggle */}
          <div className="pt-2 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-700 block mb-2">
              Clinical Deterioration Comparison Examples:
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSimScenario('stable')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  simScenario === 'stable'
                    ? 'bg-purple-700 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Scenario A: Stable Episode
              </button>
              <button
                type="button"
                onClick={() => setSimScenario('deteriorating')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  simScenario === 'deteriorating'
                    ? 'bg-red-700 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Scenario B: Acute Breakout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Comparative Visual Clinical Examples */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Example 1: Stable Grouped Episode */}
        <div className={`bg-white rounded-2xl border p-5 md:p-6 shadow-sm space-y-4 transition-all ${
          simScenario === 'stable' ? 'ring-2 ring-purple-600 border-purple-300' : 'border-slate-200/80'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold px-2.5 py-1 rounded bg-purple-100 text-purple-800">
              EXAMPLE 1: ONE GROUPED EPISODE
            </span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
              No Meaningful Deterioration
            </span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
            <div className="text-sm font-black text-slate-900 tracking-wider">
              92% → 91% → 92% → 90%
            </div>
            <span className="text-[0.68rem] text-slate-500 font-semibold block mt-1">
              4 repetitive SpO2 readings fluctuating within a 2% deadband over {selectedWindow} minutes
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-semibold">Patient:</span>
              <span className="font-bold text-slate-800">P021 (Bed 21)</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-semibold">Initial Alarm:</span>
              <span className="font-bold text-slate-800">10:04 AM • SpO2 92% (P2 Moderate)</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-semibold">Consecutive Readings:</span>
              <span className="font-bold text-slate-800">91% (10:08) → 92% (10:12) → 90% (10:17)</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-semibold">Grouping Outcome:</span>
              <span className="font-extrabold text-purple-700">1 Consolidate Clinical Episode (EP-003)</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500 font-semibold">Clinician Interruption:</span>
              <span className="font-bold text-emerald-700">1 single card (3 alarms consolidated)</span>
            </div>
          </div>
        </div>

        {/* Example 2: Deteriorating Breakout Alert */}
        <div className={`bg-white rounded-2xl border p-5 md:p-6 shadow-sm space-y-4 transition-all ${
          simScenario === 'deteriorating' ? 'ring-2 ring-red-600 border-red-300' : 'border-slate-200/80'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold px-2.5 py-1 rounded bg-red-100 text-red-800">
              EXAMPLE 2: GROUPED ALERTS + P0 CRITICAL BREAKOUT
            </span>
            <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Acute Deterioration
            </span>
          </div>

          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-center">
            <div className="text-sm font-black text-rose-900 tracking-wider">
              92% → 91% → 89% → 84%
            </div>
            <span className="text-[0.68rem] text-rose-800 font-semibold block mt-1">
              Initial stability broken by sudden drop to 89% (P1) then 84% (P0 Critical)
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-semibold">Patient:</span>
              <span className="font-bold text-slate-800">P014 (Bed 14)</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-semibold">Stable Phase:</span>
              <span className="font-bold text-slate-800">92% (14:02) → 91% (14:07) = Grouped (EP-014)</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-semibold">Escalation Trigger:</span>
              <span className="font-extrabold text-amber-700">89% (14:11) • P1 Breakout enforced</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-semibold">Critical Event:</span>
              <span className="font-extrabold text-red-700">84% (14:14) • P0 EMERGENCY BREAKOUT</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500 font-semibold">Safety Result:</span>
              <span className="font-extrabold text-red-700">Group Closed + Immediate P0 Alert Card Fired</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
