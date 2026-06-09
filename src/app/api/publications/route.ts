import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/supabase';

const ALLOWED_TABLES = ['news', 'insights', 'papers'] as const;
type Table = (typeof ALLOWED_TABLES)[number];

function isAllowed(t: string): t is Table {
  return ALLOWED_TABLES.includes(t as Table);
}

export async function PATCH(req: NextRequest) {
  const { id, table, published } = await req.json();
  if (!id || !isAllowed(table)) {
    return NextResponse.json({ error: 'id, table 필수' }, { status: 400 });
  }
  await sql.unsafe(
    `UPDATE "${table}" SET published = $1 WHERE id = $2`,
    [published, id]
  );
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const { id, table } = await req.json();
  if (!id || !isAllowed(table)) {
    return NextResponse.json({ error: 'id, table 필수' }, { status: 400 });
  }
  await sql.unsafe(`DELETE FROM "${table}" WHERE id = $1`, [id]);
  return NextResponse.json({ ok: true });
}
