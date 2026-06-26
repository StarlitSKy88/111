import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json({
    states: ['opening', 'capability', 'need', 'direction', 'summary'],
    max_turns: 8,
    transitions: {
      opening: 'capability',
      capability: 'need',
      need: 'direction',
      direction: 'summary',
      summary: 'complete',
    },
    sufficiency_threshold: 0.95,
  });
}
