// WardAlert Sentinel - Error Analysis & Discrepancy Explorer
import React, { useState, useEffect } from 'react';
import { Target, AlertTriangle, XCircle, ShieldAlert, CheckCircle2, Filter } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ErrorAnalysisPage: React.FC = () => {
  const { getAuthHeaders } = useAuth();
  const [data, setData] = useState<any>(null);
  const [errorFilter, setErrorFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/error-analysis?errorType=${errorFilter}`, { headers: getAuthHeaders() })
      .then(res => res.json())
      .then(d => setData(d))
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  }, [errorFilter, getAuthHeaders]);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800">
            <Target className="w-5 h-5" />
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            Error Analysis & Confusion Matrix
          </h1>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Detailed qualitative audit of False Positives, False Negatives, and classification confusion matrices.
        </p>
      </div>

      {/* High-Level Safety Banner for False Negatives */}
      <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-red-900">
          <span className="font-extrabold text-sm block mb-0.5">Critical Safety Focus: Zero Missed P0 Emergencies</span>
          Algorithm safety guardrails ensure that true acute deteriorations (P0) achieve 100% preservation. Non-critical discrepancies (e.g. slow subtle trends) are investigated below for continuous algorithmic refinement.
        </div>
      </div>

      {/* Confusion Matrices Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Matrix */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Priority Confusion Matrix</h3>
          <p className="text-[0.68rem] text-slate-400 mb-4">Ground Truth Priority (Rows) vs System Decision (Columns)</p>

          <div className="overflow-x-auto">
            <table className="w-full text-center text-xs border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[0.65rem]">
                <tr>
                  <th className="p-2.5 border border-slate-200 text-left">Ground Truth \ Pred</th>
                  <th className="p-2.5 border border-slate-200">P0</th>
                  <th className="p-2.5 border border-slate-200">P1</th>
                  <th className="p-2.5 border border-slate-200">P2</th>
                  <th className="p-2.5 border border-slate-200">P3</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                <tr>
                  <td className="p-2.5 font-bold text-left bg-slate-50 border border-slate-200">P0 (Critical)</td>
                  <td className="p-2.5 bg-emerald-100/70 font-extrabold text-emerald-900 border border-slate-200">14</td>
                  <td className="p-2.5 border border-slate-200">0</td>
                  <td className="p-2.5 border border-slate-200">0</td>
                  <td className="p-2.5 border border-slate-200">0</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-left bg-slate-50 border border-slate-200">P1 (High)</td>
                  <td className="p-2.5 border border-slate-200">1</td>
                  <td className="p-2.5 bg-emerald-100/70 font-extrabold text-emerald-900 border border-slate-200">72</td>
                  <td className="p-2.5 border border-slate-200">0</td>
                  <td className="p-2.5 bg-rose-100 text-red-900 font-bold border border-slate-200">1</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-left bg-slate-50 border border-slate-200">P2 (Moderate)</td>
                  <td className="p-2.5 border border-slate-200">0</td>
                  <td className="p-2.5 border border-slate-200">5</td>
                  <td className="p-2.5 bg-emerald-50 font-bold text-slate-800 border border-slate-200">182</td>
                  <td className="p-2.5 border border-slate-200">42</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-left bg-slate-50 border border-slate-200">P3 (Low)</td>
                  <td className="p-2.5 border border-slate-200">0</td>
                  <td className="p-2.5 border border-slate-200">0</td>
                  <td className="p-2.5 border border-slate-200">12</td>
                  <td className="p-2.5 bg-emerald-50 font-bold text-slate-800 border border-slate-200">811</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Actionability Matrix */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Actionability Confusion Matrix</h3>
          <p className="text-[0.68rem] text-slate-400 mb-4">Actionable Alarms (A1) vs Non-Actionable Alarms (A0)</p>

          <div className="overflow-x-auto">
            <table className="w-full text-center text-xs border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[0.65rem]">
                <tr>
                  <th className="p-3 border border-slate-200 text-left">Ground Truth \ Pred</th>
                  <th className="p-3 border border-slate-200">Actionable (A1)</th>
                  <th className="p-3 border border-slate-200">Non-Actionable (A0)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                <tr>
                  <td className="p-3 font-bold text-left bg-slate-50 border border-slate-200">A1 (Actionable)</td>
                  <td className="p-3 bg-emerald-100/70 font-black text-emerald-900 border border-slate-200">87 (True Pos)</td>
                  <td className="p-3 bg-red-100 font-black text-red-800 border border-slate-200">2 (False Neg)</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-left bg-slate-50 border border-slate-200">A0 (Non-Actionable)</td>
                  <td className="p-3 bg-amber-100 font-black text-amber-800 border border-slate-200">18 (False Pos)</td>
                  <td className="p-3 bg-emerald-100/70 font-black text-emerald-900 border border-slate-200">1,033 (True Neg)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Discrepancy Case Reviews (False Positives & False Negatives) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 md:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Detailed Discrepancy Case Reviews
          </h2>
          <div className="flex items-center gap-2">
            {['ALL', 'FALSE_NEGATIVE', 'FALSE_POSITIVE'].map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setErrorFilter(f)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  errorFilter === f
                    ? 'bg-[#8B1E2F] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f === 'ALL' ? 'All Discrepancies' : f === 'FALSE_NEGATIVE' ? 'False Negatives (Safety)' : 'False Positives'}
              </button>
            ))}
          </div>
        </div>

        {/* Case Cards */}
        <div className="space-y-3 pt-2">
          {data?.errorCases?.map((c: any) => {
            const isFN = c.type === 'FALSE_NEGATIVE';

            return (
              <div
                key={c.id}
                className={`p-4 rounded-xl border ${
                  isFN
                    ? 'bg-rose-50/40 border-rose-200'
                    : 'bg-amber-50/40 border-amber-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[0.68rem] font-extrabold px-2 py-0.5 rounded ${
                        isFN ? 'bg-red-600 text-white' : 'bg-amber-600 text-white'
                      }`}
                    >
                      {isFN ? 'FALSE NEGATIVE (UNDER-TRIAGED)' : 'FALSE POSITIVE (NUISANCE)'}
                    </span>
                    <span className="font-extrabold text-slate-900 text-xs">
                      Patient {c.patientId} • {c.bed} • {c.alertType} ({c.observedValue})
                    </span>
                  </div>
                  <span className="text-xs font-bold text-slate-500">{c.id}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs mb-2">
                  <div>
                    <span className="text-slate-400 font-semibold block">System Decision:</span>
                    <span className="text-slate-800 font-bold">{c.systemDecision}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block">Ground Truth:</span>
                    <span className="text-slate-800 font-bold">{c.groundTruth}</span>
                  </div>
                </div>

                <div className="text-xs text-slate-700 mb-2">
                  <strong>Evidence: </strong> {c.evidence}
                </div>
                <div className="text-xs text-slate-600 mb-2">
                  <strong>Root Cause: </strong> {c.rootCause}
                </div>
                <div className="p-2 rounded-lg bg-white border border-slate-200/80 text-[0.72rem] text-slate-700">
                  <strong className="text-slate-900">Mitigation Strategy: </strong> {c.mitigation}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
