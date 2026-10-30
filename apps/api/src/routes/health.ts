import { Router, Request, Response } from 'express';
import { checkModelHealth, NEBIUS_MODELS } from '../lib/nebius.js';

export const healthRouter: Router = Router();

healthRouter.get('/', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'saydo-api',
    time: new Date().toISOString(),
  });
});

healthRouter.get('/models', async (_req: Request, res: Response) => {
  const models = [
    { role: 'fast', name: NEBIUS_MODELS.fast },
    { role: 'agent', name: NEBIUS_MODELS.agent },
    { role: 'reason', name: NEBIUS_MODELS.reason },
  ];

  const results = await Promise.all(
    models.map(async ({ role, name }) => {
      const health = await checkModelHealth(name);
      return {
        role,
        ...health,
      };
    })
  );

  res.json({
    timestamp: new Date().toISOString(),
    results,
  });
});
