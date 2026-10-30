import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { healthRouter } from './routes/health.js';
import { authRouter } from './routes/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure root .env is loaded regardless of current working directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

export function createApp(): express.Express {
  const app = express();
  const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

  app.use(cors({
    origin: CLIENT_ORIGIN,
    credentials: true
  }));

  app.use(express.json());

  // API Routes
  app.use('/api/health', healthRouter);
  app.use('/api/auth', authRouter);

  return app;
}
