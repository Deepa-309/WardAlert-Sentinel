// WardAlert Sentinel - Clinician Action & Override Dialog
import React, { useState } from 'react';
import { X, CheckCircle, ShieldAlert, AlertTriangle, ArrowUpRight, VolumeX } from 'lucide-react';
import { useAlerts } from '../../context/AlertContext';
import { useAuth } from '../../context/AuthContext';

export const ActionModal: React.FC = () => {
  const { selectedAlertForAction, closeActionModal, performAction } = useAlerts();
  const { role, user } = useAuth();

  const [action, setAction] = useState<string>(selectedAlertForAction?.defaultAction || 'ACKNOWLEDGE');
  const [overrideReason, setOverrideReason] = useState<string>('');
  const [outcomeNotes, setOutcomeNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const [errorText, setErrorText] = useState('');

  if (!selectedAlertForAction) return null;

  const alert = selectedAlertForAction.alert;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');

    if ((action === 'OVERRIDE' || action === 'DISMISS') && !overrideReason.trim()) {
      setErrorText(`A clinical reason is strictly mandatory to ${action.toLowerCase()} this alert.`);
      return;
    }

    setSubmitting(true);
    try {
      const ok = await performAction(alert.id, action, overrideReason, outcomeNotes);
      if (ok) {
        closeActionModal();
      } else {
        setErrorText('Failed to submit response. Please verify permissions.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-[#8B1E2F]">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Clinician Response Action</h3>
              <div className="text-xs text-slate-500">
                Acting as: <span className="font-semibold text-slate-700">{user.name} ({role})</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={closeActionModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Target Alert Summary */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-900">
                Patient {alert.patientId} • {alert.context}
              </div>
              <div className="text-[0.68rem] text-slate-500">
                Alert ID: {alert.id} • Severity: {alert.severity}
              </div>
            </div>
            <span className="text-xs font-black text-red-600 bg-red-100 px-2 py-0.5 rounded">
              {alert.observedValue}
            </span>
          </div>

          {/* Action Select */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Select Action
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
              {[
                { id: 'ACKNOWLEDGE', label: 'Acknowledge', icon: CheckCircle },
                { id: 'REVIEW', label: 'Mark Reviewed', icon: CheckCircle },
                { id: 'ESCALATE', label: 'Escalate to RRT', icon: ArrowUpRight },
                { id: 'SNOOZE', label: 'Snooze (15m)', icon: VolumeX },
                { id: 'OVERRIDE', label: 'Clinical Override', icon: AlertTriangle },
                { id: 'DISMISS', label: 'Dismiss Alarm', icon: X }
              ].map((act) => {
                const Icon = act.icon;
                const isSelected = action === act.id;
                return (
                  <button
                    key={act.id}
                    type="button"
                    onClick={() => setAction(act.id)}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all ${
                      isSelected
                        ? 'border-[#8B1E2F] bg-rose-50/50 text-[#8B1E2F] font-bold shadow-sm'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{act.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reason input if OVERRIDE or DISMISS selected (Requirement 6: For Dismiss and Override, require a reason) */}
          {(action === 'OVERRIDE' || action === 'DISMISS') && (
            <div className="space-y-1.5 p-3 rounded-xl bg-amber-50 border border-amber-200 animate-in fade-in duration-150">
              <label className="text-xs font-bold text-amber-900 block">
                {action === 'OVERRIDE'
                  ? 'Clinical Override Justification (Mandatory)'
                  : 'Alarm Dismissal Reason (Mandatory)'}
              </label>
              <textarea
                required
                rows={2}
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                placeholder={
                  action === 'OVERRIDE'
                    ? 'e.g. Known chronic COPD baseline; patient comfortable with target SpO2 88-92%.'
                    : 'e.g. Sensor detached or artifact during patient movement; patient clinically stable.'
                }
                className="w-full text-xs p-2 rounded-lg border border-amber-300 focus:ring-2 focus:ring-[#8B1E2F] focus:outline-none"
              />
            </div>
          )}

          {/* Outcome Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              Clinical Assessment / Handover Notes (Optional)
            </label>
            <input
              type="text"
              value={outcomeNotes}
              onChange={(e) => setOutcomeNotes(e.target.value)}
              placeholder="e.g. 4L High-flow nasal cannula applied; patient responsive."
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#8B1E2F] focus:outline-none"
            />
          </div>

          {/* Error Message */}
          {errorText && (
            <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
              {errorText}
            </div>
          )}

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={closeActionModal}
              className="px-4 py-2 border border-slate-300 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-[#8B1E2F] hover:bg-[#721523] text-white text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              {submitting ? 'Submitting...' : 'Confirm Response'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
