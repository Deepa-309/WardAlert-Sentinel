// WardAlert Sentinel - Immutable Audit Trail Page
import React, { useState, useEffect } from 'react';
import { FileText, Search, ShieldCheck, Clock, Download } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AuditLogItem } from '../types';

export const AuditLogPage: React.FC = () => {
  const { getAuthHeaders } = useAuth();
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  const fetchLogs = () => {
    setLoading(true);
    fetch('/api/audit', { headers: getAuthHeaders() })
      .then(res => res.json())
      .then(data => setLogs(data.logs || []))
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLogs();
  }, [getAuthHeaders]);

  const filteredLogs = logs.filter(l => {
    const matchesSearch =
      l.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.reason && l.reason.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesAction = actionFilter === 'ALL' || l.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  const availableActions = [
    'ALL',
    'ROLE_CHANGED',
    'ALERT_VIEWED',
    'ALERT_ACKNOWLEDGED',
    'ALERT_ESCALATED',
    'ALERT_DISMISSED',
    'ALERT_OVERRIDDEN',
    'NOTIFICATION_READ',
    'DEMO_STARTED',
    'THRESHOLD_CHANGED'
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800">
              <FileText className="w-5 h-5" />
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              Clinical & System Audit Trail
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Immutable log of all clinician responses, threshold modifications, episode groupings, and system events.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            id="btn-refresh-audit-logs"
            onClick={fetchLogs}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl shadow-sm transition-all"
          >
            <Clock className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            id="btn-export-audit-json"
            onClick={() => {
              const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `wardalert-audit-${Date.now()}.json`;
              a.click();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl shadow-sm transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export Audit JSON</span>
          </button>
        </div>
      </div>

      {/* Search & Action Filter */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm space-y-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="audit-log-search-input"
            type="text"
            placeholder="Search audit trail by user, action, reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#8B1E2F]"
          />
        </div>

        {/* Action Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
          <span className="text-[0.68rem] font-bold text-slate-500 mr-1">Filter Action:</span>
          {availableActions.map((act) => (
            <button
              key={act}
              type="button"
              id={`filter-action-${act.toLowerCase()}`}
              onClick={() => setActionFilter(act)}
              className={`px-2.5 py-1 rounded-lg text-[0.68rem] font-bold transition-all ${
                actionFilter === act
                  ? 'bg-[#8B1E2F] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {act === 'ALL' ? 'All Actions' : act.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[0.68rem] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Alert ID</th>
                <th className="py-3.5 px-4">Clinical Justification / Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                    Loading audit trail...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                    No audit records match your query.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 text-slate-500 font-medium whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                      {log.user}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold text-[0.68rem]">
                        {log.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-[#8B1E2F] whitespace-nowrap">
                      {log.action}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500 text-[0.7rem]">
                      {log.alertId || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 max-w-md">
                      {log.reason || 'System automated execution'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
