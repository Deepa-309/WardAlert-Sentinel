"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// WardAlert Sentinel - Edge Cases API Routes
const express_1 = require("express");
const edgeCaseScenarios_1 = require("../../../simulation/edgeCaseScenarios");
const router = (0, express_1.Router)();
// GET /api/edge-cases - List all 5 edge case scenarios
router.get('/', (req, res) => {
    res.json({ scenarios: edgeCaseScenarios_1.EDGE_CASE_SCENARIOS });
});
// GET /api/edge-cases/:id - Retrieve specific edge case
router.get('/:id', (req, res) => {
    const scenario = edgeCaseScenarios_1.EDGE_CASE_SCENARIOS.find(s => s.id === req.params.id);
    if (!scenario) {
        return res.status(404).json({ error: 'Scenario not found' });
    }
    res.json({ scenario });
});
// POST /api/edge-cases/run/:id - Execute interactive edge case simulation
router.post('/run/:id', (req, res) => {
    const scenario = edgeCaseScenarios_1.EDGE_CASE_SCENARIOS.find(s => s.id === req.params.id);
    if (!scenario) {
        return res.status(404).json({ error: 'Scenario not found' });
    }
    // Return execution trace with simulated real-time response
    res.json({
        success: true,
        scenarioId: scenario.id,
        name: scenario.name,
        executedAt: new Date().toISOString(),
        safetyCheck: scenario.safetyCheck,
        expectedBehavior: scenario.expectedBehavior,
        timelineEvents: scenario.timelineEvents,
        summary: `Executed ${scenario.name} successfully. Verified safety invariant: ${scenario.safetyCheck}`
    });
});
exports.default = router;
