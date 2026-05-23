import { NextResponse } from 'next/server';

const NAVER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Referer': 'https://finance.naver.com',
};

const STOCKS = [
  { code: '005930', name: '삼성전자' },
  { code: '000660', name: 'SK하이닉스' },
  { code: '373220', name: 'LG에너지솔루션' },
  { code: '005380', name: '현대차' },
  { code: '035420', name: 'NAVER' },
  { code: '035720', name: '카카오' },
];

const WORLD_INDICES = [
  { code: '.IXIC',  name: '나스닥',   region: 'US' },
  { code: '.DJI',   name: '다우존스', region: 'US' },
  { code: '.INX',   name: 'S&P 500',  region: 'US' },
  { code: '.N225',  name: '닛케이225', region: 'JP' },
  { code: '.HSI',   name: '항셍',     region: 'HK' },
  { code: '.SSEC',  name: '상해종합', region: 'CN' },
  { code: '.CSI300',name: 'CSI 300',  region: 'CN' },
  { code: '.FTSE',  name: 'FTSE 100', region: 'GB' },
  { code: '.GDAXI', name: 'DAX',      region: 'DE' },
  { code: '.FCHI',  name: 'CAC 40',   region: 'FR' },
];

// 서버 메모리 캐시 — 10만 명이 동시 접속해도 네이버엔 5초에 1번만 요청
let cache: { data: unknown; at: number } | null = null;
const CACHE_TTL = 5000; // 5초

async function fetchNaver(url: string) {
  const res = await fetch(url, { headers: NAVER_HEADERS, cache: 'no-store' });
  return res.json();
}

function parsePrice(p: string | number) {
  return parseFloat(String(p).replace(/,/g, ''));
}

async function fetchAll() {
  const [kospi, kosdaq, ...rest] = await Promise.all([
    // 국내 지수
    fetchNaver('https://m.stock.naver.com/api/index/KOSPI/basic'),
    fetchNaver('https://m.stock.naver.com/api/index/KOSDAQ/basic'),
    // 국내 종목
    ...STOCKS.map(s => fetchNaver(`https://m.stock.naver.com/api/stock/${s.code}/basic`)),
    // 해외 지수 (api.stock.naver.com 엔드포인트)
    ...WORLD_INDICES.map(w => fetchNaver(`https://api.stock.naver.com/index/${w.code}/basic`)),
  ]);

  const stockCount = STOCKS.length;
  const stocks = rest.slice(0, stockCount);
  const worldRaw = rest.slice(stockCount);

  const indices = [kospi, kosdaq].map((d: Record<string, string>) => ({
    name: d.stockName,
    price: d.closePrice,
    change: d.compareToPreviousClosePrice,
    ratio: d.fluctuationsRatio,
    isUp: parsePrice(d.compareToPreviousClosePrice) >= 0,
  }));

  const stockList = stocks.map((d: Record<string, string>, i) => ({
    code: STOCKS[i].code,
    name: d.stockName ?? STOCKS[i].name,
    price: d.closePrice,
    change: d.compareToPreviousClosePrice,
    ratio: d.fluctuationsRatio,
    isUp: parsePrice(d.compareToPreviousClosePrice) >= 0,
  }));

  const worldIndices = worldRaw.map((d: Record<string, string>, i) => ({
    code: WORLD_INDICES[i].code,
    name: WORLD_INDICES[i].name,
    region: WORLD_INDICES[i].region,
    price: d.closePrice ?? '',
    change: d.compareToPreviousClosePrice ?? '',
    ratio: d.fluctuationsRatio ?? '',
    isUp: parsePrice(d.compareToPreviousClosePrice ?? '0') >= 0,
    marketStatus: d.marketStatus ?? '',
  }));

  return { indices, stocks: stockList, worldIndices };
}

export async function GET() {
  try {
    const now = Date.now();

    if (cache && now - cache.at < CACHE_TTL) {
      return NextResponse.json(cache.data, { headers: { 'X-Cache': 'HIT' } });
    }

    const data = await fetchAll();
    cache = { data, at: now };

    return NextResponse.json(data, { headers: { 'X-Cache': 'MISS' } });
  } catch (e) {
    if (cache) return NextResponse.json(cache.data);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
