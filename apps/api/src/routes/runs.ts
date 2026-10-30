import { Router, Request, Response } from 'express';
import { getRuns, getRunById, getStats, resetDemoData, getAppByPublicKey, mockDb } from '../lib/supabase.js';
import { logger } from '../lib/logger.js';

export const runsRouter: Router = Router();

// GET /v1/runs - Retrieve recent agent runs
runsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const app = Array.from(mockDb.apps.values())[0];
    const appId = (req.query.app_id as string) || app?.id;
    const runs = await getRuns(appId);
    return res.json({ runs });
  } catch (err: any) {
    logger.error({ err }, 'Failed to fetch runs');
    return res.status(500).json({ error: 'Failed to fetch runs' });
  }
});

// GET /v1/runs/:id - Retrieve specific run with all step timelines
runsRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const runDetails = await getRunById(id);
    if (!runDetails) {
      return res.status(404).json({ error: `Run not found: ${id}` });
    }
    return res.json(runDetails);
  } catch (err: any) {
    logger.error({ err }, 'Failed to fetch run details');
    return res.status(500).json({ error: 'Failed to fetch run details' });
  }
});

// Stats Router
export const statsRouter: Router = Router();

// GET /v1/stats - Live stats from database
statsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const app = Array.from(mockDb.apps.values())[0];
    const appId = (req.query.app_id as string) || app?.id;
    const stats = await getStats(appId);
    return res.json(stats);
  } catch (err: any) {
    logger.error({ err }, 'Failed to fetch stats');
    return res.status(500).json({ error: 'Failed to fetch live stats' });
  }
});

// Demo Router
export const demoRouter: Router = Router();

// POST /v1/demo/reset - Reseed/reset mock runs and probes while preserving skills & policies
demoRouter.post('/reset', async (_req: Request, res: Response) => {
  try {
    const result = await resetDemoData();
    return res.json(result);
  } catch (err: any) {
    logger.error({ err }, 'Failed to reset demo');
    return res.status(500).json({ error: 'Failed to reset demo data' });
  }
});
