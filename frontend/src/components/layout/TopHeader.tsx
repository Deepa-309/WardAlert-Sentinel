// WardAlert Sentinel - Top Header Bar (72px)
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Bell, ShieldCheck, ChevronDown, Check, Siren, AlertTriangle, Layers, ExternalLink, CheckCheck } from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';
import { useAuth } from '../../context/AuthContext';
import { useAlerts } from '../../context/AlertContext';
import { UserRole } from '../../types';

export const TopHeader: React.FC<{ onToggleSidebar: () => void }> = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const { role, setRole, getDefaultRouteForRole, isRoutePermitted } = useAuth();
  const {
    notifications,
    unreadCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    openEvidenceModal
  } = useAlerts();

  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  const roleRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const availableRoles: UserRole[] = [
    'Charge Nurse',
    'Nurse',
    'Doctor',
    'Researcher',
    'Administrator'
  ];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (roleRef.current && !roleRef.current.contains(event.target as Node)) {
        setRoleDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRoleSelect = (newRole: UserRole) => {
    setRole(newRole);
    setRoleDropdownOpen(false);

    // If current route is not permitted for the new role, smoothly navigate to their default landing route
    const currentPath = window.location.pathname;
    // We check against the target role
    const defaultRoute = getDefaultRouteForRole(newRole);
    if (newRole === 'Nurse' || newRole === 'Doctor') {
      if (currentPath === '/' || currentPath.startsWith('/fatigue') || currentPath.startsWith('/settings') || currentPath.startsWith('/experiments')) {
        navigate(defaultRoute);
      }
    } else if (newRole === 'Researcher') {
      if (currentPath === '/' || currentPath.startsWith('/alerts') || currentPath.startsWith('/patients') || currentPath.startsWith('/settings')) {
        navigate(defaultRoute);
      }
    } else if (newRole === 'Administrator') {
      if (currentPath === '/' || currentPath.startsWith('/alerts') || currentPath.startsWith('/experiments')) {
        navigate(defaultRoute);
      }
    }
  };

  return (
    <header className="sticky top-0 z-30 h-[72px] bg-white border-b border-slate-200/80 px-4 md:px-8 flex items-center justify-between shadow-sm">
      {/* Left: Hamburger menu toggle for mobile/desktop */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
          id="hamburger-menu-btn"
          className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-[#8B1E2F]"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Right Elements */}
      <div className="flex items-center gap-3 sm:gap-4 md:gap-6">
        {/* Synthetic Data Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs font-semibold tracking-tight">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Synthetic Data Only</span>
        </div>

        {/* Role Selector Dropdown */}
        <div className="relative" ref={roleRef}>
          <button
            type="button"
            onClick={() => {
              setRoleDropdownOpen(!roleDropdownOpen);
              setNotifDropdownOpen(false);
            }}
            id="role-dropdown-btn"
            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 rounded-lg text-xs font-semibold text-slate-700 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#8B1E2F]"
          >
            <span>{role}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {roleDropdownOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-1.5 text-[0.68rem] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 flex items-center justify-between">
                <span>Switch Active Role</span>
                <span className="text-[0.65rem] text-[#8B1E2F] font-bold">RBAC</span>
              </div>
              {availableRoles.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleRoleSelect(r)}
                  className={`w-full text-left px-3 py-2 text-xs font-medium flex items-center justify-between hover:bg-slate-50 transition-colors ${
                    role === r ? 'text-[#8B1E2F] font-bold bg-rose-50/50' : 'text-slate-700'
                  }`}
                >
                  <span>{r}</span>
                  {role === r && <Check className="w-3.5 h-3.5 text-[#8B1E2F]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notification Bell with Dynamic Badge & Interactive Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => {
              setNotifDropdownOpen(!notifDropdownOpen);
              setRoleDropdownOpen(false);
            }}
            id="notification-bell-btn"
            aria-label={`Alert notifications (${unreadCount} unread)`}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#8B1E2F] relative"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-4 h-4 px-1 bg-red-600 text-white text-[0.65rem] font-black rounded-full flex items-center justify-center ring-2 ring-white animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown Panel */}
          {notifDropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
              {/* Header */}
              <div className="p-3 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#8B1E2F]" />
                  <span className="text-xs font-bold text-slate-900">Ward Notifications</span>
                  {unreadCount > 0 && (
                    <span className="text-[0.68rem] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-700">
                      {unreadCount} unread
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllNotificationsAsRead}
                    className="text-[0.68rem] font-semibold text-[#8B1E2F] hover:text-[#70121F] flex items-center gap-1 transition-colors"
                  >
                    <CheckCheck className="w-3 h-3" />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              {/* Notification List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 font-medium">
                    No active telemetry notifications.
                  </div>
                ) : (
                  notifications.map((notif) => {
                    const isP0 = notif.severity === 'P0';
                    const isP1 = notif.severity === 'P1';

                    return (
                      <div
                        key={notif.id}
                        onClick={() => {
                          markNotificationAsRead(notif.id);
                          if (notif.alert) {
                            openEvidenceModal(notif.alert);
                          } else {
                            navigate('/episodes');
                          }
                          setNotifDropdownOpen(false);
                        }}
                        className={`p-3 text-left hover:bg-slate-50 transition-colors cursor-pointer flex items-start gap-2.5 ${
                          !notif.read ? (isP0 ? 'bg-rose-50/40' : 'bg-slate-50/70 font-semibold') : 'opacity-80'
                        }`}
                      >
                        <div className="mt-0.5 flex-shrink-0">
                          {isP0 ? (
                            <div className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center text-red-600">
                              <Siren className="w-4 h-4" />
                            </div>
                          ) : isP1 ? (
                            <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
                              <AlertTriangle className="w-4 h-4" />
                            </div>
                          ) : (
                            <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700">
                              <Layers className="w-4 h-4" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <span className={`text-xs font-bold truncate ${isP0 ? 'text-red-700' : 'text-slate-800'}`}>
                              {notif.title}
                            </span>
                            {!notif.read && (
                              <span className="w-2 h-2 rounded-full bg-red-600 flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-[0.72rem] text-slate-600 line-clamp-2 leading-relaxed mb-1">
                            {notif.message}
                          </p>
                          <div className="flex items-center justify-between text-[0.65rem] text-slate-400">
                            <span>Patient {notif.patientId} • {notif.bed}</span>
                            <span className="font-semibold text-[#8B1E2F] flex items-center gap-0.5">
                              View Evidence <ExternalLink className="w-2.5 h-2.5" />
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* WardAlert Sentinel Logo on the RIGHT SIDE */}
        <div className="pl-2 border-l border-slate-200/80">
          <BrandLogo size="md" showSubtitle={true} align="right" />
        </div>
      </div>
    </header>
  );
};

