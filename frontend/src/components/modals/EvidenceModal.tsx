// WardAlert Sentinel - Explainable Clinical Evidence Modal
import React from 'react';
import { X, AlertTriangle, Activity, TrendingDown, CheckCircle2, ShieldAlert } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import { useAlerts } from '../../context/AlertContext';
import { EvidenceData } from '../../types';

export const EvidenceModal: React.FC = () => {
  const { selectedAlertForEvidence, closeEvidenceModal, openActionModal } = useAlerts();

  if (!selectedAlertForEvidence) return null;

  let evidence: EvidenceData = {
    currentValue: `${selectedAlertForEvidence.observedValue}%`,
    threshold: selectedAlertForEvidence.severity === 'P0' ? '<85%' : '<90%',
    previousObservations: ['93%', '92%', '92%', '93%', '92%', `${selectedAlertForEvidence.observedValue}%`],
    trend: selectedAlertForEvidence.deviation || 'Rapid deterioration (-8% in 15 min)',
    duration: '15 minutes',
    supportingObservations: 6,
    reason: 'Critical threshold crossed after persistent deterioration.',
    clinicalImplication: 'Severe hypoxemia with risk of acute tissue hypoperfusion.',
    recommendedAction: 'Immediate high-flow oxygen, airway evaluation, notify Medical Registrar / RRT.'
  };

  if (selectedAlertForEvidence.evidenceJson) {
    try {
      evidence = { ...evidence, ...JSON.parse(selectedAlertForEvidence.evidenceJson) };
    } catch (e) {
      // fallback to generated evidence
    }
  }

  // Chart data from previous observations
  const chartData = evidence.previousObservations.map((obs, idx) => {
    const val = parseFloat(obs.replace(/[^0-9.]/g, ''));
    return {
      t: `T-${(evidence.previousObservations.length - 1 - idx) * 3}m`,
      value: val
    };
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100/80 flex items-center justify-center text-red-700">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-red-700">
                CLINICAL EVIDENCE AUDIT
              </div>
              <h2 className="text-lg font-black text-slate-900">
                Why is this high priority?
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={closeEvidenceModal}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Patient Header Banner */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-xs font-semibold text-slate-400">Patient Identifier:</span>
              <div className="text-base font-extrabold text-slate-900">
                Patient {selectedAlertForEvidence.patientId} • {selectedAlertForEvidence.patient?.bed || 'Bed 14'}
              </div>
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400">Alert Classification:</span>
              <div className="text-base font-extrabold text-red-600">
                {selectedAlertForEvidence.severity === 'P0' ? 'P0 Critical Emergency' : 'P1 High Priority'}
              </div>
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400">Telemetry Trigger:</span>
              <div className="text-base font-extrabold text-slate-800">
                {selectedAlertForEvidence.alertType.replace('_', ' ')}
              </div>
            </div>
          </div>

          {/* Metric Key Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-rose-50/50 p-3 rounded-xl border border-rose-100">
              <span className="text-[0.68rem] font-bold uppercase text-red-700">Current Value</span>
              <div className="text-2xl font-black text-red-700 mt-1">{evidence.currentValue}</div>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[0.68rem] font-bold uppercase text-slate-400">Critical Threshold</span>
              <div className="text-xl font-black text-slate-800 mt-1">{evidence.threshold}</div>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[0.68rem] font-bold uppercase text-slate-400">Observation Window</span>
              <div className="text-xl font-black text-slate-800 mt-1">{evidence.duration}</div>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[0.68rem] font-bold uppercase text-slate-400">Data Points</span>
              <div className="text-xl font-black text-slate-800 mt-1">{evidence.supportingObservations}</div>
            </div>
          </div>

          {/* Physiological Trend Visualizer */}
          <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/30">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#8B1E2F]" />
                <span className="text-xs font-bold text-slate-800">15-Minute Observation Trajectory</span>
              </div>
              <span className="text-xs font-bold text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">
                {evidence.trend}
              </span>
            </div>

            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="t" stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <YAxis domain={['dataMin - 3', 'dataMax + 2']} stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#8B1E2F"
                    strokeWidth={2.5}
                    dot={{ fill: '#8B1E2F', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Sequence Pills */}
            <div className="flex items-center justify-center gap-1.5 pt-3 border-t border-slate-200/60 text-xs font-semibold text-slate-600">
              <span className="text-slate-400 mr-1">Readings:</span>
              {evidence.previousObservations.map((val, idx) => (
                <React.Fragment key={idx}>
                  <span className={`px-2 py-0.5 rounded ${idx === evidence.previousObservations.length - 1 ? 'bg-red-600 text-white font-bold' : 'bg-slate-200/80 text-slate-700'}`}>
                    {val}
                  </span>
                  {idx < evidence.previousObservations.length - 1 && (
                    <span className="text-slate-300">→</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Clinical Rationale (Plain Language) */}
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-800 mb-1">
                Clinical Rationale
              </div>
              <p className="text-sm font-medium text-slate-800 leading-relaxed">
                {evidence.reason}
              </p>
              {evidence.clinicalImplication && (
                <p className="text-xs text-slate-600 mt-2">
                  <span className="font-semibold text-slate-700">Implication: </span>
                  {evidence.clinicalImplication}
                </p>
              )}
            </div>

            {evidence.recommendedAction && (
              <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80 flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-0.5">
                    Recommended Clinical Action
                  </div>
                  <p className="text-xs font-medium text-emerald-900 leading-relaxed">
                    {evidence.recommendedAction}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={closeEvidenceModal}
            className="px-4 py-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl transition-all"
          >
            Close
          </button>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                closeEvidenceModal();
                openActionModal(selectedAlertForEvidence, 'ACKNOWLEDGE');
              }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl transition-all"
            >
              Acknowledge
            </button>
            <button
              type="button"
              onClick={() => {
                closeEvidenceModal();
                openActionModal(selectedAlertForEvidence, 'ESCALATE');
              }}
              className="px-5 py-2 bg-[#8B1E2F] hover:bg-[#70121F] text-white font-bold text-xs rounded-xl shadow-sm transition-all"
            >
              Escalate to RRT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
