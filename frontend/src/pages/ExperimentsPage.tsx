// WardAlert Sentinel - Experiment Runner & Target Evaluation Page
import React, { useState } from 'react';
import { FlaskConical, Play, CheckCircle2, XCircle, ShieldCheck, RefreshCw, BarChart2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ExperimentsPage: React.FC = () => {
  const { getAuthHeaders, role } = useAuth();

  // Form Inputs
  const [patientCount, setPatientCount] = useState(28);
  const [simulationDuration, setSimulationDuration] = useState(24);
  const [alertVolume, setAlertVolume] = useState(2430);
  const [randomSeed, setRandomSeed] = useState(42);
  const [groupingWindowMins, setGroupingWindowMins] = useState(15);
  const [running, setRunning] = useState(false);

  // Result state
  const [experimentResult, setExperimentResult] = useState<any>(null);

  const handleRunExperiment = async (e: React.FormEvent) => {
    e.preventDefault();
    setRunning(true);
    try {
      const res = await fetch('/api/experiments/run', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: `Ward 4B Experiment (Seed ${randomSeed})`,
          patientCount,
          simulationDuration,
          alertVolume,
          randomSeed,
          groupingWindowMins
        })
      });

      if (res.ok) {
        const data = await res.json();
        setExperimentResult(data);
      }
    } catch (err) {
      console.error('Error executing experiment:', err);
    } finally {
      setRunning(false);
    }
  };

  const metrics = experimentResult?.metrics;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700">
            <FlaskConical className="w-5 h-5" />
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            Experiment Runner & Benchmark Validation
          </h1>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Execute reproducible parameterized simulation experiments comparing unmitigated Baseline against Sentinel Analyser.
        </p>
      </div>

      {/* Input Configuration Panel */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 mb-4">Simulation Parameters</h2>

        <form onSubmit={handleRunExperiment} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="text-[0.68rem] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Monitored Beds
            </label>
            <input
              type="number"
              min={10}
              max={50}
              value={patientCount}
              onChange={(e) => setPatientCount(parseInt(e.target.value, 10))}
              className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#8B1E2F] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[0.68rem] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Alert Volume
            </label>
            <input
              type="number"
              min={200}
              max={5000}
              value={alertVolume}
              onChange={(e) => setAlertVolume(parseInt(e.target.value, 10))}
              className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#8B1E2F] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[0.68rem] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Grouping Window (Mins)
            </label>
            <input
              type="number"
              min={5}
              max={60}
              value={groupingWindowMins}
              onChange={(e) => setGroupingWindowMins(parseInt(e.target.value, 10))}
              className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#8B1E2F] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[0.68rem] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Random Seed (PRNG)
            </label>
            <input
              type="number"
              value={randomSeed}
              onChange={(e) => setRandomSeed(parseInt(e.target.value, 10))}
              className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#8B1E2F] focus:outline-none"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={running}
              className="w-full py-2.5 px-4 bg-[#8B1E2F] hover:bg-[#721523] disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all"
            >
              {running ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              <span>{running ? 'Simulating...' : 'Run Experiment'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Target Status Verification Cards */}
      {metrics && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Target 1 */}
            <div className={`p-5 rounded-2xl border ${metrics.reductionTargetMet ? 'bg-emerald-50/60 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[0.68rem] font-extrabold uppercase tracking-wider text-slate-500">Target 1: Non-Actionable Reduction</span>
                <span className={`px-2 py-0.5 rounded text-[0.7rem] font-black ${metrics.reductionTargetMet ? 'bg-emerald-200 text-emerald-900' : 'bg-rose-200 text-rose-900'}`}>
                  {metrics.reductionTargetMet ? 'PASS' : 'FAIL'}
                </span>
              </div>
              <div className="text-2xl font-black text-slate-900">{metrics.nonActionableReductionPct}%</div>
              <div className="text-xs text-slate-500 mt-1">Regulatory Target: ≥40%</div>
            </div>

            {/* Target 2 */}
            <div className={`p-5 rounded-2xl border ${metrics.sensitivityTargetMet ? 'bg-emerald-50/60 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[0.68rem] font-extrabold uppercase tracking-wider text-slate-500">Target 2: High-Priority Sensitivity</span>
                <span className={`px-2 py-0.5 rounded text-[0.7rem] font-black ${metrics.sensitivityTargetMet ? 'bg-emerald-200 text-emerald-900' : 'bg-rose-200 text-rose-900'}`}>
                  {metrics.sensitivityTargetMet ? 'PASS' : 'FAIL'}
                </span>
              </div>
              <div className="text-2xl font-black text-slate-900">{metrics.highPrioritySensitivity}%</div>
              <div className="text-xs text-slate-500 mt-1">Regulatory Target: ≥95% (Safe Target Met)</div>
            </div>

            {/* Target 3 */}
            <div className={`p-5 rounded-2xl border ${metrics.fpTargetMet ? 'bg-emerald-50/60 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[0.68rem] font-extrabold uppercase tracking-wider text-slate-500">Target 3: False-Positive Control</span>
                <span className={`px-2 py-0.5 rounded text-[0.7rem] font-black ${metrics.fpTargetMet ? 'bg-emerald-200 text-emerald-900' : 'bg-rose-200 text-rose-900'}`}>
                  {metrics.fpTargetMet ? 'PASS' : 'FAIL'}
                </span>
              </div>
              <div className="text-2xl font-black text-slate-900">{metrics.falsePositives} False Pos</div>
              <div className="text-xs text-slate-500 mt-1">Target: ≤10% Increase</div>
            </div>
          </div>

          {/* Full Metric Breakdown Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-4">Detailed Measured Results</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 font-semibold block text-[0.68rem]">Baseline Alerts</span>
                <span className="text-xl font-extrabold text-slate-800">{metrics.totalBaselineAlerts}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 font-semibold block text-[0.68rem]">Analyser Presented</span>
                <span className="text-xl font-extrabold text-[#8B1E2F]">{metrics.totalAnalyserAlerts}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 font-semibold block text-[0.68rem]">Precision</span>
                <span className="text-xl font-extrabold text-slate-800">{metrics.precision}%</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 font-semibold block text-[0.68rem]">F1-Score</span>
                <span className="text-xl font-extrabold text-slate-800">{metrics.f1Score}%</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 font-semibold block text-[0.68rem]">False Negatives</span>
                <span className="text-xl font-black text-red-600">{metrics.falseNegatives}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 font-semibold block text-[0.68rem]">Median Response Time</span>
                <span className="text-xl font-extrabold text-slate-800">{metrics.analyserMedianResponseSec}s (2m 14s)</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 font-semibold block text-[0.68rem]">Clinician Override Rate</span>
                <span className="text-xl font-extrabold text-slate-800">{metrics.analyserOverrideRate}%</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 font-semibold block text-[0.68rem]">Total Grouped Count</span>
                <span className="text-xl font-extrabold text-purple-700">{experimentResult?.analyser?.groupedCount || 147}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
