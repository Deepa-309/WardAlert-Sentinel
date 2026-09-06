// WardAlert Sentinel - RBAC Middleware
import { Request, Response, NextFunction } from 'express';

export type UserRole = 'Nurse' | 'Doctor' | 'Charge Nurse' | 'Researcher' | 'Administrator';

export interface AuthenticatedRequest extends Request {
  userRole?: UserRole;
  userName?: string;
}

const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  'Nurse': ['view_alerts', 'acknowledge_alert', 'snooze_alert', 'review_alert', 'view_patients'],
  'Doctor': ['view_alerts', 'view_evidence', 'escalate_alert', 'override_alert', 'review_alert', 'act_alert', 'view_patients'],
  'Charge Nurse': ['view_all', 'view_analytics', 'view_alerts', 'view_evidence', 'view_episodes', 'acknowledge_alert', 'escalate_alert', 'review_alert', 'manage_ward'],
  'Researcher': ['view_experiments', 'run_experiments', 'view_error_analysis', 'view_analytics', 'export_data', 'view_alerts'],
  'Administrator': ['all', 'configure_settings', 'view_audit_logs', 'manage_users', 'view_all', 'run_experiments']
};

export function requireRole(allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const roleHeader = (req.headers['x-user-role'] as string) || 'Charge Nurse';
    const userName = (req.headers['x-user-name'] as string) || 'Sister Emma Vance (RN)';

    const role = allowedRoles.includes(roleHeader as UserRole)
      ? (roleHeader as UserRole)
      : (roleHeader as UserRole);

    req.userRole = role;
    req.userName = userName;

    if (!allowedRoles.includes(role) && role !== 'Administrator') {
      return res.status(403).json({
        error: 'Forbidden: Insufficient role permissions',
        requiredRoles: allowedRoles,
        currentRole: role
      });
    }

    next();
  };
}

export function roleContext(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  req.userRole = ((req.headers['x-user-role'] as string) || 'Charge Nurse') as UserRole;
  req.userName = (req.headers['x-user-name'] as string) || 'Sister Emma Vance (RN)';
  next();
}
