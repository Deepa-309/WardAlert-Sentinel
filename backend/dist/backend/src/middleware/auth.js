"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = requireRole;
exports.roleContext = roleContext;
const ROLE_PERMISSIONS = {
    'Nurse': ['view_alerts', 'acknowledge_alert', 'snooze_alert', 'review_alert', 'view_patients'],
    'Doctor': ['view_alerts', 'view_evidence', 'escalate_alert', 'override_alert', 'review_alert', 'act_alert', 'view_patients'],
    'Charge Nurse': ['view_all', 'view_analytics', 'view_alerts', 'view_evidence', 'view_episodes', 'acknowledge_alert', 'escalate_alert', 'review_alert', 'manage_ward'],
    'Researcher': ['view_experiments', 'run_experiments', 'view_error_analysis', 'view_analytics', 'export_data', 'view_alerts'],
    'Administrator': ['all', 'configure_settings', 'view_audit_logs', 'manage_users', 'view_all', 'run_experiments']
};
function requireRole(allowedRoles) {
    return (req, res, next) => {
        const roleHeader = req.headers['x-user-role'] || 'Charge Nurse';
        const userName = req.headers['x-user-name'] || 'Sister Emma Vance (RN)';
        const role = allowedRoles.includes(roleHeader)
            ? roleHeader
            : roleHeader;
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
function roleContext(req, res, next) {
    req.userRole = (req.headers['x-user-role'] || 'Charge Nurse');
    req.userName = req.headers['x-user-name'] || 'Sister Emma Vance (RN)';
    next();
}
