import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { getSkills, updateSkillStatus, getAppByPublicKey } from '../lib/supabase.js';

export const skillsRouter = Router();

const UpdateStatusSchema = z.object({
  status: z.enum(['active', 'drifted', 'disabled']),
});

skillsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const publicKey = req.query.publicKey as string;
    let appId: string | undefined;

    if (publicKey) {
      const app = await getAppByPublicKey(publicKey);
      if (app) appId = app.id;
    }

    const skills = await getSkills(appId);
    return res.json({
      skills,
      count: skills.length,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to list skills' });
  }
});

skillsRouter.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const parsed = UpdateStatusSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors[0]?.message || 'Invalid status' });
    }

    const updated = await updateSkillStatus(id, parsed.data.status);
    if (!updated) {
      return res.status(404).json({ error: `Skill not found with id: ${id}` });
    }

    return res.json({
      message: `Skill status updated to ${parsed.data.status}`,
      skill: updated,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to update skill status' });
  }
});
