// WardAlert Sentinel - Patients & Ward Bed Directory Page
import React, { useState, useEffect } from 'react';
import { Users, Bed, Heart, Activity, AlertTriangle, ShieldCheck, Thermometer, Stethoscope } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Patient } from '../types';

export const PatientsPage: React.FC = () => {
  const { getAuthHeaders } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  useEffect(() => {
    fetch('/api/patients', { headers: getAuthHeaders() })
      .then(res => res.json())
      .then(data => setPatients(data.patients || []))
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  }, [getAuthHeaders]);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center text-[#8B1E2F]">
              <Users className="w-5 h-5" />
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              Ward 4B Patient Bed Directory
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            28 acute monitored beds with continuous telemetry, physiological baselines, and risk stratification.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Beds Occupied:</span>
          <span className="text-xs font-black px-2.5 py-1 rounded-full bg-slate-800 text-white">
            {patients.length} / 28
          </span>
        </div>
      </div>

      {/* Bed Grid Matrix */}
      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center text-slate-400 font-medium">
          Loading ward patient records...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {patients.map((p) => {
            const isCritical = p.riskLevel === 'CRITICAL';
            const isHigh = p.riskLevel === 'HIGH';

            return (
              <div
                key={p.id}
                onClick={() => setSelectedPatient(p)}
                className={`bg-white rounded-2xl border p-4 shadow-sm hover:shadow-md transition-all cursor-pointer ${
                  isCritical
                    ? 'border-red-300 ring-1 ring-red-200'
                    : isHigh
                    ? 'border-amber-200'
                    : 'border-slate-200/80'
                }`}
              >
                {/* Card Top */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-slate-900">{p.bed}</span>
                    <span className="text-xs font-semibold text-slate-400">({p.id})</span>
                  </div>
                  <span
                    className={`text-[0.65rem] font-bold px-2 py-0.5 rounded-full ${
                      isCritical
                        ? 'bg-red-100 text-red-800'
                        : isHigh
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {p.riskLevel}
                  </span>
                </div>

                {/* Patient Bio */}
                <div className="text-xs font-bold text-slate-700 truncate mb-1">
                  {p.syntheticDiagnosis}
                </div>
                <div className="text-[0.7rem] text-slate-400 mb-3">
                  Age {p.age} • {p.gender === 'M' ? 'Male' : 'Female'}
                </div>

                {/* Vital Snapshot Grid */}
                <div className="grid grid-cols-3 gap-1.5 p-2 bg-slate-50 rounded-xl border border-slate-100 text-center text-[0.68rem]">
                  <div>
                    <div className="text-slate-400 font-medium">HR</div>
                    <div className="font-extrabold text-slate-800">{p.baselineHR} <span className="text-[0.6rem] font-normal">bpm</span></div>
                  </div>
                  <div>
                    <div className="text-slate-400 font-medium">BP (Sys)</div>
                    <div className="font-extrabold text-slate-800">{p.baselineBPSys}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 font-medium">SpO₂</div>
                    <div className={`font-extrabold ${p.id === 'P014' ? 'text-red-600 font-black' : 'text-slate-800'}`}>
                      {p.id === 'P014' ? '84%' : `${p.baselineSpO2}%`}
                    </div>
                  </div>
                </div>

                {/* Card Bottom: Active Alert indicator */}
                {p.alerts && p.alerts.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[0.68rem] text-red-600 font-bold">
                    <span className="flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      <span>{p.alerts.length} Active Alert{p.alerts.length > 1 ? 's' : ''}</span>
                    </span>
                    <span className="text-slate-400 text-[0.65rem] font-medium">View chart &gt;</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Patient Detail Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold text-red-700 uppercase tracking-wider">Patient Telemetry Profile</span>
                <h3 className="text-lg font-black text-slate-900">
                  {selectedPatient.bed} • Patient {selectedPatient.id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPatient(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-slate-500 font-semibold">Synthetic Clinical Diagnosis:</div>
                <div className="text-slate-900 font-bold text-sm mt-0.5">{selectedPatient.syntheticDiagnosis}</div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="p-2.5 bg-slate-50 rounded-xl border text-center">
                  <span className="text-slate-400 font-bold block text-[0.65rem]">Baseline HR</span>
                  <span className="text-base font-extrabold text-slate-800">{selectedPatient.baselineHR} bpm</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border text-center">
                  <span className="text-slate-400 font-bold block text-[0.65rem]">Baseline BP</span>
                  <span className="text-base font-extrabold text-slate-800">{selectedPatient.baselineBPSys}/{selectedPatient.baselineBPDia}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border text-center">
                  <span className="text-slate-400 font-bold block text-[0.65rem]">Baseline SpO₂</span>
                  <span className="text-base font-extrabold text-slate-800">{selectedPatient.baselineSpO2}%</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border text-center">
                  <span className="text-slate-400 font-bold block text-[0.65rem]">Resp Rate</span>
                  <span className="text-base font-extrabold text-slate-800">{selectedPatient.baselineRR} /min</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedPatient(null)}
                className="px-4 py-2 bg-[#8B1E2F] hover:bg-[#721523] text-white text-xs font-bold rounded-xl"
              >
                Close Chart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
