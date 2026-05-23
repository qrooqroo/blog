import { NextResponse } from 'next/server';
import sql from '@/lib/supabase';

const SYMBOLS = ['.IXIC','.DJI','.INX','.N225','.HSI','.SSEC','.CSI300','.FTSE','.GDAXI','.FCHI'];
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Referer': 'https://finance.naver.com',
};

function fmt(d: Date) { return d.toISOString().slice(0, 10).replace(/-/g, ''); }

async function fetchAndUpsert(symbol: string): Promise<number> {
  const end   = new Date();
  const start = new Date(); start.setDate(start.getDate() - 60);
  const url = `https://api.stock.naver.com/index/${symbol}/price`
    + `?startDate=${fmt(start)}&endDate=${fmt(end)}&timeframe=day&count=500`;

  const res = await fetch(url, { headers: HEADERS, cache: 'no-store' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const raw: Record<string, string>[] = await res.json();
  if (!Array.isArray(raw) || !raw.length) return 0;

  const rows = raw
    .map(d => ({
      symbol,
      date:  (d.localTradedAt ?? '').slice(0, 10),
      open:  parseFloat(String(d.openPrice  ?? d.closePrice).replace(/,/g, '')),
      high:  parseFloat(String(d.highPrice  ?? d.closePrice).replace(/,/g, '')),
      low:   parseFloat(String(d.lowPrice   ?? d.closePrice).replace(/,/g, '')),
      close: parseFloat(String(d.closePrice).replace(/,/g, '')),
    }))
    .filter(r => r.date.length === 10 && !isNaN(r.close));

  if (!rows.length) return 0;

  await sql`
    INSERT INTO world_index_prices ${sql(rows)}
    ON CONFLICT (symbol, date) DO UPDATE SET
      open  = EXCLUDED.open, high  = EXCLUDED.high,
      low   = EXCLUDED.low,  close = EXCLUDED.close
  `;
  return rows.length;
}

export async function GET(req: Request) {
  // 간단한 보안: CRON_SECRET 환경변수 또는 로컬 요청만 허용
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = new URL(req.url).searchParams.get('secret');
    if (auth !== secret) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const results: Record<string, number | string> = {};
  for (const sym of SYMBOLS) {
    try {
      results[sym] = await fetchAndUpsert(sym);
      await new Promise(r => setTimeout(r, 400));
    } catch (e) {
      results[sym] = `ERROR: ${(e as Error).message}`;
    }
  }

  return NextResponse.json({ ok: true, at: new Date().toISOString(), results });
}
