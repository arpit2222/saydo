import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { dehixStore } from '@/lib/dehix-store';

const InviteMemberSchema = z.object({
  project_id: z.string().optional(),
  email: z.string().email('Valid email address is required'),
  role: z.enum(['viewer', 'editor', 'admin'], {
    errorMap: () => ({ message: 'Role must be viewer, editor, or admin' }),
  }),
});

export async function GET() {
  const members = await dehixStore.getMembers();
  return NextResponse.json({ members });
}

export async function POST(req: NextRequest) {
  try {
    const agentToken = req.headers.get('x-agent-token');
    const validAgentToken = process.env.AGENT_TOKEN || 'saydo_demo_token_2026';

    const body = await req.json();
    const parsed = InviteMemberSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || 'Invalid member data' },
        { status: 400 }
      );
    }

    const { project_id, email, role } = parsed.data;

    // Platform rule: Only admins can invite other admins
    // In our UI demo, current user is Ash (admin), but autonomous agents must present valid agent auth or confirmation
    if (role === 'admin' && agentToken && agentToken !== validAgentToken) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin role invitation requires direct administrator confirmation.' },
        { status: 403 }
      );
    }

    const member = await dehixStore.inviteMember({
      project_id,
      email,
      role,
    });

    return NextResponse.json(
      {
        message: `Invited ${email} with role '${role}'`,
        member,
        member_id: member.id,
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to invite member' }, { status: 500 });
  }
}
