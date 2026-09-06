// WardAlert Sentinel - Clinical Edge Cases & Safety Guardrails Page
import React, { useState, useEffect } from 'react';
import { Workflow, Play, CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const EdgeCasesPage: React.FC = () => {
  const { getAuthHeaders } = useAuth();
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [activeScenario, setActiveScenario] = useState<any>(null);
  const [executionLog, setExecutionLog] = useState<any>(null);
  const [executing, setExecuting] = useState(false);

  useEffect(() => {
    fetch('/api/edge-cases', { headers: getAuthHeaders() })
      .then(res => res.json())
      .then(d => {
        setScenarios(d.scenarios || []);
        if (d.scenarios && d.scenarios.length > 0) {
          setActiveScenario(d.scenarios[0]);
        }
      })
      .catch(e => console.error(e));
  }, [getAuthHeaders]);

  const handleRunScenario = async (scenarioId: string) => {
    setExecuting(true);
    try {
      const res = await fetch(`/api/edge-cases/run/${scenarioId}`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setExecutionLog(data);
      }
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center text-[#8B1E2F]">
            <Workflow className="w-5 h-5" />
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            Safety Guardrails & Clinical Edge Cases
          </h1>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Interactive execution of 5 specialized edge cases demonstrating regulatory safety invariants and anti-fatigue dampening.
        </p>
      </div>

      {/* Scenario Selection Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {scenarios.map((s, idx) => {
          const isSelected = activeScenario?.id === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                setActiveScenario(s);
                setExecutionLog(null);
              }}
              className={`p-4 rounded-2xl border text-left transition-all ${
                isSelected
                  ? 'bg-rose-50/50 border-[#8B1E2F] shadow-sm'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="text-[0.68rem] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Scenario {idx + 1}
              </div>
              <div className="font-bold text-xs text-slate-900 line-clamp-2">
                {s.name}
              </div>
              <div className="mt-2 text-[0.65rem] font-semibold text-[#8B1E2F] bg-rose-100/60 inline-block px-1.5 py-0.5 rounded">
                {s.category}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Scenario Detailed View */}
      {activeScenario && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {activeScenario.category}
              </div>
              <h2 className="text-xl font-black text-slate-900 mt-0.5">
                {activeScenario.name}
              </h2>
              <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                {activeScenario.description}
              </p>
            </div>

            <button
              type="button"
              disabled={executing}
              onClick={() => handleRunScenario(activeScenario.id)}
              className="px-5 py-2.5 bg-[#8B1E2F] hover:bg-[#721523] disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all flex-shrink-0"
            >
              {executing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white" />}
              <span>RUN EDGE CASE</span>
            </button>
          </div>

          {/* Expected Behavior vs Safety Check */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[0.68rem] font-bold uppercase text-slate-400 block mb-1">Expected Clinical Behavior</span>
              <p className="text-xs font-medium text-slate-800 leading-relaxed">
                {activeScenario.expectedBehavior}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200">
              <span className="text-[0.68rem] font-bold uppercase text-emerald-800 block mb-1">Safety Invariant Check</span>
              <p className="text-xs font-bold text-emerald-900 leading-relaxed flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{activeScenario.safetyCheck}</span>
              </p>
            </div>
          </div>

          {/* Timeline Events */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Telemetry Event Timeline & System Actions
            </h3>

            <div className="space-y-3">
              {activeScenario.timelineEvents.map((evt: any, eIdx: number) => {
                const isBreakout = evt.isBreakout;
                const isSuppressed = evt.isSuppressed;

                return (
                  <div
                    key={eIdx}
                    className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isBreakout
                        ? 'bg-rose-50 border-rose-300 ring-1 ring-rose-200'
                        : isSuppressed
                        ? 'bg-slate-50 border-slate-200 opacity-90'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">
                        {evt.timeLabel}
                      </span>
                      <div>
                        <div className="text-xs font-bold text-slate-900">
                          {evt.vital}: <span className="text-[#8B1E2F]">{evt.value}</span>
                        </div>
                        <div className="text-[0.7rem] text-slate-500">{evt.rawSignal}</div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:text-right text-xs">
                      <div className="text-slate-400 text-[0.68rem]">
                        Legacy Baseline: {evt.baselineAction}
                      </div>
                      <div className={`font-bold ${isBreakout ? 'text-red-700' : 'text-slate-800'}`}>
                        Sentinel: {evt.sentinelAction}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
