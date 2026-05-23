import { NextResponse } from 'next/server';
import sql from '@/lib/supabase';

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Referer': 'https://finance.naver.com',
};

const WORLD_INDEX_CODES = ['.IXIC', '.DJI', '.INX', '.N225', '.HSI', '.SSEC', '.CSI300', '.FTSE', '.GDAXI', '.FCHI'];

const chartCache = new Map<string, { data: unknown; at: number }>();
const CACHE_TTL_MAP: Record<string, number> = {
  minute: 60 * 1000,       // 1분
  day:    5 * 60 * 1000,   // 5분
  week:   30 * 60 * 1000,  // 30분
  month:  60 * 60 * 1000,  // 1시간
};

function fmt(d: Date) { return d.toISOString().slice(0, 10).replace(/-/g, ''); }

function getDateRange(tf: string) {
  const end = new Date();
  const start = new Date();
  if (tf === 'minute') start.setDate(start.getDate() - 5);
  else if (tf === 'day') start.setMonth(start.getMonth() - 3);
  else if (tf === 'week') start.setFullYear(start.getFullYear() - 2);
  else start.setFullYear(start.getFullYear() - 5);
  return { start: fmt(start), end: fmt(end) };
}

// 네이버 fchart API (한국 종목 일/주/월/분봉)
async function fetchFChart(symbol: string, tf: string) {
  const { start, end } = getDateRange(tf);
  const url = `https://fchart.stock.naver.com/siseJson.nhn?symbol=${symbol}&requestType=1&startTime=${start}&endTime=${end}&timeframe=${tf}`;
  const res = await fetch(url, { headers: HEADERS, cache: 'no-store' });
  const text = await res.text();

  // 형식: [['날짜','시가','고가','저가','종가','거래량',...], [날짜, o, h, l, c, ...], ...]
  const rows: (string | number)[][] = eval(text);
  const parsed = rows.slice(1) // 헤더 제거
    .filter(r => r[0] && r[4] != null)
    .map(r => {
      const dateStr = String(r[0]);
      const date = tf === 'minute'
        ? `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)} ${dateStr.slice(8, 10)}:${dateStr.slice(10, 12)}`
        : `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;
      const close = Number(r[4]);
      return {
        date,
        open:  r[1] != null ? Number(r[1]) : close,
        high:  r[2] != null ? Number(r[2]) : close,
        low:   r[3] != null ? Number(r[3]) : close,
        close,
      };
    });

  // 분봉은 fchart가 최신순으로 반환 → 오래된 순으로 뒤집기
  return tf === 'minute' ? parsed.reverse() : parsed;
}

interface OHLCBar { date: string; open: number; high: number; low: number; close: number; }

// DB에서 해외 지수 일봉 조회
async function fetchWorldIndexFromDB(symbol: string, tf: string): Promise<OHLCBar[] | null> {
  try {
    const { start } = getDateRange(tf);
    const startDate = `${start.slice(0,4)}-${start.slice(4,6)}-${start.slice(6,8)}`;
    const rows = await sql<OHLCBar[]>`
      SELECT date::text, open::float8 AS open, high::float8 AS high,
             low::float8 AS low, close::float8 AS close
      FROM world_index_prices
      WHERE symbol = ${symbol} AND date >= ${startDate}::date
      ORDER BY date ASC
    `;
    if (!rows.length) return null;
    return rows.map(r => ({ ...r, date: String(r.date).slice(0, 10) }));
  } catch {
    return null; // 테이블 없거나 오류 시 API fallback
  }
}

// 새로 받은 일봉을 DB에 비동기 upsert (차트 응답은 기다리지 않음)
function upsertWorldIndexToDB(symbol: string, bars: OHLCBar[]) {
  if (!bars.length) return;
  const rows = bars.map(b => ({ symbol, date: b.date, open: b.open, high: b.high, low: b.low, close: b.close }));
  sql`
    INSERT INTO world_index_prices ${sql(rows)}
    ON CONFLICT (symbol, date) DO UPDATE SET
      open  = EXCLUDED.open, high  = EXCLUDED.high,
      low   = EXCLUDED.low,  close = EXCLUDED.close
  `.catch(() => {}); // 테이블 없으면 무시 (배치 실행 전엔 테이블이 없을 수 있음)
}

// 일봉 배열을 주/월 단위로 집계
function aggregateBars(bars: OHLCBar[], tf: 'week' | 'month'): OHLCBar[] {
  const groups = new Map<string, OHLCBar>();
  for (const b of bars) {
    const d = new Date(b.date);
    let key: string;
    if (tf === 'week') {
      // ISO 주 시작일(월요일) 기준 키
      const day = d.getDay(); // 0=Sun
      const diff = day === 0 ? -6 : 1 - day;
      const mon = new Date(d); mon.setDate(d.getDate() + diff);
      key = mon.toISOString().slice(0, 10);
    } else {
      key = b.date.slice(0, 7); // "YYYY-MM"
    }
    if (!groups.has(key)) {
      groups.set(key, { date: key, open: b.open, high: b.high, low: b.low, close: b.close });
    } else {
      const g = groups.get(key)!;
      g.high  = Math.max(g.high, b.high);
      g.low   = Math.min(g.low,  b.low);
      g.close = b.close; // 마지막 봉이 종가
    }
  }
  return Array.from(groups.values());
}

// 네이버 m.stock API (국내 지수 / 해외 지수)
async function fetchNaverIndex(symbol: string, tf: string) {
  const isWorld = WORLD_INDEX_CODES.includes(symbol);

  // 해외 지수: Naver API가 timeframe 무시하고 최근 20개만 반환 → 일봉 대량으로 가져와 집계
  const fetchTf = isWorld ? 'day' : (tf === 'minute' ? 'day' : tf);
  const { start, end } = getDateRange(isWorld ? 'month' : tf); // 해외지수는 넉넉히 5년치 요청
  const url = isWorld
    ? `https://api.stock.naver.com/index/${symbol}/price?startDate=${start}&endDate=${end}&timeframe=${fetchTf}&count=500`
    : `https://m.stock.naver.com/api/index/${symbol}/price?startDate=${start}&endDate=${end}&timeframe=${fetchTf}`;

  const res = await fetch(url, { headers: HEADERS, cache: 'no-store' });
  const data: Record<string, string>[] = await res.json();

  const bars = data.reverse().map(d => ({
    date:  (d.localTradedAt ?? '').slice(0, 10), // ISO datetime → 날짜만 추출
    open:  parseFloat(String(d.openPrice  ?? d.closePrice).replace(/,/g, '')),
    high:  parseFloat(String(d.highPrice  ?? d.closePrice).replace(/,/g, '')),
    low:   parseFloat(String(d.lowPrice   ?? d.closePrice).replace(/,/g, '')),
    close: parseFloat(String(d.closePrice).replace(/,/g, '')),
  }));

  // 해외 지수 주봉/월봉 집계는 GET 핸들러에서 처리 (DB fallback 고려)
  if (isWorld && (tf === 'week' || tf === 'month')) return aggregateBars(bars, tf);
  return bars;
}

const INDEX_SYMBOLS = new Set(['KOSPI', 'KOSDAQ']);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get('symbol') ?? 'KOSPI';
  // 지수(KOSPI/KOSDAQ/해외)는 분봉 미지원 → 일봉으로 폴백
  const isIndex = INDEX_SYMBOLS.has(symbol) || WORLD_INDEX_CODES.includes(symbol);
  const rawTf = searchParams.get('tf') ?? 'day';
  const tf = isIndex && rawTf === 'minute' ? 'day' : rawTf;
  const cacheKey = `${symbol}-${tf}`;
  const now = Date.now();

  const cached = chartCache.get(cacheKey);
  const ttl = CACHE_TTL_MAP[tf] ?? 5 * 60 * 1000;
  if (cached && now - cached.at < ttl) {
    return NextResponse.json(cached.data, { headers: { 'X-Cache': 'HIT' } });
  }

  try {
    const isWorldIndex = WORLD_INDEX_CODES.includes(symbol);

    let chart;
    if (isWorldIndex) {
      // 해외 지수: DB 우선 조회 → 없으면 Naver API fallback 후 DB 저장
      const dbBars = await fetchWorldIndexFromDB(symbol, tf);
      if (dbBars && dbBars.length >= 5) {
        chart = (tf === 'week' || tf === 'month') ? aggregateBars(dbBars, tf) : dbBars;
      } else {
        const apiBars = await fetchNaverIndex(symbol, tf);
        // 일봉 원본을 DB에 저장 (집계 전)
        const rawBars = (tf === 'week' || tf === 'month')
          ? await fetchNaverIndex(symbol, 'day')
          : apiBars;
        upsertWorldIndexToDB(symbol, rawBars);
        chart = apiBars;
      }
    } else {
      // 국내 지수(KOSPI, KOSDAQ) + 개별 종목 — fchart (일/주/월/분봉 모두 지원)
      chart = await fetchFChart(symbol, tf);
    }

    chartCache.set(cacheKey, { data: chart, at: now });
    return NextResponse.json(chart, { headers: { 'X-Cache': 'MISS' } });
  } catch (e) {
    if (cached) return NextResponse.json(cached.data);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
