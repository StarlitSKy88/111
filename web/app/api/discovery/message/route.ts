import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { processMessage } from '@/lib/discovery-engine';

export const runtime = 'nodejs';

const schema = z.object({
  session_id: z.string(),
  message: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const { session_id, message } = schema.parse(await req.json());
    const session = await processMessage(session_id, message);
    if (!session) {
      return NextResponse.json({ error: 'session not found' }, { status: 404 });
    }
    return NextResponse.json({
      session_id: session.id,
      state: session.state,
      turn_count: session.turn_count,
      blueprint_progress: session.blueprint_progress,
      completed: session.completed,
      info_sufficiency: session.info_sufficiency,
      known_unknowns: session.known_unknowns,
      next_question: session.next_question,
      blueprint_sections: session.blueprint_sections,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
