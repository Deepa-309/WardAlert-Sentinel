// WardAlert Sentinel - Critical Alerts Dedicated Safety Console
import React from 'react';
import { Siren, ShieldAlert, ArrowUpRight, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { useAlerts } from '../context/AlertContext';

export const CriticalAlertsPage: React.FC = () => {
  const { criticalAlerts, openEvidenceModal, openActionModal } = useAlerts();

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-md">
              <Siren className="w-5 h-5 animate-pulse" />
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              P0 Critical Emergency Console
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Immediate attention queue for life-threatening vital deteriorations and breakout alerts.
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-full bg-red-100 border border-red-200 text-red-800 font-extrabold text-xs flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4 text-red-600" />
          <span>Breakout Safety Enforcement Active</span>
        </div>
      </div>

      {/* Critical Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {criticalAlerts.map((alert) => (
          <div
            key={alert.id}
            className="bg-white rounded-3xl border-2 border-red-300 p-6 shadow-md relative overflow-hidden"
          >
            {/* Top Badge */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="bg-red-600 text-white font-black text-xs px-2.5 py-1 rounded-lg">
                  CRITICAL P0
                </span>
                <span className="font-extrabold text-slate-900 text-sm">
                  Patient {alert.patientId} • {alert.patient?.bed || 'Ward Bed'}
                </span>
              </div>
              <span className="text-xs font-semibold text-slate-400">
                {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            {/* Title & Values */}
            <div className="text-sm font-bold text-slate-700 mb-2">
              {alert.context || alert.alertType.replace('_', ' ')}
            </div>

            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-3xl font-black text-red-600 tracking-tight">
                {alert.observedValue}{alert.alertType === 'LOW_SPO2' ? '%' : alert.alertType === 'HYPOTENSION' ? ' mmHg' : ' bpm'}
              </span>
              <span className="text-xs font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                {alert.deviation}
              </span>
            </div>

            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Critical threshold breached. Patient requires immediate bedside respiratory and hemodynamic assessment.
            </p>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => openEvidenceModal(alert)}
                className="flex-1 py-2 px-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all text-center"
              >
                View Evidence
              </button>
              <button
                type="button"
                onClick={() => openActionModal(alert, 'ESCALATE')}
                className="flex-1 py-2 px-3 bg-[#8B1E2F] hover:bg-[#721523] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <span>Escalate to RRT</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
