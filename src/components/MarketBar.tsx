'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

interface Slot {
  value: string;
  pct: string;
  isUp: boolean;
  live: boolean;
}

const LABELS = ['코스피', '코스닥', '나스닥', 'VIX', '달러/원', '금', 'BTC'];
const BLANK: Slot = { value: '—', pct: '', isUp: true, live: false };

function absPct(s: string) {
  return s.replace(/^[+\-]/, '');
}

export default function MarketBar() {
  const [slots, setSlots] = useState<Slot[]>(Array(7).fill(BLANK));
  const wsRef  = useRef<WebSocket | null>(null);
  const timer  = useRef<ReturnType<typeof setTimeout>>();

  const loadRest = useCallback(() => {
    Promise.all([
      fetch('/api/stocks').then(r => r.json()),
      fetch('/api/market-indicators').then(r => r.json()),
    ]).then(([stocks, inds]) => {
      const kospi  = stocks.indices?.[0];
      const kosdaq = stocks.indices?.[1];
      const nasdaq = stocks.worldIndices?.find((w: { code: string }) => w.code === '.IXIC');
      const vix    = inds.find((x: { key: string }) => x.key === 'vix');
      const krw    = inds.find((x: { key: string }) => x.key === 'usdkrw');
      const gold   = inds.find((x: { key: string }) => x.key === 'gold');

      setSlots(prev => {
        const next = [...prev];
        if (kospi)  next[0] = { value: kospi.price,  pct: `${kospi.ratio}%`,  isUp: kospi.isUp,  live: true };
        if (kosdaq) next[1] = { value: kosdaq.price, pct: `${kosdaq.ratio}%`, isUp: kosdaq.isUp, live: true };
        if (nasdaq) next[2] = { value: nasdaq.price, pct: `${nasdaq.ratio}%`, isUp: nasdaq.isUp, live: true };
        if (vix)    next[3] = { value: vix.value,    pct: absPct(vix.pct),    isUp: vix.isUp,    live: vix.live };
        if (krw)    next[4] = { value: krw.value,    pct: absPct(krw.pct),    isUp: krw.isUp,    live: krw.live };
        if (gold)   next[5] = { value: gold.value,   pct: absPct(gold.pct),   isUp: gold.isUp,   live: gold.live };
        return next;
      });
    }).catch(() => {});
  }, []);

  const connectBTC = useCallback(() => {
    const ws = new WebSocket('wss://stream.binance.com:9443/stream?streams=btcusdt@ticker');
    wsRef.current = ws;

    ws.onmessage = (e) => {
      const { data: d } = JSON.parse(e.data);
      const price = parseFloat(d.c);
      const pct   = parseFloat(d.P);
      setSlots(prev => {
        const next = [...prev];
        next[6] = {
          value: `$${price.toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
          pct:   `${Math.abs(pct).toFixed(2)}%`,
          isUp:  pct >= 0,
          live:  true,
        };
        return next;
      });
    };

    ws.onclose = () => { timer.current = setTimeout(connectBTC, 3000); };
    ws.onerror = () => ws.close();
  }, []);

  useEffect(() => {
    loadRest();
    const id = setInterval(loadRest, 30_000);
    connectBTC();
    return () => {
      clearInterval(id);
      clearTimeout(timer.current);
      wsRef.current?.close();
    };
  }, [loadRest, connectBTC]);

  return (
    <div className="overflow-x-auto -mx-4 px-4 sm:overflow-visible sm:mx-0 sm:px-0">
      <div className="flex gap-2 w-max sm:w-auto sm:grid sm:grid-cols-7 sm:gap-3">
        {slots.map((s, i) => (
          <div key={LABELS[i]} className="w-32 sm:w-auto bg-white rounded-xl border border-slate-200 px-3 sm:px-4 py-3">
            <p className="text-xs text-slate-400 mb-1 truncate">{LABELS[i]}</p>
            <p className="text-sm font-black text-slate-900 tabular-nums truncate">
              {s.live ? s.value : <span className="text-slate-300">—</span>}
            </p>
            {s.live && s.pct && (
              <p className={`text-xs font-semibold mt-0.5 tabular-nums ${s.isUp ? 'text-[#F03030]' : 'text-[#3478F6]'}`}>
                {s.isUp ? '▲' : '▼'} {s.pct}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
