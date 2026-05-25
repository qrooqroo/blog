'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

const COINS = [
  { symbol: 'BTCUSDT',  label: 'BTC',  name: 'Bitcoin' },
  { symbol: 'ETHUSDT',  label: 'ETH',  name: 'Ethereum' },
  { symbol: 'XRPUSDT',  label: 'XRP',  name: 'XRP' },
  { symbol: 'SOLUSDT',  label: 'SOL',  name: 'Solana' },
  { symbol: 'BNBUSDT',  label: 'BNB',  name: 'BNB' },
  { symbol: 'TONUSDT',  label: 'TON',  name: 'Toncoin' },
  { symbol: 'DOGEUSDT', label: 'DOGE', name: 'Dogecoin' },
];

interface Tick { price: string; percent: string; isUp: boolean; }

export default function CryptoTicker() {
  const [tickers, setTickers] = useState<Record<string, Tick>>({});
  const wsRef = useRef<WebSocket | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  const connect = useCallback(() => {
    const streams = COINS.map(c => `${c.symbol.toLowerCase()}@ticker`).join('/');
    const ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);
    wsRef.current = ws;

    ws.onmessage = (e) => {
      const { data: d } = JSON.parse(e.data);
      const price = parseFloat(d.c);
      const pct   = parseFloat(d.P);
      setTickers(prev => ({
        ...prev,
        [d.s]: {
          price: price.toLocaleString('en-US', { maximumFractionDigits: price < 1 ? 5 : price < 10 ? 4 : 2 }),
          percent: (pct >= 0 ? '+' : '') + pct.toFixed(2) + '%',
          isUp: pct >= 0,
        },
      }));
    };

    ws.onclose = () => { timer.current = setTimeout(connect, 3000); };
    ws.onerror = () => ws.close();
  }, []);

  useEffect(() => {
    connect();
    return () => { clearTimeout(timer.current); wsRef.current?.close(); };
  }, [connect]);

  return (
    <div className="overflow-x-auto -mx-4 px-4 sm:overflow-visible sm:mx-0 sm:px-0">
      <div className="flex gap-2 w-max sm:w-auto sm:grid sm:grid-cols-7 sm:gap-3">
        {COINS.map(coin => {
          const t = tickers[coin.symbol];
          return (
            <div key={coin.symbol} className="w-32 sm:w-auto bg-white rounded-xl border border-slate-200 px-3 sm:px-4 py-3">
              <p className="text-xs text-slate-400 mb-1">{coin.label}</p>
              <p className="text-sm font-black text-slate-900 tabular-nums">
                {t ? `$${t.price}` : <span className="text-slate-300">—</span>}
              </p>
              {t && (
                <p className={`text-xs font-semibold mt-0.5 tabular-nums ${t.isUp ? 'text-[#F03030]' : 'text-[#3478F6]'}`}>
                  {t.isUp ? '▲' : '▼'} {t.percent}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
