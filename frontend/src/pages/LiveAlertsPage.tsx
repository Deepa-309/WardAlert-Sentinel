// WardAlert Sentinel - Live Alerts Page
import React, { useState, useEffect } from 'react';
import {
  Bell,
  Filter,
  Search,
  AlertTriangle,
  Siren,
  Clock,
  CheckCircle,
  Eye,
  ArrowUpRight,
  ShieldAlert,
  MoreHorizontal,
  ChevronDown
} from 'lucide-react';
import { useAlerts } from '../context/AlertContext';
import { useAuth } from '../context/AuthContext';
import { Alert } from '../types';

export const LiveAlertsPage: React.FC = () => {
  const { getAuthHeaders, isActionPermitted, role } = useAuth();
  const { alerts: sharedAlerts, refreshData: refreshSharedAlerts, openEvidenceModal, openActionModal } = useAlerts();

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (severityFilter !== 'ALL') params.append('severity', severityFilter);
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (searchQuery) params.append('search', searchQuery);
      params.append('limit', '100');

      const res = await fetch(`/api/alerts?${params.toString()}`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setAlerts(data.alerts || []);
        setTotal(data.total || 0);
      }
    } catch (e) {
      console.error('Failed to load alerts:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [severityFilter, statusFilter, sharedAlerts]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAlerts();
  };

  const handleAction = (alert: Alert, action: 'ACKNOWLEDGE' | 'ESCALATE' | 'DISMISS' | 'OVERRIDE' | 'SNOOZE' | 'REVIEW') => {
    setActiveDropdownId(null);
    openActionModal(alert, action);
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center text-[#8B1E2F]">
              <Bell className="w-5 h-5" />
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              Live Ward Telemetry Alerts
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time feed of ingested physiological alarms with automated deduplication and priority triage.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Total Active:</span>
          <span className="text-xs font-black px-2.5 py-1 rounded-full bg-[#8B1E2F] text-white">
            {total || alerts.length} alerts
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="live-alerts-search-input"
            type="text"
            placeholder="Search patient ID, bed, alert..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#8B1E2F]"
          />
        </form>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1 text-xs font-semibold text-slate-500 mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Priority:</span>
          </div>
          {['ALL', 'P0', 'P1', 'P2', 'P3'].map((sev) => (
            <button
              key={sev}
              type="button"
              id={`filter-priority-${sev.toLowerCase()}`}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                severityFilter === sev
                  ? 'bg-[#8B1E2F] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {sev === 'P0' ? 'P0 Critical' : sev === 'P1' ? 'P1 High' : sev === 'P2' ? 'P2 Mod' : sev === 'P3' ? 'P3 Low' : 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase text-[0.68rem] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Severity</th>
                <th className="py-3.5 px-4">Patient / Bed</th>
                <th className="py-3.5 px-4">Alert Type</th>
                <th className="py-3.5 px-4">Observed Value</th>
                <th className="py-3.5 px-4">Deviation</th>
                <th className="py-3.5 px-4">Time Triggered</th>
                <th className="py-3.5 px-4">Clinician Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading && alerts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                    Loading live ward alerts...
                  </td>
                </tr>
              ) : alerts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                    No alerts match the active filter criteria.
                  </td>
                </tr>
              ) : (
                alerts.map((alert) => {
                  const isP0 = alert.severity === 'P0';
                  const isP1 = alert.severity === 'P1';

                  return (
                    <tr
                      key={alert.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isP0 ? 'bg-rose-50/20' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[0.7rem] font-extrabold px-2 py-0.5 rounded ${
                            isP0
                              ? 'bg-red-100 text-red-800'
                              : isP1
                              ? 'bg-amber-100 text-amber-800'
                              : alert.severity === 'P2'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {isP0 && <Siren className="w-3 h-3 text-red-600 animate-pulse" />}
                          {isP1 && <AlertTriangle className="w-3 h-3 text-amber-600" />}
                          {alert.severity}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">
                          {alert.patientId}
                        </div>
                        <div className="text-[0.68rem] text-slate-500">
                          {alert.patient?.bed || 'Ward Bed'}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {alert.alertType.replace(/_/g, ' ')}
                      </td>

                      <td className="py-3.5 px-4 font-extrabold text-slate-900">
                        {alert.observedValue}
                        <span className="text-[0.68rem] font-normal text-slate-400 ml-1">
                          ({alert.referenceRange})
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-medium text-slate-600">
                        {alert.deviation || 'Threshold breached'}
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 text-[0.72rem]">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[0.68rem] font-bold px-2 py-0.5 rounded-full ${
                            alert.clinicianResponse === 'ACKNOWLEDGED'
                              ? 'bg-blue-100 text-blue-800'
                              : alert.clinicianResponse === 'ESCALATED'
                              ? 'bg-red-100 text-red-800'
                              : alert.clinicianResponse === 'REVIEWED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : alert.clinicianResponse === 'OVERRIDDEN'
                              ? 'bg-purple-100 text-purple-800'
                              : alert.clinicianResponse === 'DISMISSED'
                              ? 'bg-slate-200 text-slate-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {alert.clinicianResponse}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right relative">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Evidence Button */}
                          <button
                            type="button"
                            id={`btn-evidence-${alert.id}`}
                            onClick={() => openEvidenceModal(alert)}
                            className="px-2.5 py-1 border border-slate-300 hover:bg-slate-100 rounded-lg text-slate-700 font-semibold text-[0.72rem] transition-colors flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Evidence</span>
                          </button>

                          {/* Primary Quick Action Button */}
                          {isP0 && isActionPermitted('ESCALATE') ? (
                            <button
                              type="button"
                              id={`btn-action-escalate-${alert.id}`}
                              onClick={() => handleAction(alert, 'ESCALATE')}
                              className="px-3 py-1 rounded-lg bg-[#8B1E2F] hover:bg-[#721523] text-white font-bold text-[0.72rem] shadow-sm transition-all"
                            >
                              Escalate
                            </button>
                          ) : isActionPermitted('ACKNOWLEDGE') ? (
                            <button
                              type="button"
                              id={`btn-action-ack-${alert.id}`}
                              onClick={() => handleAction(alert, 'ACKNOWLEDGE')}
                              className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-bold text-[0.72rem] shadow-sm transition-all"
                            >
                              Acknowledge
                            </button>
                          ) : null}

                          {/* More Actions Dropdown */}
                          <div className="relative inline-block">
                            <button
                              type="button"
                              id={`btn-more-actions-${alert.id}`}
                              onClick={() => setActiveDropdownId(activeDropdownId === alert.id ? null : alert.id)}
                              className="p-1 text-slate-500 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                            >
                              <MoreHorizontal className="w-3.5 h-3.5" />
                            </button>

                            {activeDropdownId === alert.id && (
                              <div className="absolute right-0 mt-1 w-36 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-30 text-left">
                                {isActionPermitted('REVIEW') && (
                                  <button
                                    type="button"
                                    onClick={() => handleAction(alert, 'REVIEW')}
                                    className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 font-medium text-left block"
                                  >
                                    Review
                                  </button>
                                )}
                                {isActionPermitted('ACKNOWLEDGE') && (
                                  <button
                                    type="button"
                                    onClick={() => handleAction(alert, 'ACKNOWLEDGE')}
                                    className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 font-medium text-left block"
                                  >
                                    Acknowledge
                                  </button>
                                )}
                                {isActionPermitted('ESCALATE') && (
                                  <button
                                    type="button"
                                    onClick={() => handleAction(alert, 'ESCALATE')}
                                    className="w-full px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 font-semibold text-left block"
                                  >
                                    Escalate
                                  </button>
                                )}
                                {isActionPermitted('SNOOZE') && (
                                  <button
                                    type="button"
                                    onClick={() => handleAction(alert, 'SNOOZE')}
                                    className="w-full px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 font-medium text-left block"
                                  >
                                    Snooze (15m)
                                  </button>
                                )}
                                {isActionPermitted('DISMISS') && (
                                  <button
                                    type="button"
                                    onClick={() => handleAction(alert, 'DISMISS')}
                                    className="w-full px-3 py-1.5 text-xs text-amber-700 hover:bg-amber-50 font-medium text-left block"
                                  >
                                    Dismiss
                                  </button>
                                )}
                                {isActionPermitted('OVERRIDE') && (
                                  <button
                                    type="button"
                                    onClick={() => handleAction(alert, 'OVERRIDE')}
                                    className="w-full px-3 py-1.5 text-xs text-purple-700 hover:bg-purple-50 font-medium text-left block border-t border-slate-100"
                                  >
                                    Override
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
