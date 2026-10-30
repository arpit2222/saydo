import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { dehixStore } from '@/lib/dehix-store';

const CreateProjectSchema = z.object({
  name: z.string().min(3, 'Project name must be at least 3 characters'),
  budget: z.number().min(10000, 'Minimum budget is ₹10,000 INR').max(1000000, 'Maximum budget is ₹10,00,000 INR'),
  description: z.string().optional(),
});

export async function GET() {
  const projects = await dehixStore.getProjects();
  return NextResponse.json({
    projects,
    count: projects.length,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = CreateProjectSchema.safeParse({
      ...body,
      budget: Number(body.budget),
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || 'Invalid project data' },
        { status: 400 }
      );
    }

    const project = await dehixStore.createProject(parsed.data);

    return NextResponse.json(
      {
        message: 'Project created successfully',
        project,
        project_id: project.id,
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create project' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'id required' }, { status: 400 });
    }
    await dehixStore.deleteProject(id);
    return NextResponse.json({ ok: true, deleted_id: id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete project' }, { status: 500 });
  }
}
