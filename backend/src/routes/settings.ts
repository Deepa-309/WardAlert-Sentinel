// WardAlert Sentinel - Settings & Thresholds API Routes
import { Router, Response } from 'express';
import { AuthenticatedRequest, requireRole } from '../middleware/auth';
import { DEFAULT_THRESHOLDS, ThresholdConfig } from '../../../analyser/priorityEngine';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// In-memory active configuration
let activeSettings = {
  thresholds: { ...DEFAULT_THRESHOLDS },
  groupingWindowMinutes: 10,
  microWindowSeconds: 60,
  hysteresisDeadbandPct: 1.5,
  disclaimer: 'Synthetic demonstration thresholds — not clinically validated.'
};

// GET /api/settings - Read current thresholds & config
router.get('/', (req: AuthenticatedRequest, res: Response) => {
  res.json({
    settings: activeSettings,
    meta: {
      isClinicallyValidated: false,
      disclaimer: 'Synthetic demonstration thresholds — not clinically validated. Intended solely for research and academic evaluation.'
    }
  });
});

// POST /api/settings - Update thresholds (Admin only)
router.post('/', requireRole(['Administrator']), async (req: AuthenticatedRequest, res: Response) => {
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
  } catch (error) {
    console.error('Error saving settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/settings/reset - Reset to default
router.post('/reset', requireRole(['Administrator']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    activeSettings = {
      thresholds: { ...DEFAULT_THRESHOLDS },
      groupingWindowMinutes: 10,
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
  } catch (error) {
    res.status(500).json({ error: 'Failed to reset' });
  }
});

export function getActiveSettings() {
  return activeSettings;
}

export default router;
