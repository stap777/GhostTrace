import { Router, Request, Response } from 'express';
import type { HealthResponse } from '@ghost-trace/shared';

export const healthRouter = Router();

healthRouter.get('/', (_req: Request, res: Response) => {
  const health: HealthResponse = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'OPERATION_GHOST_TRACE_API',
    version: '0.1.0'
  };

  res.status(200).json(health);
});
