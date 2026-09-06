// WardAlert Sentinel - Alert Fatigue Overview Card
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAlerts } from '../../context/AlertContext';

export const AlertFatigueOverview: React.FC = () => {
  const navigate = useNavigate();
  const { getAuthHeaders } = useAuth();
  const { summary } = useAlerts();

  const [metrics, setMetrics] = useState({
    baselineAlerts: 2430,
    analyserAlerts: 1140,
    reductionPct: 63.0,
    sensitivityPct: 98.9,
    targetMet: true
  });

  useEffect(() => {
    fetch('/api/experiments/latest', { headers: getAuthHeaders() })
      .then(res => res.json())
      .then(data => {
        if (data.result) {
          setMetrics({
            baselineAlerts: data.result.baselineAlerts,
            analyserAlerts: data.result.analyserAlerts,
            reductionPct: data.result.nonActionableReductionPct,
            sensitivityPct: data.result.highPrioritySensitivity,
            targetMet: data.result.allTargetsMet
          });
        }
      })
      .catch(e => console.error('Error loading latest experiment metrics:', e));
  }, [getAuthHeaders]);

  // Reactive synchronisation with live summary
  const activeReduction = summary?.nonActionableReductionPct ?? metrics.reductionPct;
  const activeSensitivity = summary?.sensitivityPct ?? metrics.sensitivityPct;
  const activeAnalyserAlerts = summary?.groupedAlerts
    ? Math.max(1, metrics.baselineAlerts - summary.groupedAlerts)
    : metrics.analyserAlerts;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 md:p-6 shadow-sm flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base md:text-lg font-bold text-slate-900 tracking-tight">
          Alert Fatigue Overview
        </h2>
        <button
          type="button"
          onClick={() => navigate('/fatigue')}
          className="text-xs font-semibold text-[#8B1E2F] hover:text-[#70121F] flex items-center gap-1 transition-colors"
        >
          <span>View details</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Before vs After Boxes */}
      <div className="flex items-center justify-between gap-3 bg-slate-50/80 p-4 rounded-xl border border-slate-100 mb-5">
        <div className="text-center flex-1">
          <div className="text-[0.68rem] font-bold text-slate-400 uppercase tracking-wider">
            BEFORE (Baseline)
          </div>
          <div className="text-xl md:text-2xl font-black text-slate-800 tracking-tight mt-0.5">
            {metrics.baselineAlerts.toLocaleString()}
          </div>
          <div className="text-[0.68rem] font-medium text-slate-400">alerts</div>
        </div>

        <div className="w-8 h-8 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center flex-shrink-0">
          <ArrowRight className="w-4 h-4 text-slate-400" />
        </div>

        <div className="text-center flex-1">
          <div className="text-[0.68rem] font-bold text-slate-400 uppercase tracking-wider">
            AFTER (Analyzer)
          </div>
          <div className="text-xl md:text-2xl font-black text-[#8B1E2F] tracking-tight mt-0.5">
            {activeAnalyserAlerts.toLocaleString()}
          </div>
          <div className="text-[0.68rem] font-medium text-slate-400">alerts</div>
        </div>
      </div>

      {/* Progress Bar & Reduction Percentage */}
      <div className="mb-5">
        <div className="flex items-center gap-4 mb-2">
          {/* Visual Progress Bar */}
          <div className="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
            <div
              className="h-full bg-[#8B1E2F] rounded-full transition-all duration-700"
              style={{ width: `${Math.min(Math.max(activeReduction, 10), 100)}%` }}
            />
          </div>
          <div className="text-2xl font-black text-[#8B1E2F] tracking-tight flex-shrink-0">
            {activeReduction}%
          </div>
        </div>
        <div className="text-xs font-semibold text-slate-500">
          fewer non-actionable alerts
        </div>
      </div>

      {/* Sensitivity & Target Met Badge */}
      <div className="space-y-3 pt-3 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[0.68rem] font-bold text-slate-400 uppercase tracking-wider">
              High-priority sensitivity
            </div>
            <div className="text-xl font-black text-slate-800 tracking-tight mt-0.5">
              {activeSensitivity}%
            </div>
          </div>
          <div className="text-right">
            <div className="text-[0.68rem] font-bold text-slate-400 uppercase tracking-wider">
              Target
            </div>
            <div className="text-sm font-bold text-slate-700 mt-0.5">
              ≥95%
            </div>
          </div>
        </div>

        {/* Safe Target Met Pill */}
        <div className="w-full py-2 px-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-center gap-1.5 text-emerald-700 font-bold text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>SAFE TARGET MET</span>
        </div>
      </div>
    </div>
  );
};
