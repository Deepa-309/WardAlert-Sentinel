// WardAlert Sentinel - Left Sidebar Navigation (240px)
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Bell,
  Users,
  Layers,
  Activity,
  ArrowLeftRight,
  Target,
  FlaskConical,
  AlertTriangle,
  FileText,
  Workflow,
  Settings,
  BookOpen,
  Accessibility,
  Lock,
  UserCheck
} from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';
import { useView } from '../../context/ViewContext';
import { useAuth } from '../../context/AuthContext';
import { useAlerts } from '../../context/AlertContext';

export const Sidebar: React.FC<{
  isOpen?: boolean;
  isCollapsed?: boolean;
  mobileOpen?: boolean;
  onClose?: () => void;
}> = ({
  isCollapsed = false,
  mobileOpen = false,
  onClose
}) => {
  const location = useLocation();
  const { simpleView, toggleSimpleView } = useView();
  const { role } = useAuth();
  const { alerts, criticalAlerts, summary } = useAlerts();

  const totalAlertsCount = alerts.length > 0 ? alerts.length : (summary?.totalAlerts || 11);
  const activeCriticalCount = criticalAlerts.length > 0 ? criticalAlerts.length : (summary?.activeCritical || 3);

  // Dynamic Navigation Sections based on Role (Requirement 3)
  const getNavSections = () => {
    switch (role) {
      case 'Nurse':
        return [
          {
            title: 'BEDSIDE TELEMETRY',
            items: [
              { name: 'Live Alerts', path: '/alerts', icon: Bell, badge: totalAlertsCount },
              { name: 'Patients', path: '/patients', icon: Users },
              { name: 'Alert Episodes', path: '/episodes', icon: Layers }
            ]
          },
          {
            title: 'SYSTEM & HELP',
            items: [
              { name: 'User Guide', path: '/guide', icon: BookOpen },
              { name: 'Switch Role', path: '/roles', icon: UserCheck }
            ]
          }
        ];

      case 'Doctor':
        return [
          {
            title: 'CLINICAL TRIAGE',
            items: [
              { name: 'Live Alerts', path: '/alerts', icon: Bell, badge: totalAlertsCount },
              { name: 'Patients', path: '/patients', icon: Users },
              { name: 'Alert Episodes', path: '/episodes', icon: Layers }
            ]
          },
          {
            title: 'EMERGENCY SAFETY',
            items: [
              { name: 'Critical Alerts', path: '/critical', icon: AlertTriangle, badge: activeCriticalCount }
            ]
          },
          {
            title: 'SYSTEM & HELP',
            items: [
              { name: 'User Guide', path: '/guide', icon: BookOpen },
              { name: 'Switch Role', path: '/roles', icon: UserCheck }
            ]
          }
        ];

      case 'Researcher':
        return [
          {
            title: 'EVALUATION & BENCHMARKING',
            items: [
              { name: 'Experiments', path: '/experiments', icon: FlaskConical },
              { name: 'Before vs After', path: '/before-after', icon: ArrowLeftRight },
              { name: 'Error Analysis', path: '/error-analysis', icon: Target }
            ]
          },
          {
            title: 'SYSTEM & HELP',
            items: [
              { name: 'User Guide', path: '/guide', icon: BookOpen },
              { name: 'Switch Role', path: '/roles', icon: UserCheck }
            ]
          }
        ];

      case 'Administrator':
        return [
          {
            title: 'SYSTEM GOVERNANCE',
            items: [
              { name: 'Settings', path: '/settings', icon: Settings },
              { name: 'Audit Log', path: '/audit', icon: FileText }
            ]
          },
          {
            title: 'SYSTEM & HELP',
            items: [
              { name: 'User Guide', path: '/guide', icon: BookOpen },
              { name: 'Switch Role', path: '/roles', icon: UserCheck }
            ]
          }
        ];

      case 'Charge Nurse':
      default:
        return [
          {
            title: 'OVERVIEW',
            items: [
              { name: 'Dashboard', path: '/', icon: LayoutDashboard }
            ]
          },
          {
            title: 'WARD MANAGEMENT',
            items: [
              { name: 'Live Alerts', path: '/alerts', icon: Bell, badge: totalAlertsCount },
              { name: 'Patients', path: '/patients', icon: Users },
              { name: 'Alert Episodes', path: '/episodes', icon: Layers }
            ]
          },
          {
            title: 'ANALYTICS',
            items: [
              { name: 'Alert Fatigue', path: '/fatigue', icon: Activity },
              { name: 'Before vs After', path: '/before-after', icon: ArrowLeftRight }
            ]
          },
          {
            title: 'SAFETY',
            items: [
              { name: 'Critical Alerts', path: '/critical', icon: AlertTriangle, badge: activeCriticalCount },
              { name: 'Audit Log', path: '/audit', icon: FileText },
              { name: 'Edge Cases', path: '/edge-cases', icon: Workflow }
            ]
          },
          {
            title: 'SYSTEM',
            items: [
              { name: 'Settings', path: '/settings', icon: Settings },
              { name: 'User Guide', path: '/guide', icon: BookOpen },
              { name: 'Switch Role', path: '/roles', icon: UserCheck }
            ]
          }
        ];
    }
  };

  const navSections = getNavSections();

  return (
    <>
      {/* Mobile / Tablet Drawer Backdrop Overlay (Requirement 1: click outside -> close drawer) */}
      {mobileOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm md:hidden transition-opacity duration-200"
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-[240px] bg-white border-r border-slate-200/80 flex flex-col transition-transform duration-200 ease-in-out ${
          mobileOpen
            ? 'translate-x-0'
            : isCollapsed
            ? '-translate-x-full'
            : '-translate-x-full md:translate-x-0'
        }`}
        aria-label="Sidebar Navigation"
      >
        {/* Top Header Logo */}
        <div className="h-[72px] px-5 flex items-center border-b border-slate-100 justify-between">
          <BrandLogo size="md" showSubtitle={true} />
        </div>

        {/* Role Badge Indicator */}
        <div className="px-5 py-2 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between">
          <span className="text-[0.68rem] font-bold text-slate-400 uppercase tracking-wider">Role View:</span>
          <span className="text-[0.68rem] font-extrabold px-2 py-0.5 rounded bg-rose-100 text-[#8B1E2F]">
            {role}
          </span>
        </div>

        {/* Nav List */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          {navSections.map((sec, sIdx) => (
            <div key={sIdx} className="space-y-1">
              <div className="px-3 text-[0.68rem] font-bold tracking-wider text-slate-400 uppercase">
                {sec.title}
              </div>
              <div className="space-y-0.5">
                {sec.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    item.path === '/'
                      ? location.pathname === '/'
                      : location.pathname.startsWith(item.path);

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={onClose}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-[0.875rem] font-medium transition-all ${
                        isActive
                          ? 'bg-[#8B1E2F] text-white shadow-sm font-semibold'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        <span>{item.name}</span>
                      </div>
                      {item.badge !== undefined && (
                        <span
                          className={`text-[0.7rem] font-bold px-1.5 py-0.5 rounded-full ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : 'bg-red-500 text-white'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Footer Options */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50 space-y-2">
          {/* Accessibility Toggle */}
          <div className="flex items-center justify-between px-2 py-1.5 text-xs text-slate-600 font-medium">
            <div className="flex items-center gap-2">
              <Accessibility className="w-4 h-4 text-slate-400" />
              <span>Accessibility</span>
            </div>
            <button
              type="button"
              role="switch"
              id="accessibility-sidebar-toggle"
              aria-checked={simpleView}
              onClick={toggleSimpleView}
              className={`w-9 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors duration-200 ${
                simpleView ? 'bg-[#8B1E2F]' : 'bg-slate-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                  simpleView ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Privacy Note */}
          <div className="flex items-start gap-2 p-2 rounded-md bg-white border border-slate-200/60 text-[0.7rem] text-slate-500">
            <Lock className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
            <div className="leading-tight">
              <span className="font-semibold text-slate-700 block">Privacy: Synthetic Data Only</span>
              <span className="text-slate-400">This is a simulated prototype.</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

