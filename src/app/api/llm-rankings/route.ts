import { NextResponse } from 'next/server';
import sql from '@/lib/supabase';

export const revalidate = 3600;

export async function GET() {
  const rows = await sql`
    SELECT rank, name, lab, elo, fetched_at
    FROM llm_rankings
    ORDER BY rank ASC
    LIMIT 20
  `;

  return NextResponse.json({
    models: rows,
    fetched_at: rows[0]?.fetched_at ?? null,
  });
}
