// WardAlert Sentinel - Role-Based Access & User Selection Page
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCheck, Stethoscope, Shield, FlaskConical, Settings, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

export const RoleSelectionPage: React.FC = () => {
  const { role, setRole, user } = useAuth();
  const navigate = useNavigate();

  const roleCards: Array<{
    id: UserRole;
    name: string;
    title: string;
    icon: any;
    color: string;
    permissions: string[];
    description: string;
  }> = [
    {
      id: 'Nurse',
      name: 'Sarah Miller (RN)',
      title: 'Bedside Staff Nurse',
      icon: Stethoscope,
      color: 'blue',
      permissions: ['Live Alerts Ingestion', 'Acknowledge & Review', 'Snooze Alarms', 'Bedside Telemetry Trends'],
      description: 'Focused on assigned bedside patients; rapid triage and acknowledgement of non-actionable alarms.'
    },
    {
      id: 'Doctor',
      name: 'Dr. Michael Chen',
      title: 'Medical Registrar',
      icon: Stethoscope,
      color: 'red',
      permissions: ['P0 Emergency Console', 'Explainable AI Evidence', 'Rapid Response Escalation', 'Clinical Overrides'],
      description: 'Attending physician authority to review 15-min trajectory evidence, escalate to RRT, or chart clinical overrides.'
    },
    {
      id: 'Charge Nurse',
      name: 'Sister Emma Vance',
      title: 'Ward 4B Charge Nurse (Active)',
      icon: Shield,
      color: 'maroon',
      permissions: ['Full Ward Overview', 'Active Episodes Management', 'Real-Time Ward Safety Snapshot', 'Shift Handovers'],
      description: 'Ward oversight ensuring zero missed deteriorations, patient bed matrix monitoring, and shift triage.'
    },
    {
      id: 'Researcher',
      name: 'Dr. David Aris',
      title: 'Clinical Informatician',
      icon: FlaskConical,
      color: 'purple',
      permissions: ['Simulation Experiment Runner', 'Error Analysis & Confusion Matrices', 'Dataset Export', 'F1/Recall Benchmarking'],
      description: 'Runs reproducible parameter experiments with custom seeds, testing anti-fatigue algorithms.'
    },
    {
      id: 'Administrator',
      name: 'Alex Rivera',
      title: 'Health Systems Administrator',
      icon: Settings,
      color: 'slate',
      permissions: ['Threshold Boundaries Reconfiguration', 'Sliding Window Parameters', 'Immutable Audit Trail', 'User Governance'],
      description: 'Full governance access to adjust physiological alarm boundaries, deadband hysteresis, and audit security.'
    }
  ];

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800">
            <UserCheck className="w-5 h-5" />
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            Role-Based Access Control (RBAC) Switcher
          </h1>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Switch active clinical persona to experience role-tailored dashboards and verify enforced security permissions.
        </p>
      </div>

      {/* Role Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {roleCards.map((rc) => {
          const Icon = rc.icon;
          const isSelected = role === rc.id;

          return (
            <div
              key={rc.id}
              onClick={() => {
                setRole(rc.id);
              }}
              className={`bg-white rounded-3xl border p-6 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'border-[#8B1E2F] ring-2 ring-[#8B1E2F]/20'
                  : 'border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-[#8B1E2F]">
                    <Icon className="w-6 h-6" />
                  </div>
                  {isSelected ? (
                    <span className="flex items-center gap-1 text-[0.7rem] font-extrabold px-2.5 py-1 rounded-full bg-[#8B1E2F] text-white">
                      <Check className="w-3 h-3" />
                      <span>ACTIVE</span>
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-slate-400">Click to switch</span>
                  )}
                </div>

                <h3 className="text-base font-black text-slate-900">{rc.id}</h3>
                <div className="text-xs font-bold text-[#8B1E2F] mb-1">{rc.name}</div>
                <div className="text-[0.7rem] text-slate-400 mb-3">{rc.title}</div>
                <p className="text-xs text-slate-600 mb-4 leading-relaxed">{rc.description}</p>

                {/* Permissions List */}
                <div className="space-y-1 pt-3 border-t border-slate-100">
                  <span className="text-[0.65rem] font-bold uppercase text-slate-400 block mb-1">
                    Enforced Permissions:
                  </span>
                  {rc.permissions.map((p, pIdx) => (
                    <div key={pIdx} className="flex items-center gap-1.5 text-[0.7rem] font-semibold text-slate-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#8B1E2F]" />
                      <span>{p}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-5 mt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setRole(rc.id);
                    navigate('/');
                  }}
                  className={`w-full py-2 px-4 rounded-xl text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-[#8B1E2F] text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {isSelected ? 'Open Dashboard as ' + rc.id : 'Switch & Open'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
