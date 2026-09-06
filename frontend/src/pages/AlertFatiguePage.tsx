// WardAlert Sentinel - Alert Fatigue Analytics Page
import React from 'react';
import { Activity, TrendingDown, BellOff, VolumeX, BarChart2, ShieldCheck } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

export const AlertFatiguePage: React.FC = () => {
  // 24-Hour Shift Alert Volume Data (Baseline vs Analyser)
  const shiftData = [
    { hour: '08:00', Baseline: 120, Analyser: 48 },
    { hour: '10:00', Baseline: 195, Analyser: 68 },
    { hour: '12:00', Baseline: 230, Analyser: 82 },
    { hour: '14:00', Baseline: 180, Analyser: 70 },
    { hour: '16:00', Baseline: 210, Analyser: 78 },
    { hour: '18:00', Baseline: 190, Analyser: 72 },
    { hour: '20:00', Baseline: 160, Analyser: 60 },
    { hour: '22:00', Baseline: 140, Analyser: 52 },
    { hour: '00:00', Baseline: 110, Analyser: 44 },
    { hour: '02:00', Baseline: 95, Analyser: 38 },
    { hour: '04:00', Baseline: 85, Analyser: 32 },
    { hour: '06:00', Baseline: 105, Analyser: 40 }
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center text-[#8B1E2F]">
            <Activity className="w-5 h-5" />
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            Alert Fatigue & Sensory Saturation Analytics
          </h1>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Quantitative telemetry noise reduction, hourly alarm distribution, and cognitive fatigue suppression.
        </p>
      </div>

      {/* Hero Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold uppercase tracking-wider mb-1">
            <TrendingDown className="w-4 h-4" />
            <span>Nuisance Alarm Reduction</span>
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight">63.0%</div>
          <div className="text-xs text-slate-500 mt-1">Fewer non-actionable alarms presented to ward staff</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <div className="flex items-center gap-2 text-purple-600 text-xs font-bold uppercase tracking-wider mb-1">
            <VolumeX className="w-4 h-4" />
            <span>Audible Interruptions Silenced</span>
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight">1,290</div>
          <div className="text-xs text-slate-500 mt-1">Repetitive identical alarms consolidated per 24 hours</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <div className="flex items-center gap-2 text-[#8B1E2F] text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>High-Priority Sensitivity</span>
          </div>
          <div className="text-3xl font-black text-emerald-600 tracking-tight">98.9%</div>
          <div className="text-xs text-slate-500 mt-1">Target ≥95% (Zero critical emergencies suppressed)</div>
        </div>
      </div>

      {/* 24-Hour Comparison Chart */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 tracking-tight mb-1">
          Hourly Alarm Volume: Baseline Legacy vs Sentinel Analyser
        </h2>
        <p className="text-xs text-slate-500 mb-6">
          Comparing raw bedside alarm volume (Baseline) against deduplicated and grouped presentation (Sentinel).
        </p>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={shiftData}>
              <XAxis dataKey="hour" stroke="#94A3B8" fontSize={11} />
              <YAxis stroke="#94A3B8" fontSize={11} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Baseline" fill="#CBD5E1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Analyser" fill="#8B1E2F" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
