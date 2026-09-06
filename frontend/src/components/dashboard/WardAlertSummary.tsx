// WardAlert Sentinel - Ward Alert Summary (4 Mini Cards)
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Siren, AlertTriangle, AlertCircle, Layers, ChevronRight } from 'lucide-react';
import { useAlerts } from '../../context/AlertContext';

export const WardAlertSummary: React.FC = () => {
  const navigate = useNavigate();
  const { summary, alerts, criticalAlerts } = useAlerts();

  const critical = summary?.activeCritical ?? criticalAlerts.filter(a => a.severity === 'P0').length;
  const high = summary?.highPriority ?? alerts.filter(a => a.severity === 'P1').length;
  const moderate = summary?.moderate ?? alerts.filter(a => a.severity === 'P2').length;
  const grouped = summary?.groupedAlerts ?? alerts.filter(a => !!a.episodeId).length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 md:p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base md:text-lg font-bold text-slate-900 tracking-tight">
          Ward Alert Summary
        </h2>
        <button
          type="button"
          onClick={() => navigate('/alerts')}
          className="text-xs font-semibold text-[#8B1E2F] hover:text-[#70121F] flex items-center gap-1 transition-colors"
        >
          <span>View full summary</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 4 Mini Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Card 1: CRITICAL */}
        <div className="bg-rose-50/40 border border-rose-100 rounded-xl p-3 text-center flex flex-col items-center justify-center">
          <Siren className="w-5 h-5 text-red-600 mb-1" />
          <div className="text-[0.68rem] font-bold uppercase tracking-wider text-red-700">
            CRITICAL
          </div>
          <div className="text-2xl font-black text-slate-900 mt-0.5">
            {critical}
          </div>
        </div>

        {/* Card 2: HIGH */}
        <div className="bg-amber-50/40 border border-amber-100 rounded-xl p-3 text-center flex flex-col items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-amber-600 mb-1" />
          <div className="text-[0.68rem] font-bold uppercase tracking-wider text-amber-700">
            HIGH
          </div>
          <div className="text-2xl font-black text-slate-900 mt-0.5">
            {high}
          </div>
        </div>

        {/* Card 3: MODERATE */}
        <div className="bg-yellow-50/40 border border-yellow-100 rounded-xl p-3 text-center flex flex-col items-center justify-center">
          <AlertCircle className="w-5 h-5 text-yellow-600 mb-1" />
          <div className="text-[0.68rem] font-bold uppercase tracking-wider text-yellow-800">
            MODERATE
          </div>
          <div className="text-2xl font-black text-slate-900 mt-0.5">
            {moderate}
          </div>
        </div>

        {/* Card 4: GROUPED */}
        <div className="bg-purple-50/40 border border-purple-100 rounded-xl p-3 text-center flex flex-col items-center justify-center">
          <Layers className="w-5 h-5 text-purple-600 mb-1" />
          <div className="text-[0.68rem] font-bold uppercase tracking-wider text-purple-700">
            GROUPED
          </div>
          <div className="text-2xl font-black text-slate-900 mt-0.5">
            {grouped}
          </div>
        </div>
      </div>
    </div>
  );
};
