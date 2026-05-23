import { NextResponse } from 'next/server';

let cache: { data: unknown; at: number } | null = null;
const TTL = 5 * 60 * 1000; // 5분

const YAHOO = [
  { key: 'gold',   symbol: 'GC=F',     name: '금',      unit: '$' },
  { key: 'wti',    symbol: 'CL=F',     name: 'WTI',     unit: '$' },
  { key: 'dxy',    symbol: 'DX-Y.NYB', name: 'DXY',     unit: ''  },
  { key: 'vix',    symbol: '%5EVIX',   name: 'VIX',     unit: ''  },
  { key: 'usdkrw', symbol: 'KRW=X',   name: '달러/원',  unit: '₩' },
];

const US10Y = { key: 'us10y', symbol: '%5ETNX', name: '미국10년물', unit: 'suffix%' };

async function fetchYahoo(symbol: string) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=2d`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
    cache: 'no-store',
  });
  if (!res.ok) return null;
  const json = await res.json();
  const meta = json?.chart?.result?.[0]?.meta;
  if (!meta) return null;
  const price = meta.regularMarketPrice ?? 0;
  const prev  = meta.chartPreviousClose ?? meta.previousClose ?? price;
  const change = price - prev;
  const pct    = prev ? (change / prev) * 100 : 0;
  return { price, change, pct, isUp: change >= 0 };
}

async function fetchUs2Y() {
  // FRED (세인트루이스 연방준비은행) 무료 CSV - API키 불필요
  const url = 'https://fred.stlouisfed.org/graph/fredgraph.csv?id=DGS2';
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
    cache: 'no-store',
  });
  if (!res.ok) return null;
  const text = await res.text();
  const rows = text.trim().split('\n').slice(1) // 헤더 제거
    .map(r => r.split(','))
    .filter(r => r[1] && r[1].trim() !== '.');
  if (rows.length < 2) return null;
  const cur  = parseFloat(rows[rows.length - 1][1]);
  const prev = parseFloat(rows[rows.length - 2][1]);
  const change = cur - prev;
  return { price: cur, change, pct: prev ? (change / prev) * 100 : 0, isUp: change >= 0 };
}


function fmt(n: number, decimals = 2) {
  return n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

export async function GET() {
  const now = Date.now();
  if (cache && now - cache.at < TTL) {
    return NextResponse.json(cache.data, { headers: { 'X-Cache': 'HIT' } });
  }

  const [yahooResults, us10yResult, us2y] = await Promise.allSettled([
    Promise.all(YAHOO.map(y => fetchYahoo(y.symbol).then(r => ({ ...y, result: r })))),
    fetchYahoo(US10Y.symbol),
    fetchUs2Y(),
  ]);

  const yahooItems = yahooResults.status === 'fulfilled' ? yahooResults.value : [];
  const us10yData  = us10yResult.status === 'fulfilled' ? us10yResult.value : null;
  const us2yData   = us2y.status === 'fulfilled' ? us2y.value : null;

  const indicators = [
    ...yahooItems.map(y => ({
      key:   y.key,
      name:  y.name,
      value: y.result
        ? y.unit.startsWith('suffix')
          ? `${fmt(y.result.price, 2)}${y.unit.slice(6)}`
          : `${y.unit}${fmt(y.result.price, y.key === 'gold' ? 1 : y.key === 'usdkrw' ? 0 : 2)}`
        : '—',
      pct:   y.result ? `${y.result.pct >= 0 ? '+' : ''}${fmt(y.result.pct)}%` : '',
      isUp:  y.result?.isUp ?? true,
      live:  !!y.result,
    })),
    {
      key:   'us2y',
      name:  '미국2년물',
      value: us2yData ? `${fmt(us2yData.price, 2)}%` : '—',
      pct:   us2yData ? `${us2yData.change >= 0 ? '+' : ''}${fmt(us2yData.change, 2)}%p` : '',
      isUp:  us2yData?.isUp ?? true,
      live:  !!us2yData,
    },
    {
      key:   US10Y.key,
      name:  US10Y.name,
      value: us10yData ? `${fmt(us10yData.price, 2)}%` : '—',
      pct:   us10yData ? `${us10yData.pct >= 0 ? '+' : ''}${fmt(us10yData.pct)}%` : '',
      isUp:  us10yData?.isUp ?? true,
      live:  !!us10yData,
    },
  ];

  cache = { data: indicators, at: now };
  return NextResponse.json(indicators, { headers: { 'X-Cache': 'MISS' } });
}
