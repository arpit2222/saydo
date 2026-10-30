import { NextRequest, NextResponse } from 'next/server';
import { dehixStore } from '@/lib/dehix-store';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Project ID query parameter (?id=) is required' }, { status: 400 });
  }

  const project = await dehixStore.getProjectById(id);

  if (!project) {
    return NextResponse.json({ error: `Project not found with id: ${id}` }, { status: 404 });
  }

  return NextResponse.json({
    project,
  });
}
