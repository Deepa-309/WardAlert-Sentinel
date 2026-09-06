"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// WardAlert Sentinel - Audit Log API Routes
const express_1 = require("express");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// GET /api/audit - List audit entries with search & filtering
router.get('/', async (req, res) => {
    try {
        const { role, action, search, limit = '100', offset = '0' } = req.query;
        const where = {};
        if (role && role !== 'ALL') {
            where.role = String(role);
        }
        if (action && action !== 'ALL') {
            where.action = { contains: String(action) };
        }
        if (search) {
            const q = String(search);
            where.OR = [
                { user: { contains: q } },
                { reason: { contains: q } },
                { alertId: { contains: q } },
                { action: { contains: q } }
            ];
        }
        const logs = await prisma.auditLog.findMany({
            where,
            orderBy: { timestamp: 'desc' },
            take: Math.min(parseInt(String(limit), 10), 200),
            skip: parseInt(String(offset), 10),
            include: {
                alert: {
                    select: {
                        id: true,
                        patientId: true,
                        alertType: true,
                        severity: true
                    }
                }
            }
        });
        const total = await prisma.auditLog.count({ where });
        res.json({ logs, total });
    }
    catch (error) {
        console.error('Error fetching audit logs:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// POST /api/audit - Create manual audit entry
router.post('/', async (req, res) => {
    try {
        const { action, alertId, reason, details } = req.body;
        const user = req.userName || 'Sister Emma Vance (RN)';
        const role = req.userRole || 'Charge Nurse';
        const log = await prisma.auditLog.create({
            data: {
                user,
                role,
                action,
                alertId: alertId || null,
                reason,
                details: typeof details === 'string' ? details : JSON.stringify(details || {})
            }
        });
        res.json({ success: true, log });
    }
    catch (error) {
        console.error('Error creating audit entry:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
