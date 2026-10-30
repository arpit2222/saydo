import { NextRequest, NextResponse } from 'next/server';
import { dehixStore } from '@/lib/dehix-store';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const status = searchParams.get('status') || undefined;
  const projectId = searchParams.get('project_id') || undefined;

  const applications = await dehixStore.getApplications(status, projectId);

  return NextResponse.json({
    applications,
    count: applications.length,
  });
}
