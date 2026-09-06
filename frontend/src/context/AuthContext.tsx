// WardAlert Sentinel - Auth & Role-Based Access Context
import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole } from '../types';

interface UserProfile {
  name: string;
  role: UserRole;
  title: string;
}

const ROLE_PROFILES: Record<UserRole, UserProfile> = {
  'Charge Nurse': { name: 'Sister Emma Vance', role: 'Charge Nurse', title: 'Ward 4B Charge Nurse' },
  'Nurse': { name: 'Sarah Miller', role: 'Nurse', title: 'Staff Nurse (Bedside)' },
  'Doctor': { name: 'Dr. Michael Chen', role: 'Doctor', title: 'Medical Registrar' },
  'Researcher': { name: 'Dr. David Aris', role: 'Researcher', title: 'Clinical Informatician' },
  'Administrator': { name: 'Alex Rivera', role: 'Administrator', title: 'Health Systems Administrator' }
};

interface AuthContextType {
  role: UserRole;
  user: UserProfile;
  setRole: (role: UserRole) => void;
  hasPermission: (permission: string) => boolean;
  isActionPermitted: (action: string) => boolean;
  isRoutePermitted: (path: string) => boolean;
  getDefaultRouteForRole: (targetRole?: UserRole) => string;
  getAuthHeaders: () => Record<string, string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<UserRole>(() => {
    const saved = localStorage.getItem('wardalert_role');
    return (saved as UserRole) || 'Charge Nurse';
  });

  const setRole = (newRole: UserRole) => {
    const prevRole = role;
    setRoleState(newRole);
    localStorage.setItem('wardalert_role', newRole);

    // Record ROLE_CHANGED in audit log
    const profile = ROLE_PROFILES[newRole] || ROLE_PROFILES['Charge Nurse'];
    fetch('/api/audit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Role': newRole,
        'X-User-Name': profile.name
      },
      body: JSON.stringify({
        action: 'ROLE_CHANGED',
        reason: `Role switched from ${prevRole} to ${newRole} (${profile.name})`,
        details: { previousRole: prevRole, newRole }
      })
    }).catch(err => console.error('Failed to log role switch:', err));
  };

  const user = ROLE_PROFILES[role] || ROLE_PROFILES['Charge Nurse'];

  const hasPermission = (permission: string): boolean => {
    if (role === 'Administrator') return true;
    switch (role) {
      case 'Nurse':
        return ['view_alerts', 'ack_alert', 'snooze_alert', 'view_patients', 'view_episodes', 'review_alert', 'escalate_alert'].includes(permission);
      case 'Doctor':
        return ['view_alerts', 'view_evidence', 'escalate_alert', 'override_alert', 'view_patients', 'view_episodes', 'review_alert'].includes(permission);
      case 'Charge Nurse':
        return ['view_all', 'view_dashboard', 'view_alerts', 'view_evidence', 'view_episodes', 'view_analytics', 'escalate_alert', 'ack_alert', 'manage_ward', 'view_critical'].includes(permission);
      case 'Researcher':
        return ['view_experiments', 'run_experiments', 'view_error_analysis', 'view_analytics', 'view_before_after', 'export_data'].includes(permission);
      default:
        return false;
    }
  };

  const isActionPermitted = (action: string): boolean => {
    const act = action.toUpperCase();
    if (role === 'Administrator') return true;
    if (role === 'Charge Nurse') return true;
    if (role === 'Nurse') {
      // Nurse: Acknowledge, Review, Escalate, Snooze
      return ['ACKNOWLEDGE', 'REVIEW', 'ESCALATE', 'SNOOZE'].includes(act);
    }
    if (role === 'Doctor') {
      // Doctor: Evidence, Escalation, Override, Review, Acknowledge
      return ['VIEW_EVIDENCE', 'ESCALATE', 'OVERRIDE', 'REVIEW', 'ACKNOWLEDGE'].includes(act);
    }
    if (role === 'Researcher') {
      return false; // Researcher evaluates data, does not triage live bedside alarms
    }
    return false;
  };

  const isRoutePermitted = (path: string): boolean => {
    if (path === '/guide' || path === '/consent' || path === '/roles') return true;
    if (role === 'Administrator') {
      return ['/settings', '/audit', '/guide', '/roles'].some(p => path === p || path.startsWith(p));
    }
    if (role === 'Nurse') {
      return ['/alerts', '/patients', '/episodes', '/guide', '/roles'].some(p => path === p || path.startsWith(p));
    }
    if (role === 'Doctor') {
      return ['/alerts', '/patients', '/episodes', '/critical', '/guide', '/roles'].some(p => path === p || path.startsWith(p));
    }
    if (role === 'Researcher') {
      return ['/experiments', '/before-after', '/error-analysis', '/guide', '/roles'].some(p => path === p || path.startsWith(p));
    }
    if (role === 'Charge Nurse') {
      return ['/', '/alerts', '/patients', '/episodes', '/fatigue', '/before-after', '/critical', '/audit', '/edge-cases', '/guide', '/roles'].some(p => path === p || path.startsWith(p));
    }
    return true;
  };

  const getDefaultRouteForRole = (targetRole?: UserRole): string => {
    const r = targetRole || role;
    switch (r) {
      case 'Nurse':
        return '/alerts';
      case 'Doctor':
        return '/alerts';
      case 'Researcher':
        return '/experiments';
      case 'Administrator':
        return '/settings';
      case 'Charge Nurse':
      default:
        return '/';
    }
  };

  const getAuthHeaders = (): Record<string, string> => {
    return {
      'Content-Type': 'application/json',
      'X-User-Role': role,
      'X-User-Name': user.name
    };
  };

  return (
    <AuthContext.Provider
      value={{
        role,
        user,
        setRole,
        hasPermission,
        isActionPermitted,
        isRoutePermitted,
        getDefaultRouteForRole,
        getAuthHeaders
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

