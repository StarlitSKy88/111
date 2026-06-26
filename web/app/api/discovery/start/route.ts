import { NextResponse } from 'next/server';
import { startSession } from '@/lib/discovery-engine';

export const runtime = 'nodejs';

export async function POST() {
  const session = await startSession();
  return NextResponse.json({
    session_id: session.id,
    state: session.state,
    next_question: session.next_question,
  });
}
