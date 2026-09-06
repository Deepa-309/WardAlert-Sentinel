// WardAlert Sentinel - Express API Server Entry Point
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import alertsRouter from './routes/alerts';
import episodesRouter from './routes/episodes';
import patientsRouter from './routes/patients';
import experimentsRouter from './routes/experiments';
import errorAnalysisRouter from './routes/errorAnalysis';
import edgeCasesRouter from './routes/edgeCases';
import auditRouter from './routes/audit';
import settingsRouter from './routes/settings';
import demoRouter from './routes/demo';
import validationRouter from './routes/validation';
import { roleContext } from './middleware/auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-User-Role', 'X-User-Name']
}));
app.use(express.json());
app.use(roleContext);

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
app.use('/api/alerts', alertsRouter);
app.use('/api/episodes', episodesRouter);
app.use('/api/patients', patientsRouter);
app.use('/api/experiments', experimentsRouter);
app.use('/api/error-analysis', errorAnalysisRouter);
app.use('/api/edge-cases', edgeCasesRouter);
app.use('/api/audit', auditRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/demo', demoRouter);
app.use('/api/validation', validationRouter);

// Error Handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
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
