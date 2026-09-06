// WardAlert Sentinel - Right Safety Information Column (~300px)
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  AlertTriangle,
  Users,
  Layers,
  TrendingUp,
  Crosshair,
  Server,
  Play,
  Bell,
  BarChart3,
  Eye
} from 'lucide-react';
import { useView } from '../../context/ViewContext';
import { useAlerts } from '../../context/AlertContext';

export const RightSafetyPanel: React.FC = () => {
  const navigate = useNavigate();
  const { simpleView, toggleSimpleView } = useView();
  const { openDemoModal, openActionModal, alerts, criticalAlerts, summary } = useAlerts();

  // Dynamic Snapshot values from actual alert data
  const criticalCount = summary?.activeCritical ?? criticalAlerts.length;
  const patientsCount = summary?.patientsCount ?? 28;
  const activeEpisodes = summary?.activeEpisodesCount ?? 12;
  const sensitivityPct = summary?.sensitivityPct ?? 98.9;

  // Focus patient: P014 or first critical alert
  const focusAlert = criticalAlerts.find(a => a.patientId === 'P014') || criticalAlerts[0] || {
    id: 'ALT-10014',
    patientId: 'P014',
    alertType: 'LOW_SPO2',
    severity: 'P0' as const,
    context: 'Oxygen deterioration',
    observedValue: 84
  };

  return (
    <aside
      className="w-full xl:w-[300px] flex-shrink-0 space-y-4"
      aria-label="Ward Safety Snapshot and Actions"
    >
      {/* 1. WARD SAFETY SNAPSHOT */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
          <ShieldAlert className="w-5 h-5 text-[#8B1E2F]" />
          <h2 className="text-sm font-bold text-slate-800 tracking-tight">Ward Safety Snapshot</h2>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-medium">
            <div className="flex items-center gap-2 text-slate-600">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span>Critical alerts</span>
            </div>
            <span className="font-bold text-red-600 text-sm">{criticalCount}</span>
          </div>

          <div className="flex items-center justify-between text-xs font-medium">
            <div className="flex items-center gap-2 text-slate-600">
              <Users className="w-4 h-4 text-slate-400" />
              <span>Patients monitored</span>
            </div>
            <span className="font-bold text-slate-700 text-sm">{patientsCount}</span>
          </div>

          <div className="flex items-center justify-between text-xs font-medium">
            <div className="flex items-center gap-2 text-slate-600">
              <Layers className="w-4 h-4 text-purple-500" />
              <span>Active episodes</span>
            </div>
            <span className="font-bold text-slate-700 text-sm">{activeEpisodes}</span>
          </div>

          <div className="flex items-center justify-between text-xs font-medium">
            <div className="flex items-center gap-2 text-slate-600">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span>High-priority sensitivity</span>
            </div>
            <span className="font-bold text-emerald-600 text-sm">{sensitivityPct}%</span>
          </div>
        </div>
      </div>

      {/* 2. TODAY'S FOCUS */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Crosshair className="w-4 h-4 text-[#8B1E2F]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Today's Focus</h3>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-bold text-slate-900">Patient {focusAlert.patientId}</div>
            <div className="text-xs text-slate-500">{focusAlert.context || focusAlert.alertType.replace('_', ' ')}</div>
          </div>
          <button
            type="button"
            onClick={() => openActionModal(focusAlert as any, 'REVIEW')}
            className="px-3.5 py-1.5 border border-rose-200 text-[#8B1E2F] hover:bg-rose-50 text-xs font-semibold rounded-lg transition-colors"
          >
            Review
          </button>
        </div>
      </div>

      {/* 3. SYSTEM STATUS */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
          <Server className="w-4 h-4 text-slate-500" />
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">System Status</h3>
        </div>

        <div className="space-y-2.5 text-xs font-medium">
          <div className="flex items-center justify-between">
            <span className="text-slate-600">● Alert ingestion</span>
            <span className="font-semibold text-emerald-600">Running</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600">● Analyzer</span>
            <span className="font-semibold text-emerald-600">Running</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600">● Audit logging</span>
            <span className="font-semibold text-emerald-600">Running</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600">● Synthetic data</span>
            <span className="font-semibold text-emerald-600">Enabled</span>
          </div>
        </div>
      </div>

      {/* 4. QUICK ACTIONS */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-2.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Quick Actions</h3>

        <button
          type="button"
          onClick={openDemoModal}
          className="w-full flex items-center gap-2.5 px-4 py-2.5 bg-rose-50/70 hover:bg-rose-100/70 border border-rose-100 text-[#8B1E2F] font-semibold text-xs rounded-xl transition-all shadow-sm"
        >
          <Play className="w-4 h-4 fill-[#8B1E2F] text-[#8B1E2F]" />
          <span>Run Demo Scenario</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/alerts')}
          className="w-full flex items-center gap-2.5 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-700 font-semibold text-xs rounded-xl transition-all"
        >
          <Bell className="w-4 h-4 text-slate-500" />
          <span>Open Live Alerts</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/before-after')}
          className="w-full flex items-center gap-2.5 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-700 font-semibold text-xs rounded-xl transition-all"
        >
          <BarChart3 className="w-4 h-4 text-slate-500" />
          <span>View Before vs After</span>
        </button>
      </div>

      {/* 5. SIMPLE VIEW TOGGLE */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex items-center justify-between">
        <div className="flex items-start gap-2.5">
          <Eye className="w-4 h-4 text-slate-400 mt-0.5" />
          <div>
            <div className="text-xs font-bold text-slate-800">Simple View</div>
            <div className="text-[0.68rem] text-slate-500">Larger text and simplified view</div>
          </div>
        </div>

        <button
          type="button"
          id="simple-view-toggle"
          role="switch"
          aria-checked={simpleView}
          onClick={toggleSimpleView}
          className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ${
            simpleView ? 'bg-[#8B1E2F]' : 'bg-slate-300'
          }`}
        >
          <div
            className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
              simpleView ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
    </aside>
  );
};
