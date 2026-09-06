"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActiveSettings = getActiveSettings;
// WardAlert Sentinel - Settings & Thresholds API Routes
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const priorityEngine_1 = require("../../../analyser/priorityEngine");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// In-memory active configuration
let activeSettings = {
    thresholds: { ...priorityEngine_1.DEFAULT_THRESHOLDS },
    groupingWindowMinutes: 15,
    microWindowSeconds: 60,
    hysteresisDeadbandPct: 1.5,
    disclaimer: 'Synthetic demonstration thresholds — not clinically validated.'
};
// GET /api/settings - Read current thresholds & config
router.get('/', (req, res) => {
    res.json({
        settings: activeSettings,
        meta: {
            isClinicallyValidated: false,
            disclaimer: 'Synthetic demonstration thresholds — not clinically validated. Intended solely for research and academic evaluation.'
        }
    });
});
// POST /api/settings - Update thresholds (Admin only)
router.post('/', (0, auth_1.requireRole)(['Administrator']), async (req, res) => {
    try {
        const { thresholds, groupingWindowMinutes, microWindowSeconds, hysteresisDeadbandPct } = req.body;
        const user = req.userName || 'Alex Rivera (IT Admin)';
        const role = req.userRole || 'Administrator';
        if (thresholds) {
            activeSettings.thresholds = { ...activeSettings.thresholds, ...thresholds };
        }
        if (groupingWindowMinutes !== undefined) {
            activeSettings.groupingWindowMinutes = Number(groupingWindowMinutes);
        }
        if (microWindowSeconds !== undefined) {
            activeSettings.microWindowSeconds = Number(microWindowSeconds);
        }
        if (hysteresisDeadbandPct !== undefined) {
            activeSettings.hysteresisDeadbandPct = Number(hysteresisDeadbandPct);
        }
        // Record in Audit Log
        await prisma.auditLog.create({
            data: {
                user,
                role,
                action: 'THRESHOLD_CHANGED',
                reason: 'Administrator reconfigured fatigue grouping and threshold boundaries',
                details: JSON.stringify(activeSettings)
            }
        });
        res.json({
            success: true,
            settings: activeSettings,
            message: 'Settings updated and audit trail logged.'
        });
    }
    catch (error) {
        console.error('Error saving settings:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// POST /api/settings/reset - Reset to default
router.post('/reset', (0, auth_1.requireRole)(['Administrator']), async (req, res) => {
    try {
        activeSettings = {
            thresholds: { ...priorityEngine_1.DEFAULT_THRESHOLDS },
            groupingWindowMinutes: 15,
            microWindowSeconds: 60,
            hysteresisDeadbandPct: 1.5,
            disclaimer: 'Synthetic demonstration thresholds — not clinically validated.'
        };
        await prisma.auditLog.create({
            data: {
                user: req.userName || 'Alex Rivera',
                role: req.userRole || 'Administrator',
                action: 'RESET_SETTINGS_DEFAULT',
                reason: 'Reverted all thresholds and windows to default synthetic baseline'
            }
        });
        res.json({ success: true, settings: activeSettings });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to reset' });
    }
});
function getActiveSettings() {
    return activeSettings;
}
exports.default = router;
