import { NextRequest, NextResponse } from 'next/server';
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL!);

export async function POST(req: NextRequest) {
  try {
    const { id, duration } = await req.json();
    if (!id || typeof duration !== 'number') {
      return NextResponse.json({ error: 'id and duration required' }, { status: 400 });
    }
    const secs = Math.min(Math.max(Math.round(duration), 0), 3600); // 최대 1시간
    await sql`UPDATE page_views SET duration = ${secs} WHERE id = ${id}`;
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('duration error', e);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
