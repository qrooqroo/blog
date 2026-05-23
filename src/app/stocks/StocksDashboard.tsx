'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

// ── 바이낸스 WebSocket ──────────────────────────────────────────
const COINS = [
  { symbol: 'BTCUSDT',  name: 'Bitcoin',  short: 'BTC' },
  { symbol: 'ETHUSDT',  name: 'Ethereum', short: 'ETH' },
  { symbol: 'SOLUSDT',  name: 'Solana',   short: 'SOL' },
  { symbol: 'BNBUSDT',  name: 'BNB',      short: 'BNB' },
  { symbol: 'XRPUSDT',  name: 'XRP',      short: 'XRP' },
  { symbol: 'DOGEUSDT', name: 'Dogecoin', short: 'DOGE' },
];

interface CoinTicker {
  symbol: string;
  price: string;
  change: string;
  percent: string;
  isUp: boolean;
}

function useBinanceTicker() {
  const [tickers, setTickers] = useState<Record<string, CoinTicker>>({});
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout>>();

  const connect = useCallback(() => {
    const streams = COINS.map(c => `${c.symbol.toLowerCase()}@ticker`).join('/');
    const ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);
    wsRef.current = ws;

    ws.onmessage = (e) => {
      const { data: d } = JSON.parse(e.data);
      const price = parseFloat(d.c);
      const change = parseFloat(d.p);
      setTickers(prev => ({
        ...prev,
        [d.s]: {
          symbol: d.s,
          price: price.toLocaleString('en-US', { maximumFractionDigits: price < 1 ? 6 : 2 }),
          change: (change >= 0 ? '+' : '') + change.toFixed(2),
          percent: (change >= 0 ? '+' : '') + parseFloat(d.P).toFixed(2) + '%',
          isUp: change >= 0,
        },
      }));
    };

    ws.onclose = () => {
      // 3초 후 자동 재연결
      reconnectTimer.current = setTimeout(connect, 3000);
    };

    ws.onerror = () => ws.close();
  }, []);

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [connect]);

  return tickers;
}

function CryptoSection() {
  const tickers = useBinanceTicker();
  const connected = Object.keys(tickers).length > 0;

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-sm font-bold text-slate-700">실시간 암호화폐</h2>
        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${connected ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`} />
          {connected ? 'LIVE' : '연결 중...'}
        </span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {COINS.map(coin => {
          const t = tickers[coin.symbol];
          return (
            <div key={coin.symbol} className="bg-white rounded-xl border border-slate-200 p-3">
              <p className="text-xs text-slate-400 mb-1">{coin.short}</p>
              <p className="text-sm font-bold text-slate-800 truncate">{coin.name}</p>
              <p className="text-base font-black text-slate-900 mt-1.5">
                {t ? `$${t.price}` : <span className="text-slate-300 text-sm">—</span>}
              </p>
              {t && (
                <p className={`text-xs font-semibold mt-0.5 ${t.isUp ? 'text-green-500' : 'text-red-500'}`}>
                  {t.percent}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface IndexData {
  name: string;
  price: string;
  change: string;
  ratio: string;
  isUp: boolean;
  updatedAt: string;
}

interface StockData {
  code: string;
  name: string;
  price: string;
  change: string;
  ratio: string;
  isUp: boolean;
}

interface WorldIndex {
  code: string;
  name: string;
  region: string;
  price: string;
  change: string;
  ratio: string;
  isUp: boolean;
  marketStatus: string;
}

const REGION_FLAG: Record<string, string> = {
  US: '🇺🇸', JP: '🇯🇵', GB: '🇬🇧', DE: '🇩🇪', FR: '🇫🇷',
  HK: '🇭🇰', CN: '🇨🇳',
};

interface ChartPoint {
  date: string;
  close: number;
}

function MiniChart({ data, isUp }: { data: ChartPoint[]; isUp: boolean }) {
  if (!data.length) return <div className="h-12 w-24 bg-slate-100 rounded animate-pulse" />;

  const prices = data.map(d => d.close);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const W = 96, H = 48;

  const points = prices.map((p, i) => {
    const x = (i / (prices.length - 1)) * W;
    const y = H - ((p - min) / range) * (H - 4) - 2;
    return `${x},${y}`;
  }).join(' ');

  const color = isUp ? '#22c55e' : '#ef4444';

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

const AXIS_R = 68;   // 우측 가격 축 너비
const AXIS_B = 28;   // 하단 날짜 축 높이
const PAD   = 12;    // 상하 여백
const H     = 380;   // 캔버스 높이

function fmtPrice(p: number) {
  return p >= 1000
    ? p.toLocaleString('ko-KR', { maximumFractionDigits: 2 })
    : p.toFixed(4);
}

function MainChart({ data }: { data: ChartPoint[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const st = useRef({ offset: 0, scale: 10, dragStart: null as number | null, dragOff: 0, mx: -1, my: -1 });

  const draw = useCallback(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    if (!data.length) {
      const ctx = cv.getContext('2d')!;
      const dpr = window.devicePixelRatio || 1;
      ctx.clearRect(0, 0, cv.width / dpr, cv.height / dpr);
      return;
    }
    const ctx = cv.getContext('2d')!;
    const dpr = window.devicePixelRatio || 1;
    const W = cv.width / dpr;
    const cW = W - AXIS_R;
    const cH = H - AXIS_B;
    const s = st.current;

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, W, H);

    const bw = Math.max(1, s.scale * 0.8);       // 봉 몸체 너비
    const vis = Math.ceil(cW / s.scale) + 2;     // 화면에 들어오는 봉 수
    const endI = data.length - 1 - Math.max(0, s.offset);
    const startI = Math.max(0, endI - vis + 1);
    const candles = data.slice(startI, endI + 1);
    if (!candles.length) return;

    const pMax = Math.max(...candles.map(d => d.high)) * 1.003;
    const pMin = Math.min(...candles.map(d => d.low))  * 0.997;
    const pRange = pMax - pMin || 1;

    const toY = (p: number) => PAD + ((pMax - p) / pRange) * (cH - PAD * 2);
    const toX = (i: number) => cW - (endI - (startI + i)) * s.scale - s.scale / 2;

    // 가로 그리드 + 가격 축
    ctx.font = '10px system-ui';
    const gridN = 6;
    for (let i = 0; i <= gridN; i++) {
      const p = pMin + (pRange * i / gridN);
      const y = toY(p);
      ctx.strokeStyle = '#f1f5f9'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(cW, y); ctx.stroke();
      ctx.fillStyle = '#94a3b8'; ctx.textAlign = 'left';
      ctx.fillText(fmtPrice(p), cW + 4, y + 4);
    }

    // 날짜 축
    const every = Math.max(1, Math.ceil(candles.length / 5));
    ctx.textAlign = 'center'; ctx.fillStyle = '#94a3b8';
    candles.forEach((d, i) => {
      if (i % every !== 0) return;
      ctx.fillText(d.date.slice(5), toX(i), H - 8);
    });

    // 캔들 그리기
    candles.forEach((d, i) => {
      const x = toX(i);
      const up = d.close >= d.open;
      const col = up ? '#F03030' : '#3478F6';
      ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 1;

      // 심지
      ctx.beginPath();
      ctx.moveTo(x, toY(d.high));
      ctx.lineTo(x, toY(d.low));
      ctx.stroke();

      // 몸체
      const t = toY(Math.max(d.open, d.close));
      const bh = Math.max(1, toY(Math.min(d.open, d.close)) - t);
      ctx.fillRect(x - bw / 2, t, bw, bh);
    });

    // 크로스헤어
    if (s.mx >= 0 && s.mx < cW && s.my >= 0 && s.my < cH) {
      const hovI = candles.length - 1 - Math.round((cW - s.mx) / s.scale);
      const hov = candles[Math.max(0, Math.min(candles.length - 1, hovI))];

      ctx.setLineDash([4, 4]); ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, s.my); ctx.lineTo(cW, s.my); ctx.stroke();
      if (hov) {
        const cx = toX(Math.max(0, Math.min(candles.length - 1, hovI)));
        ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, cH); ctx.stroke();
      }
      ctx.setLineDash([]);

      // 가격 레이블 (우측 축)
      const hp = pMin + ((cH - PAD - s.my) / (cH - PAD * 2)) * pRange;
      ctx.fillStyle = '#334155';
      ctx.fillRect(cW, s.my - 11, AXIS_R, 22);
      ctx.fillStyle = '#fff'; ctx.textAlign = 'left';
      ctx.fillText(fmtPrice(hp), cW + 4, s.my + 4);

      // OHLC 툴팁
      if (hov) {
        const up = hov.close >= hov.open;
        const lines = [hov.date, `O ${fmtPrice(hov.open)}`, `H ${fmtPrice(hov.high)}`, `L ${fmtPrice(hov.low)}`, `C ${fmtPrice(hov.close)}`];
        const tw = 118, th = lines.length * 16 + 10;
        let tx = s.mx + 14, ty = s.my - th / 2;
        if (tx + tw > cW) tx = s.mx - tw - 14;
        ty = Math.max(0, Math.min(cH - th, ty));

        ctx.fillStyle = 'rgba(15,23,42,0.88)';
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(tx, ty, tw, th, 4);
        else ctx.rect(tx, ty, tw, th);
        ctx.fill();

        lines.forEach((ln, i) => {
          ctx.fillStyle = i === 0 ? '#94a3b8' : up ? '#F03030' : '#3478F6';
          ctx.textAlign = 'left';
          ctx.fillText(ln, tx + 8, ty + 14 + i * 16);
        });
      }
    }

    // 테두리
    ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 1; ctx.setLineDash([]);
    ctx.strokeRect(0, 0, cW, cH);
    ctx.restore();
  }, [data]);

  // 캔버스 크기 초기화 + ResizeObserver
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const dpr = window.devicePixelRatio || 1;
    const logicalW = cv.parentElement!.clientWidth;
    cv.width  = logicalW * dpr;
    cv.height = H * dpr;
    cv.style.width  = logicalW + 'px';
    cv.style.height = H + 'px';

    const ro = new ResizeObserver(() => {
      const w = cv.parentElement!.clientWidth;
      cv.width  = w * dpr;
      cv.style.width = w + 'px';
      draw();
    });
    ro.observe(cv.parentElement!);
    return () => ro.disconnect();
  }, []);   // 마운트 시 한 번만

  // data 바뀔 때마다 즉시 다시 그리기
  useEffect(() => {
    draw();
  }, [draw]);

  // 마우스 이벤트
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv || !data.length) return;
    const s = st.current;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      s.scale = Math.max(4, Math.min(50, s.scale + (e.deltaY < 0 ? 2 : -2)));
      draw();
    };
    const onDown = (e: MouseEvent) => { s.dragStart = e.clientX; s.dragOff = s.offset; };
    const onMove = (e: MouseEvent) => {
      const r = cv.getBoundingClientRect();
      s.mx = e.clientX - r.left; s.my = e.clientY - r.top;
      if (s.dragStart !== null) {
        const moved = Math.round(-(e.clientX - s.dragStart) / s.scale);
        s.offset = Math.max(0, Math.min(data.length - 5, s.dragOff + moved));
      }
      draw();
    };
    const onUp = () => { s.dragStart = null; };
    const onLeave = () => { s.mx = -1; s.my = -1; s.dragStart = null; draw(); };

    cv.addEventListener('wheel', onWheel, { passive: false });
    cv.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    cv.addEventListener('mouseleave', onLeave);
    return () => {
      cv.removeEventListener('wheel', onWheel);
      cv.removeEventListener('mousedown', onDown);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      cv.removeEventListener('mouseleave', onLeave);
    };
  }, [data, draw]);

  return (
    <div className="w-full relative" style={{ cursor: data.length ? 'crosshair' : 'default' }}>
      <canvas ref={canvasRef} className="block" />
      {!data.length && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-50 rounded-xl">
          <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}

export default function StocksDashboard() {
  const [data, setData] = useState<{ indices: IndexData[]; stocks: StockData[]; worldIndices: WorldIndex[] } | null>(null);
  const [chart, setChart] = useState<ChartPoint[]>([]);
  const [selected, setSelected] = useState('KOSPI');
  const [apiTf, setApiTf] = useState<'minute'|'day'|'week'|'month'>('day');
  const [tfMain, setTfMain] = useState<'tick'|'minute'|'day'|'week'|'month'>('day');
  const [tfSub, setTfSub] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stocks')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); });
  }, []);

  // selected 또는 apiTf 가 바뀔 때마다 자동으로 차트 재로딩
  useEffect(() => {
    setChart([]);
    fetch(`/api/stocks/chart?symbol=${selected}&tf=${apiTf}`)
      .then(r => r.json())
      .then(d => Array.isArray(d) && setChart(d));
  }, [selected, apiTf]);

  const handleTfMain = (main: 'day'|'week'|'month') => {
    setTfMain(main);
    setTfSub('');
    setApiTf(main);
  };

  const handleTickSelect = (val: string) => {
    setTfMain('tick');
    setTfSub(val);
    setApiTf('minute');
  };

  const handleMinuteSelect = (val: string) => {
    setTfMain('minute');
    setTfSub(val);
    setApiTf('minute');
  };

  // 지수 여부 (KOSPI, KOSDAQ, 해외지수 .으로 시작) — 분봉 미지원
  const isIndexSelected = selected === 'KOSPI' || selected === 'KOSDAQ' || selected.startsWith('.');

  // 종목/지수 선택: 지수 클릭 시 틱/분 상태면 일봉으로 리셋
  const selectSymbol = (sym: string) => {
    const isIdx = sym === 'KOSPI' || sym === 'KOSDAQ' || sym.startsWith('.');
    if (isIdx && (tfMain === 'tick' || tfMain === 'minute')) {
      setTfMain('day');
      setTfSub('');
      setApiTf('day');
    }
    setSelected(sym);
  };

  const selectedInfo = data
    ? [
        ...(data.indices ?? []).map((d, i) => ({ sym: ['KOSPI', 'KOSDAQ'][i], name: d.name, price: d.price, change: d.change, ratio: d.ratio, isUp: d.isUp })),
        ...(data.worldIndices ?? []).map(d => ({ sym: d.code, name: d.name, price: d.price, change: d.change, ratio: d.ratio, isUp: d.isUp })),
        ...(data.stocks ?? []).map(d => ({ sym: d.code, name: d.name, price: d.price, change: d.change, ratio: d.ratio, isUp: d.isUp })),
      ].find(d => d.sym === selected)
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">증권·주식</h1>
        <p className="text-sm text-slate-400 mt-1">네이버 증권 실시간 데이터</p>
      </div>

      {/* 지수 카드 — 국내 + 해외 통합 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {loading
          ? Array(9).fill(0).map((_, i) => <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 h-24 animate-pulse" />)
          : <>
              {/* 국내 지수 */}
              {data?.indices.map((idx, i) => {
                const sym = ['KOSPI', 'KOSDAQ'][i];
                const isSelected = selected === sym;
                return (
                  <button
                    key={sym}
                    onClick={() => selectSymbol(sym)}
                    className={`bg-white rounded-xl border p-4 text-left transition-all hover:shadow-md ${isSelected ? 'border-indigo-400 shadow-sm' : 'border-slate-200'}`}
                  >
                    <p className="text-xs text-slate-400 mb-2">🇰🇷 KR</p>
                    <p className="text-sm font-bold text-slate-700">{idx.name}</p>
                    <p className="text-lg font-black text-slate-900 mt-1 tabular-nums">{idx.price}</p>
                    <p className={`text-xs font-semibold mt-0.5 ${idx.isUp ? 'text-[#F03030]' : 'text-[#3478F6]'}`}>
                      {idx.isUp ? '▲' : '▼'} {idx.ratio}%
                    </p>
                  </button>
                );
              })}

              {/* 해외 지수 */}
              {data?.worldIndices.map(w => {
                const isSelected = selected === w.code;
                return (
                  <button
                    key={w.code}
                    onClick={() => selectSymbol(w.code)}
                    className={`bg-white rounded-xl border p-4 text-left transition-all hover:shadow-md ${isSelected ? 'border-indigo-400 shadow-sm' : 'border-slate-200'}`}
                  >
                    <p className="text-xs text-slate-400 mb-2">{REGION_FLAG[w.region]} {w.region}</p>
                    <p className="text-sm font-bold text-slate-700">{w.name}</p>
                    <p className="text-lg font-black text-slate-900 mt-1 tabular-nums">{w.price}</p>
                    <p className={`text-xs font-semibold mt-0.5 ${w.isUp ? 'text-[#F03030]' : 'text-[#3478F6]'}`}>
                      {w.isUp ? '▲' : '▼'} {w.ratio}%
                    </p>
                  </button>
                );
              })}
            </>
        }
      </div>

      {/* 메인 차트 */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        {/* 종목명 + 가격 */}
        <div className="flex items-center gap-3 mb-3">
          <h2 className="text-sm font-bold text-slate-800">{selectedInfo?.name ?? selected}</h2>
          {selectedInfo && (
            <span className={`text-sm font-semibold ${selectedInfo.isUp ? 'text-[#F03030]' : 'text-[#3478F6]'}`}>
              {selectedInfo.price} &nbsp;{selectedInfo.isUp ? '▲' : '▼'} {selectedInfo.ratio}%
            </span>
          )}
        </div>

        {/* 시간봉 선택 */}
        <div className="flex items-center gap-1 mb-4">
          {/* 틱 select */}
          <select
            value={tfMain === 'tick' ? tfSub : '__tick__'}
            onChange={e => handleTickSelect(e.target.value)}
            disabled={isIndexSelected}
            title={isIndexSelected ? '지수는 틱봉을 지원하지 않습니다' : undefined}
            className={`text-xs rounded px-2 py-1 border transition-colors focus:outline-none ${
              isIndexSelected
                ? 'border-slate-100 text-slate-300 bg-slate-50 cursor-not-allowed'
                : tfMain === 'tick'
                  ? 'border-slate-800 text-slate-900 font-semibold bg-white cursor-pointer'
                  : 'border-slate-200 text-slate-400 bg-white hover:text-slate-600 hover:border-slate-300 cursor-pointer'
            }`}
          >
            <option value="__tick__" disabled>틱</option>
            {['1','3','5','10','30','60'].map(v => (
              <option key={v} value={v}>{v}틱</option>
            ))}
          </select>

          {/* 분 select */}
          <select
            value={tfMain === 'minute' ? tfSub : '__min__'}
            onChange={e => handleMinuteSelect(e.target.value)}
            disabled={isIndexSelected}
            title={isIndexSelected ? '지수는 분봉을 지원하지 않습니다' : undefined}
            className={`text-xs rounded px-2 py-1 border transition-colors focus:outline-none ${
              isIndexSelected
                ? 'border-slate-100 text-slate-300 bg-slate-50 cursor-not-allowed'
                : tfMain === 'minute'
                  ? 'border-slate-800 text-slate-900 font-semibold bg-white cursor-pointer'
                  : 'border-slate-200 text-slate-400 bg-white hover:text-slate-600 hover:border-slate-300 cursor-pointer'
            }`}
          >
            <option value="__min__" disabled>분</option>
            {['1','3','5','10','15','30','60'].map(v => (
              <option key={v} value={v}>{v}분</option>
            ))}
          </select>

          {/* 일 주 월 버튼 */}
          {(['day','week','month'] as const).map((m, i) => (
            <button
              key={m}
              onClick={() => handleTfMain(m)}
              className={`px-3 py-1 text-xs font-semibold rounded border transition-colors cursor-pointer ${
                tfMain === m
                  ? 'border-slate-800 text-slate-900 bg-white'
                  : 'border-slate-200 text-slate-400 bg-white hover:text-slate-600 hover:border-slate-300'
              }`}
            >
              {['일','주','월'][i]}
            </button>
          ))}
        </div>

        <MainChart data={chart} />
      </div>

      {/* 주요 종목 */}
      <div>
        <h2 className="text-sm font-bold text-slate-700 mb-3">주요 종목</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {loading
            ? Array(6).fill(0).map((_, i) => <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 h-20 animate-pulse" />)
            : data?.stocks.map(s => {
              const isSelected = selected === s.code;
              return (
                <button
                  key={s.code}
                  onClick={() => selectSymbol(s.code)}
                  className={`bg-white rounded-xl border p-4 text-left transition-all hover:shadow-md ${isSelected ? 'border-indigo-400 shadow-sm' : 'border-slate-200'}`}
                >
                  <p className="text-xs text-slate-400 mb-1">{s.code}</p>
                  <p className="text-sm font-bold text-slate-800 truncate">{s.name}</p>
                  <p className="text-base font-black text-slate-900 mt-1">{s.price}</p>
                  <p className={`text-xs font-semibold mt-0.5 ${s.isUp ? 'text-[#F03030]' : 'text-[#3478F6]'}`}>
                    {s.isUp ? '▲' : '▼'} {s.change} ({s.ratio}%)
                  </p>
                </button>
              );
            })
          }
        </div>
      </div>

      {/* 바이낸스 실시간 코인 */}
      <CryptoSection />

      <p className="text-xs text-slate-300 text-right">주식: 네이버 증권 · 코인: Binance WebSocket</p>
    </div>
  );
}
