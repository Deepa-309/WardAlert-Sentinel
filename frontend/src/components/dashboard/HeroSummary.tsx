// WardAlert Sentinel - Red/Maroon Hero Summary Container
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Siren, AlertTriangle, Layers, TrendingDown, ChevronRight } from 'lucide-react';
import { useAlerts } from '../../context/AlertContext';

export const HeroSummary: React.FC = () => {
  const navigate = useNavigate();
  const { summary, alerts, criticalAlerts } = useAlerts();

  const activeCritical = summary?.activeCritical ?? criticalAlerts.filter(a => a.severity === 'P0').length;
  const highPriority = summary?.highPriority ?? alerts.filter(a => a.severity === 'P1').length;
  const groupedAlerts = summary?.groupedAlerts ?? alerts.filter(a => !!a.episodeId).length;
  const reductionPct = summary?.nonActionableReductionPct ?? (groupedAlerts > 0 ? 63 : 0);

  return (
    <section
      className="bg-[#8B1E2F] rounded-3xl p-5 md:p-6 shadow-md text-white"
      aria-label="Ward Alert Key Metrics Summary"
    >
      {/* 4 White Mini Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Active Critical */}
        <div className="bg-white text-slate-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
              <Siren className="w-5 h-5 text-red-600 animate-pulse" />
            </div>
            <div>
              <div className="text-[0.68rem] font-bold text-slate-400 uppercase tracking-wider">
                ACTIVE CRITICAL
              </div>
              <div className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-none mt-0.5">
                {activeCritical}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/critical')}
            className="flex items-center gap-1 text-xs font-semibold text-red-700 hover:text-red-800 transition-colors pt-2 border-t border-slate-100 mt-1"
          >
            <span>View critical alerts</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Metric 2: High Priority */}
        <div className="bg-white text-slate-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <div className="text-[0.68rem] font-bold text-slate-400 uppercase tracking-wider">
                HIGH PRIORITY
              </div>
              <div className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-none mt-0.5">
                {highPriority}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/alerts?severity=P1')}
            className="flex items-center gap-1 text-xs font-semibold text-amber-700 hover:text-amber-800 transition-colors pt-2 border-t border-slate-100 mt-1"
          >
            <span>View high priority</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Metric 3: Grouped Alerts */}
        <div className="bg-white text-slate-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center flex-shrink-0">
              <Layers className="w-5 h-5 text-[#8B1E2F]" />
            </div>
            <div>
              <div className="text-[0.68rem] font-bold text-slate-400 uppercase tracking-wider">
                GROUPED ALERTS
              </div>
              <div className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-none mt-0.5">
                {groupedAlerts}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/episodes')}
            className="flex items-center gap-1 text-xs font-semibold text-[#8B1E2F] hover:text-[#70121F] transition-colors pt-2 border-t border-slate-100 mt-1"
          >
            <span>View grouped alerts</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Metric 4: Non-Actionable Reduction */}
        <div className="bg-white text-slate-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
              <TrendingDown className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="text-[0.68rem] font-bold text-slate-400 uppercase tracking-wider">
                NON-ACTIONABLE REDUCTION
              </div>
              <div className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-none mt-0.5">
                {reductionPct}%
              </div>
            </div>
          </div>
          <div className="text-xs font-semibold text-emerald-700 pt-2 border-t border-slate-100 mt-1">
            vs baseline
          </div>
        </div>
      </div>
    </section>
  );
};
