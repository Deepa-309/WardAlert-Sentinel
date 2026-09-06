// WardAlert Sentinel - Patients API Routes
import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// GET /api/patients - List of 28 ward patients with baseline vitals
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const patients = await prisma.patient.findMany({
      include: {
        alerts: {
          where: { clinicianResponse: { not: 'DISMISSED' } },
          orderBy: { timestamp: 'desc' },
          take: 3
        },
        observations: {
          orderBy: { timestamp: 'desc' },
          take: 1
        }
      },
      orderBy: { bed: 'asc' }
    });

    res.json({ patients, total: patients.length });
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/patients/:id - Patient detail with full observation trend
router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const patient = await prisma.patient.findUnique({
      where: { id: req.params.id },
      include: {
        observations: {
          orderBy: { timestamp: 'desc' },
          take: 20
        },
        alerts: {
          orderBy: { timestamp: 'desc' },
          take: 15
        },
        episodes: {
          orderBy: { startTime: 'desc' }
        }
      }
    });

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    res.json({ patient });
  } catch (error) {
    console.error('Error fetching patient detail:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
