import { NextRequest, NextResponse } from 'next/server';
import { loadSession } from '@/lib/discovery-engine';

export const runtime = 'nodejs';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await loadSession(params.id);
  if (!session) {
    return NextResponse.json({ error: 'session not found' }, { status: 404 });
  }
  return NextResponse.json(session);
}
