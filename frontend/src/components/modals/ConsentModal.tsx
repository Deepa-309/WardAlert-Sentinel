// WardAlert Sentinel - Mandatory First-Launch Research Consent Modal
import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';
import { useAlerts } from '../../context/AlertContext';

export const ConsentModal: React.FC = () => {
  const { isConsentOpen, acceptConsent } = useAlerts();

  if (!isConsentOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 md:p-8 text-center space-y-5">
        {/* Brand Logo */}
        <div className="flex justify-center">
          <BrandLogo size="lg" showSubtitle={true} align="center" />
        </div>

        <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 mx-auto flex items-center justify-center text-emerald-600 shadow-sm">
          <ShieldCheck className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Research & Demonstration Prototype
          </h2>
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs text-slate-600 leading-relaxed text-left space-y-2">
            <div className="flex items-start gap-2 text-slate-800 font-bold">
              <Info className="w-4 h-4 text-[#8B1E2F] flex-shrink-0 mt-0.5" />
              <span>Notice to Users:</span>
            </div>
            <p>
              This prototype uses <strong>simulated hospital data</strong> for research and demonstration. <strong>No real patient information is being processed.</strong>
            </p>
            <p className="text-[0.68rem] text-slate-500">
              All telemetry signals, clinical rules, and priority thresholds are synthetic approximations intended solely for academic evaluation and clinical UI/UX demonstration.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={acceptConsent}
          className="w-full py-3.5 px-6 bg-[#8B1E2F] hover:bg-[#721523] text-white font-bold text-sm rounded-2xl shadow-md transition-all transform active:scale-98"
        >
          I Understand & Continue
        </button>
      </div>
    </div>
  );
};
