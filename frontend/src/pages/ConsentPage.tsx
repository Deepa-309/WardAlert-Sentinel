// WardAlert Sentinel - Standalone Consent & Research Protocol Page
import React from 'react';
import { ShieldCheck, Info, CheckCircle2 } from 'lucide-react';
import { BrandLogo } from '../components/common/BrandLogo';
import { useAlerts } from '../context/AlertContext';

export const ConsentPage: React.FC = () => {
  const { acceptConsent } = useAlerts();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm text-center space-y-6">
        <div className="flex justify-center">
          <BrandLogo size="lg" showSubtitle={true} align="center" />
        </div>

        <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 mx-auto flex items-center justify-center text-emerald-600 shadow-sm">
          <ShieldCheck className="w-8 h-8" />
        </div>

        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Research & Simulation Protocol
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            WardAlert Sentinel: Smart Alert-Fatigue Analyzer (Final-Year Academic MVP)
          </p>
        </div>

        <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl text-left text-xs text-slate-600 leading-relaxed space-y-3">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
            <Info className="w-4 h-4 text-[#8B1E2F]" />
            <span>Research Prototype Notice</span>
          </div>
          <p>
            This prototype uses <strong>simulated hospital data</strong> for research and demonstration. <strong>No real patient information is being processed.</strong>
          </p>
          <p>
            The synthetic physiological vitals, telemetry alarms, and patient profiles were procedurally generated using an algorithmically reproducible pseudo-random seed to benchmark alert reduction without exposing protected health information (PHI).
          </p>
          <p className="text-[0.68rem] text-slate-400">
            Disclaimer: Not for direct clinical diagnostic or therapeutic use in human patients.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            acceptConsent();
            window.location.href = '/';
          }}
          className="w-full py-3.5 px-6 bg-[#8B1E2F] hover:bg-[#721523] text-white font-bold text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>I Understand & Continue to Ward Console</span>
        </button>
      </div>
    </div>
  );
};
