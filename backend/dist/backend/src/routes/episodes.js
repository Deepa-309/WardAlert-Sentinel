"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// WardAlert Sentinel - Episodes API Routes
const express_1 = require("express");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// GET /api/episodes - List of alert episodes
router.get('/', async (req, res) => {
    try {
        const episodes = await prisma.alertEpisode.findMany({
            include: {
                patient: true,
                alerts: {
                    orderBy: { timestamp: 'asc' },
                    take: 20
                }
            },
            orderBy: { startTime: 'desc' }
        });
        res.json({ episodes });
    }
    catch (error) {
        console.error('Error fetching episodes:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// GET /api/episodes/primary - The featured grouped episode for dashboard (P021 Low SpO2)
router.get('/featured', async (req, res) => {
    try {
        const episode = await prisma.alertEpisode.findFirst({
            where: { patientId: 'P021', alertType: 'LOW_SPO2' },
            include: {
                patient: true,
                alerts: { orderBy: { timestamp: 'asc' } }
            }
        });
        // Provide canonical timeline points if database alert count varies
        const sampleTimeline = [
            { time: '10:04', value: 91, label: 'SpO2 91%' },
            { time: '10:07', value: 91, label: 'SpO2 91%' },
            { time: '10:10', value: 90, label: 'SpO2 90%' },
            { time: '10:13', value: 91, label: 'SpO2 91%' },
            { time: '10:16', value: 90, label: 'SpO2 90%' },
            { time: '10:19', value: 91, label: 'SpO2 91%' },
            { time: '10:22', value: 91, label: 'SpO2 91%' }
        ];
        res.json({
            episode: episode || {
                id: 'EP-P021-SPO2',
                patientId: 'P021',
                alertType: 'LOW_SPO2',
                alertCount: 7,
                status: 'ACTIVE'
            },
            timeline: sampleTimeline,
            description: 'Instead of 7 separate alerts, they are grouped into one episode.',
            subtext: '7 similar alerts over 18 minutes'
        });
    }
    catch (error) {
        console.error('Error fetching featured episode:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// GET /api/episodes/:id - Episode detail
router.get('/:id', async (req, res) => {
    try {
        const episode = await prisma.alertEpisode.findUnique({
            where: { id: req.params.id },
            include: {
                patient: true,
                alerts: { orderBy: { timestamp: 'asc' } }
            }
        });
        if (!episode) {
            return res.status(404).json({ error: 'Episode not found' });
        }
        res.json({ episode });
    }
    catch (error) {
        console.error('Error fetching episode detail:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
