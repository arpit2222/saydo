import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { PolicyRuleSchema } from '@saydo/shared';
import { parseSpokenPolicyWithNemotron } from '../lib/policyParser.js';
import { getAppByPublicKey, getSkills, savePolicies, getPolicies, deletePolicy } from '../lib/supabase.js';
import { logger } from '../lib/logger.js';

export const policiesRouter = Router();

const ParsePolicySchema = z.object({
  app_id: z.string().optional(),
  publicKey: z.string().optional(),
  spoken: z.string().min(3, 'Spoken rule must be at least 3 characters'),
  source: z.enum(['voice', 'docs', 'compile']).default('voice'),
});

// POST /v1/policies/parse - Convert natural language spoken rule to structured policies
policiesRouter.post('/parse', async (req: Request, res: Response) => {
  try {
    const parsed = ParsePolicySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors[0]?.message || 'Invalid parse request' });
    }

    const { app_id, publicKey, spoken, source } = parsed.data;

    let resolvedAppId = app_id;
    if (!resolvedAppId && publicKey) {
      const app = await getAppByPublicKey(publicKey);
      if (app) resolvedAppId = app.id;
    }

    if (!resolvedAppId) {
      const defaultApp = await getAppByPublicKey('pk_demo_dehix');
      resolvedAppId = defaultApp?.id || 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22';
    }

    const targetAppId: string = resolvedAppId || 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22';

    // Load active skills for context
    const skills = await getSkills(targetAppId);

    // Call Nemotron Fast policy synthesizer
    const policies = await parseSpokenPolicyWithNemotron({
      spoken,
      appId: targetAppId,
      source,
      skills,
    });

    // Save to DB
    const saved = await savePolicies(policies);

    logger.info({ spoken, policiesGenerated: saved.length }, 'Spoken policy converted and stored');

    return res.status(201).json({
      message: 'Policy parsed and saved successfully',
      policies: saved,
      count: saved.length,
    });
  } catch (err: any) {
    logger.error({ err }, 'Policy parsing failed');
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
});

// GET /v1/policies - List all active policies for an app
policiesRouter.get('/', async (req: Request, res: Response) => {
  try {
    const publicKey = req.query.publicKey as string;
    let appId = req.query.app_id as string | undefined;

    if (publicKey && !appId) {
      const app = await getAppByPublicKey(publicKey);
      if (app) appId = app.id;
    }

    const policies = await getPolicies(appId);
    return res.json({
      policies,
      count: policies.length,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to list policies' });
  }
});

// POST /v1/policies - Manually create or accept a suggested policy
policiesRouter.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = PolicyRuleSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors[0]?.message || 'Invalid policy format' });
    }

    const saved = await savePolicies([parsed.data]);
    return res.status(201).json({
      message: 'Policy rule created successfully',
      policy: saved[0],
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to save policy' });
  }
});

// DELETE /v1/policies/:id - Remove a policy
policiesRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const deleted = await deletePolicy(id);

    if (!deleted) {
      return res.status(404).json({ error: `Policy not found with id: ${id}` });
    }

    return res.json({ message: 'Policy removed successfully', id });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to delete policy' });
  }
});
