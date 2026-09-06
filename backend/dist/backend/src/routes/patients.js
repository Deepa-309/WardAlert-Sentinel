"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// WardAlert Sentinel - Patients API Routes
const express_1 = require("express");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// GET /api/patients - List of 28 ward patients with baseline vitals
router.get('/', async (req, res) => {
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
    }
    catch (error) {
        console.error('Error fetching patients:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// GET /api/patients/:id - Patient detail with full observation trend
router.get('/:id', async (req, res) => {
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
    }
    catch (error) {
        console.error('Error fetching patient detail:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
