'use client';

import { useEffect, useState } from 'react';

interface Indicator {
  key: string;
  name: string;
  value: string;
  pct: string;
  isUp: boolean;
  live: boolean;
}

export default function MarketTicker() {
  const [items, setItems] = useState<Indicator[]>([]);

  const load = () => {
    fetch('/api/market-indicators')
      .then(r => r.json())
      .then(d => Array.isArray(d) && setItems(d))
      .catch(() => {});
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  if (!items.length) {
    return (
      <div className="grid grid-cols-7 gap-3">
        {Array(7).fill(0).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 px-4 py-3 h-16 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-7 gap-3">
      {items.map(item => (
        <div key={item.key} className="bg-white rounded-xl border border-slate-200 px-4 py-3">
          <p className="text-xs text-slate-400 mb-1 truncate">{item.name}</p>
          <p className="text-sm font-black text-slate-900 tabular-nums">
            {item.live ? item.value : <span className="text-slate-300">—</span>}
          </p>
          {item.pct && (
            <p className={`text-xs font-semibold mt-0.5 truncate ${
              item.key === 'fng'
                ? item.isUp ? 'text-[#F03030]' : 'text-[#3478F6]'
                : item.isUp ? 'text-[#F03030]' : 'text-[#3478F6]'
            }`}>
              {item.key === 'fng'
                ? item.pct
                : `${item.isUp ? '▲' : '▼'} ${item.pct}`}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
