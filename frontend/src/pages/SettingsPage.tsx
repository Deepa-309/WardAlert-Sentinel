// WardAlert Sentinel - Thresholds & System Settings Page
import React, { useState, useEffect } from 'react';
import { Settings, ShieldAlert, AlertTriangle, Check, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const SettingsPage: React.FC = () => {
  const { getAuthHeaders, role } = useAuth();
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetch('/api/settings', { headers: getAuthHeaders() })
      .then(res => res.json())
      .then(d => setSettings(d.settings))
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  }, [getAuthHeaders]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    setErrorMsg('');

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(settings)
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        const data = await res.json();
        setErrorMsg(data.error || 'Only Administrators can update clinical thresholds.');
      }
    } catch (err: any) {
      setErrorMsg('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const isAdmin = role === 'Administrator';

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800">
            <Settings className="w-5 h-5" />
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            Threshold Configuration & Grouping Parameters
          </h1>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Define physiological triage thresholds, sliding episode window limits, and deadband hysteresis.
        </p>
      </div>

      {/* Mandatory Non-Clinical Disclaimer Banner */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-amber-950 leading-relaxed">
          <span className="font-bold block mb-0.5 uppercase tracking-wider">Regulatory Notice</span>
          “Synthetic demonstration thresholds — not clinically validated.” Intended solely for final-year academic prototype demonstration and research evaluation.
        </div>
      </div>

      {/* Settings Form */}
      {loading || !settings ? (
        <div className="bg-white rounded-2xl p-12 text-center text-slate-400 font-medium">
          Loading system settings...
        </div>
      ) : (
        <form onSubmit={handleSave} className="bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900">Physiological Alarm Boundaries</h2>
            {!isAdmin && (
              <span className="text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
                Read-Only (Requires Administrator Role)
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* SpO2 */}
            <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 block">Oxygen Saturation (SpO₂)</span>
                {isAdmin && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      id="preset-spo2-default"
                      onClick={() => setSettings({
                        ...settings,
                        thresholds: { ...settings.thresholds, spO2_P0: 85, spO2_P1: 90 }
                      })}
                      className="text-[0.65rem] px-2 py-0.5 rounded bg-slate-200 hover:bg-slate-300 font-bold text-slate-700 transition-colors"
                    >
                      Preset: 85% / 90%
                    </button>
                  </div>
                )}
              </div>
              <div>
                <label className="text-[0.68rem] text-slate-500 font-semibold block mb-1">
                  P0 Critical Cutoff (&lt; %)
                </label>
                <input
                  type="number"
                  id="input-spo2-p0"
                  disabled={!isAdmin}
                  value={settings.thresholds.spO2_P0}
                  onChange={(e) => setSettings({
                    ...settings,
                    thresholds: { ...settings.thresholds, spO2_P0: parseFloat(e.target.value) }
                  })}
                  className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
              <div>
                <label className="text-[0.68rem] text-slate-500 font-semibold block mb-1">
                  P1 High Priority Cutoff (&lt; %)
                </label>
                <input
                  type="number"
                  id="input-spo2-p1"
                  disabled={!isAdmin}
                  value={settings.thresholds.spO2_P1}
                  onChange={(e) => setSettings({
                    ...settings,
                    thresholds: { ...settings.thresholds, spO2_P1: parseFloat(e.target.value) }
                  })}
                  className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
            </div>

            {/* Blood Pressure */}
            <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-bold text-slate-700 block">Systolic Blood Pressure (BP)</span>
              <div>
                <label className="text-[0.68rem] text-slate-500 font-semibold block mb-1">
                  P0 Critical Cutoff (&lt; mmHg)
                </label>
                <input
                  type="number"
                  id="input-bpsys-p0"
                  disabled={!isAdmin}
                  value={settings.thresholds.bpSys_P0}
                  onChange={(e) => setSettings({
                    ...settings,
                    thresholds: { ...settings.thresholds, bpSys_P0: parseFloat(e.target.value) }
                  })}
                  className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
              <div>
                <label className="text-[0.68rem] text-slate-500 font-semibold block mb-1">
                  P1 High Priority Cutoff (&lt; mmHg)
                </label>
                <input
                  type="number"
                  id="input-bpsys-p1"
                  disabled={!isAdmin}
                  value={settings.thresholds.bpSys_P1}
                  onChange={(e) => setSettings({
                    ...settings,
                    thresholds: { ...settings.thresholds, bpSys_P1: parseFloat(e.target.value) }
                  })}
                  className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
            </div>

            {/* Heart Rate */}
            <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-bold text-slate-700 block">Heart Rate (HR)</span>
              <div>
                <label className="text-[0.68rem] text-slate-500 font-semibold block mb-1">
                  P0 Tachycardia (&gt; bpm)
                </label>
                <input
                  type="number"
                  id="input-hr-p0"
                  disabled={!isAdmin}
                  value={settings.thresholds.hr_P0_high}
                  onChange={(e) => setSettings({
                    ...settings,
                    thresholds: { ...settings.thresholds, hr_P0_high: parseFloat(e.target.value) }
                  })}
                  className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
              <div>
                <label className="text-[0.68rem] text-slate-500 font-semibold block mb-1">
                  P1 Tachycardia (&gt; bpm)
                </label>
                <input
                  type="number"
                  id="input-hr-p1"
                  disabled={!isAdmin}
                  value={settings.thresholds.hr_P1_high}
                  onChange={(e) => setSettings({
                    ...settings,
                    thresholds: { ...settings.thresholds, hr_P1_high: parseFloat(e.target.value) }
                  })}
                  className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Temporal Grouping Settings */}
          <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Sliding Temporal Grouping Window (Minutes)
                </label>
                {isAdmin && (
                  <div className="flex items-center gap-1">
                    {[5, 10, 15, 30].map(mins => (
                      <button
                        key={mins}
                        type="button"
                        id={`preset-window-${mins}m`}
                        onClick={() => setSettings({ ...settings, groupingWindowMinutes: mins })}
                        className={`text-[0.65rem] px-2 py-0.5 rounded font-bold transition-colors ${
                          settings.groupingWindowMinutes === mins
                            ? 'bg-[#8B1E2F] text-white'
                            : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                        }`}
                      >
                        {mins}m
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <input
                type="number"
                id="input-grouping-window"
                disabled={!isAdmin}
                value={settings.groupingWindowMinutes}
                onChange={(e) => setSettings({ ...settings, groupingWindowMinutes: parseInt(e.target.value, 10) })}
                className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 bg-white"
              />
              <span className="text-[0.68rem] text-slate-400 mt-1 block">Options: 5m, 10m, 15m (default), 30m</span>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Boundary Hysteresis Deadband (± %)
              </label>
              <input
                type="number"
                id="input-hysteresis-deadband"
                step="0.1"
                disabled={!isAdmin}
                value={settings.hysteresisDeadbandPct}
                onChange={(e) => setSettings({ ...settings, hysteresisDeadbandPct: parseFloat(e.target.value) })}
                className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 bg-white"
              />
              <span className="text-[0.68rem] text-slate-400 mt-1 block">Prevents alarm cycling / thrashing around thresholds</span>
            </div>
          </div>

          {/* Error / Success Feedback */}
          {errorMsg && (
            <div className="p-3 bg-red-100 text-red-800 text-xs font-semibold rounded-xl">
              {errorMsg}
            </div>
          )}
          {saveSuccess && (
            <div className="p-3 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>Settings updated and logged to audit trail.</span>
            </div>
          )}

          {/* Action Buttons */}
          {isAdmin && (
            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                id="save-settings-btn"
                disabled={saving}
                className="px-6 py-2.5 bg-[#8B1E2F] hover:bg-[#721523] text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2"
              >
                {saving && <RefreshCw className="w-4 h-4 animate-spin" />}
                <span>Save Configuration</span>
              </button>
            </div>
          )}
        </form>
      )}
    </div>
  );
};
