// WardAlert Sentinel - Critical Attention Required Section
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ChevronRight, AlertCircle, ArrowDown, ArrowUp } from 'lucide-react';
import { useAlerts } from '../../context/AlertContext';
import { useAuth } from '../../context/AuthContext';
import { Alert } from '../../types';

export const CriticalAlertsSection: React.FC = () => {
  const navigate = useNavigate();
  const { criticalAlerts, alerts, openEvidenceModal, openActionModal } = useAlerts();
  const { isActionPermitted } = useAuth();

  // Active items: prioritize P0 critical alerts, followed by P1 high priority
  const displayItems = React.useMemo(() => {
    let items = criticalAlerts.filter(a => a.clinicianResponse !== 'DISMISSED');
    if (items.length === 0) {
      items = alerts.filter(a => (a.severity === 'P0' || a.severity === 'P1') && a.clinicianResponse !== 'DISMISSED').slice(0, 3);
    }
    return items.slice(0, 4);
  }, [criticalAlerts, alerts]);

  const getTimeAgo = (timestamp: string | Date) => {
    const diffMs = Date.now() - new Date(timestamp).getTime();
    const diffMins = Math.max(1, Math.floor(diffMs / 60000));
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours}h ago`;
  };

  const getVitalDetails = (alert: Alert) => {
    switch (alert.alertType) {
      case 'LOW_SPO2':
        return { label: 'SpO2', value: `${alert.observedValue}%`, isUp: false };
      case 'HYPOTENSION':
        return { label: 'BP (Sys)', value: `${alert.observedValue} mmHg`, isUp: false };
      case 'TACHYCARDIA':
        return { label: 'HR', value: `${alert.observedValue} bpm`, isUp: true };
      case 'BRADYCARDIA':
        return { label: 'HR', value: `${alert.observedValue} bpm`, isUp: false };
      case 'TACHYPNEA':
        return { label: 'RR', value: `${alert.observedValue} /min`, isUp: true };
      default:
        return { label: 'Observed', value: String(alert.observedValue), isUp: false };
    }
  };

  const criticalCount = criticalAlerts.length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 md:p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <h2 className="text-base md:text-lg font-bold text-slate-900 tracking-tight">
            Critical attention required
          </h2>
          <span className="min-w-5 h-5 px-1 rounded-full bg-red-600 text-white text-xs font-extrabold flex items-center justify-center">
            {criticalCount}
          </span>
        </div>
        <button
          type="button"
          onClick={() => navigate('/critical')}
          className="text-xs font-semibold text-red-700 hover:text-red-800 flex items-center gap-1 transition-colors"
        >
          <span>View all</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Cards List */}
      <div className="space-y-3.5">
        {displayItems.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 font-medium bg-slate-50/50 rounded-xl border border-slate-100">
            No unacknowledged critical emergencies currently active.
          </div>
        ) : (
          displayItems.map((item) => {
            const isCritical = item.severity === 'P0';
            const vital = getVitalDetails(item);
            const timeAgo = getTimeAgo(item.timestamp);

            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition-all ${
                  isCritical
                    ? 'bg-rose-50/30 border-rose-200/80 hover:border-rose-300'
                    : 'bg-amber-50/20 border-amber-200/70 hover:border-amber-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`text-[0.68rem] font-extrabold px-2 py-0.5 rounded tracking-wide ${
                        isCritical ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {isCritical ? 'CRITICAL' : 'HIGH'}
                    </span>
                    <span className="font-bold text-slate-800 text-sm">
                      Patient {item.patientId} • {item.patient?.bed || 'Bed 14'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-400 text-xs font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{timeAgo}</span>
                  </div>
                </div>

                {/* Title & Values */}
                <div className="text-xs font-semibold text-slate-600 mb-2">
                  {item.context || item.alertType.replace('_', ' ')}
                </div>

                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xs font-bold text-slate-500">{vital.label}</span>
                    <span
                      className={`text-lg font-black tracking-tight ${
                        isCritical ? 'text-red-600' : 'text-amber-600'
                      }`}
                    >
                      {vital.value}
                    </span>
                  </div>

                  <div
                    className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                      vital.isUp ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {vital.isUp ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                    <span>{item.deviation || (isCritical ? 'Critical threshold breach' : 'High priority')}</span>
                  </div>
                </div>

                {/* Status indicator if already responded */}
                {item.clinicianResponse && item.clinicianResponse !== 'UNACKNOWLEDGED' && (
                  <div className="text-[0.7rem] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded inline-block mb-2">
                    Status: {item.clinicianResponse}
                  </div>
                )}

                {/* Buttons */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => openEvidenceModal(item)}
                    className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-sm transition-all"
                  >
                    View Evidence
                  </button>

                  {isCritical ? (
                    isActionPermitted('ESCALATE') && (
                      <button
                        type="button"
                        onClick={() => openActionModal(item, 'ESCALATE')}
                        className="px-4 py-1.5 bg-[#8B1E2F] hover:bg-[#721523] text-white text-xs font-bold rounded-lg shadow-sm transition-all"
                      >
                        Escalate
                      </button>
                    )
                  ) : (
                    isActionPermitted('REVIEW') && (
                      <button
                        type="button"
                        onClick={() => openActionModal(item, 'REVIEW')}
                        className="px-3.5 py-1.5 border border-amber-300 bg-white hover:bg-amber-50 text-amber-900 text-xs font-semibold rounded-lg transition-all"
                      >
                        Review
                      </button>
                    )
                  )}

                  {isActionPermitted('ACKNOWLEDGE') && !isCritical && (
                    <button
                      type="button"
                      onClick={() => openActionModal(item, 'ACKNOWLEDGE')}
                      className="px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-all"
                    >
                      Acknowledge
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
