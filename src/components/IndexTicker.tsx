'use client';

import { useEffect, useState } from 'react';

const DOMESTIC = ['KOSPI', 'KOSDAQ'];
const WORLD_PICK = ['.IXIC', '.DJI', '.INX', '.N225', '.HSI'];

interface IndexItem {
  name: string;
  price: string;
  ratio: string;
  isUp: boolean;
}

export default function IndexTicker() {
  const [items, setItems] = useState<IndexItem[]>([]);

  const load = () => {
    fetch('/api/stocks')
      .then(r => r.json())
      .then(d => {
        const domestic: IndexItem[] = (d.indices ?? []).map((idx: { name: string; price: string; ratio: string; isUp: boolean }) => ({
          name: idx.name,
          price: idx.price,
          ratio: idx.ratio,
          isUp: idx.isUp,
        }));

        const world: IndexItem[] = (d.worldIndices ?? [])
          .filter((w: { code: string }) => WORLD_PICK.includes(w.code))
          .sort((a: { code: string }, b: { code: string }) =>
            WORLD_PICK.indexOf(a.code) - WORLD_PICK.indexOf(b.code)
          )
          .map((w: { name: string; price: string; ratio: string; isUp: boolean }) => ({
            name: w.name,
            price: w.price,
            ratio: w.ratio,
            isUp: w.isUp,
          }));

        setItems([...domestic, ...world]);
      })
      .catch(() => {});
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 30_000);
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
        <div key={item.name} className="bg-white rounded-xl border border-slate-200 px-4 py-3">
          <p className="text-xs text-slate-400 mb-1 truncate">{item.name}</p>
          <p className="text-sm font-black text-slate-900 tabular-nums truncate">{item.price}</p>
          <p className={`text-xs font-semibold mt-0.5 tabular-nums ${item.isUp ? 'text-[#F03030]' : 'text-[#3478F6]'}`}>
            {item.isUp ? '▲' : '▼'} {item.ratio}%
          </p>
        </div>
      ))}
    </div>
  );
}
