import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

export const runtime = 'nodejs';

const schema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
});

const CODES_FILE = join(process.cwd(), 'data/verify-codes.json');

export async function POST(req: NextRequest) {
  try {
    const { email, code } = schema.parse(await req.json());
    const codes = JSON.parse(readFileSync(CODES_FILE, 'utf-8'));
    const record = codes.find(
      (c: any) =>
        c.email === email && c.code === code && !c.used && new Date(c.expires_at) > new Date()
    );
    if (!record) {
      return NextResponse.json({ error: '验证码无效或已过期' }, { status: 401 });
    }
    record.used = true;
    writeFileSync(CODES_FILE, JSON.stringify(codes, null, 2));
    return NextResponse.json({ verified: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
