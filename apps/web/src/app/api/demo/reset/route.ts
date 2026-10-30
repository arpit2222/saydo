import { NextResponse } from 'next/server';
import { dehixStore } from '@/lib/dehix-store';

export async function POST() {
  try {
    // 1. Reseed web mock data
    await dehixStore.reseed();

    // 2. Call api engine demo reset
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    try {
      await fetch(`${apiUrl}/v1/demo/reset`, { method: 'POST' });
    } catch (e) {
      // API engine call best-effort
    }

    return NextResponse.json({
      success: true,
      message: 'Demo state successfully reseeded to initial state. Skills & policies preserved.',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to reset demo data' }, { status: 500 });
  }
}
