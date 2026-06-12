import { NextResponse } from 'next/server';

let cache: { data: unknown; at: number } | null = null;
const TTL = 5 * 60 * 1000; // 5분

const NAVER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Referer': 'https://finance.naver.com',
};

function pf(s: string | number) {
  return parseFloat(String(s).replace(/,/g, ''));
}

export async function GET() {
  const now = Date.now();
  if (cache && now - cache.at < TTL) {
    return NextResponse.json(cache.data, { headers: { 'X-Cache': 'HIT' } });
  }

  const [kospiRes, kosdaqRes, usdkrwRes] = await Promise.allSettled([
    fetch('https://m.stock.naver.com/api/index/KOSPI/basic', {
      headers: NAVER_HEADERS, cache: 'no-store',
    }).then(r => r.json()),
    fetch('https://m.stock.naver.com/api/index/KOSDAQ/basic', {
      headers: NAVER_HEADERS, cache: 'no-store',
    }).then(r => r.json()),
    fetch('https://query1.finance.yahoo.com/v8/finance/chart/KRW=X?interval=1d&range=2d', {
      headers: { 'User-Agent': 'Mozilla/5.0' }, cache: 'no-store',
    }).then(r => r.json()),
  ]);

  const makeIndex = (r: PromiseSettledResult<Record<string, string>>) => {
    if (r.status !== 'fulfilled') return null;
    const d = r.value;
    const change = pf(d.compareToPreviousClosePrice ?? '0');
    return {
      price: d.closePrice as string,
      ratio: d.fluctuationsRatio as string,
      isUp: change >= 0,
    };
  };

  const makeKrw = (r: PromiseSettledResult<Record<string, unknown>>) => {
    if (r.status !== 'fulfilled') return null;
    const meta = (r.value as Record<string, Record<string, Record<string, Record<string, unknown>[]>>>)
      ?.chart?.result?.[0]?.meta as Record<string, number> | undefined;
    if (!meta) return null;
    const price = meta.regularMarketPrice ?? 0;
    const prev = meta.chartPreviousClose ?? meta.previousClose ?? price;
    const change = price - prev;
    const pct = prev ? (change / prev) * 100 : 0;
    return {
      price: Math.round(price).toLocaleString('ko-KR'),
      ratio: `${pct >= 0 ? '+' : ''}${pct.toFixed(2)}`,
      isUp: change >= 0,
    };
  };

  const data = {
    kospi:  makeIndex(kospiRes  as PromiseSettledResult<Record<string, string>>),
    kosdaq: makeIndex(kosdaqRes as PromiseSettledResult<Record<string, string>>),
    usdkrw: makeKrw(usdkrwRes  as PromiseSettledResult<Record<string, unknown>>),
  };

  cache = { data, at: now };
  return NextResponse.json(data, { headers: { 'X-Cache': 'MISS' } });
}
