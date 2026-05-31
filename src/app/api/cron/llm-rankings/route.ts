import { NextResponse } from 'next/server';
import sql from '@/lib/supabase';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

async function scrape(): Promise<{ rank: number; name: string; lab: string; elo: number }[]> {
  const res = await fetch('https://lmarena.ai/leaderboard/text', {
    headers: { 'User-Agent': UA },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`lmarena HTTP ${res.status}`);

  const html = await res.text();
  const tableStart = html.indexOf('<table');
  if (tableStart === -1) throw new Error('table element not found');

  const rows = html.slice(tableStart).split('<tr class="');
  const results: { rank: number; name: string; lab: string; elo: number }[] = [];
  const seen = new Set<number>();

  for (const row of rows.slice(1)) {
    const rank = row.match(/text-sm font-medium[^>]*>(\d+)</)?.[1];
    const name = row.match(/max-w-full truncate[^>]*>([^<]+)</)?.[1];
    const lab  = row.match(/text-text-secondary truncate text-xs[^>]*>([^<]+)</)?.[1];
    const elo  = row.match(/>(\d{3,4})<\/span><span[^>]*>±/)?.[1];
    if (!rank || !name || !lab || !elo) continue;

    const r = parseInt(rank);
    if (seen.has(r)) continue;
    seen.add(r);
    results.push({ rank: r, name: name.trim(), lab: lab.split('·')[0].trim(), elo: parseInt(elo) });
  }

  return results.sort((a, b) => a.rank - b.rank).slice(0, 20);
}

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = new URL(req.url).searchParams.get('secret');
    if (auth !== secret) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const rows = await scrape();
  if (!rows.length) return NextResponse.json({ error: 'no data scraped' }, { status: 500 });

  const now = new Date().toISOString();
  await sql`
    INSERT INTO llm_rankings ${sql(rows.map(r => ({ ...r, fetched_at: now })))}
    ON CONFLICT (rank) DO UPDATE SET
      name       = EXCLUDED.name,
      lab        = EXCLUDED.lab,
      elo        = EXCLUDED.elo,
      fetched_at = EXCLUDED.fetched_at
  `;

  return NextResponse.json({ ok: true, count: rows.length, at: now, top3: rows.slice(0, 3) });
}
