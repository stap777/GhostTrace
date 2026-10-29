import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { healthRouter } from './routes/health.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

app.use(cors({
  origin: CLIENT_ORIGIN,
  credentials: true
}));

app.use(express.json());

// API Routes
app.use('/api/health', healthRouter);

app.listen(PORT, () => {
  console.log(`[GhostTrace Server] Operational on port ${PORT}`);
  console.log(`[GhostTrace Server] Health check available at http://localhost:${PORT}/api/health`);
});
