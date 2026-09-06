"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// WardAlert Sentinel - Express API Server Entry Point
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const alerts_1 = __importDefault(require("./routes/alerts"));
const episodes_1 = __importDefault(require("./routes/episodes"));
const patients_1 = __importDefault(require("./routes/patients"));
const experiments_1 = __importDefault(require("./routes/experiments"));
const errorAnalysis_1 = __importDefault(require("./routes/errorAnalysis"));
const edgeCases_1 = __importDefault(require("./routes/edgeCases"));
const audit_1 = __importDefault(require("./routes/audit"));
const settings_1 = __importDefault(require("./routes/settings"));
const demo_1 = __importDefault(require("./routes/demo"));
const validation_1 = __importDefault(require("./routes/validation"));
const auth_1 = require("./middleware/auth");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Middleware
app.use((0, cors_1.default)({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-User-Role', 'X-User-Name']
}));
app.use(express_1.default.json());
app.use(auth_1.roleContext);
// System Health Check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        system: 'WardAlert Sentinel API',
        version: '1.0.0-mvp',
        mode: 'SYNTHETIC_DATA_ONLY',
        timestamp: new Date().toISOString()
    });
});
// Consent verification
app.post('/api/consent', (req, res) => {
    const { accepted, userId } = req.body;
    res.json({
        success: true,
        acceptedAt: new Date().toISOString(),
        notice: 'Consent acknowledged for research demonstration prototype.'
    });
});
// Mount Routes
app.use('/api/alerts', alerts_1.default);
app.use('/api/episodes', episodes_1.default);
app.use('/api/patients', patients_1.default);
app.use('/api/experiments', experiments_1.default);
app.use('/api/error-analysis', errorAnalysis_1.default);
app.use('/api/edge-cases', edgeCases_1.default);
app.use('/api/audit', audit_1.default);
app.use('/api/settings', settings_1.default);
app.use('/api/demo', demo_1.default);
app.use('/api/validation', validation_1.default);
// Error Handling
app.use((err, req, res, next) => {
    console.error('Unhandled API Error:', err);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
});
// Start Server
app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🛡️  WardAlert Sentinel Backend API Server Running`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`🔒 Mode: Synthetic Data Only (Research Prototype)`);
    console.log(`====================================================`);
});
