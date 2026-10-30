import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { dehixStore } from '@/lib/dehix-store';

const DecisionSchema = z.object({
  application_id: z.string().min(1, 'application_id is required'),
  decision: z.enum(['accepted', 'approved', 'rejected'], {
    errorMap: () => ({ message: 'Decision must be accepted, approved, or rejected' }),
  }),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = DecisionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || 'Invalid decision payload' },
        { status: 400 }
      );
    }

    const { application_id, decision } = parsed.data;
    const normalizedDecision = decision === 'approved' ? 'accepted' : decision;

    const result = await dehixStore.updateApplicationDecision(application_id, normalizedDecision);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      message: `Application ${application_id} marked as ${decision}`,
      application: result.application,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update application' }, { status: 500 });
  }
}
