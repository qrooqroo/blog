'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Insight } from '@/lib/insights';

const INTERVAL = 5000;

export default function InsightSlider({ insights }: { insights: Insight[] }) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const prev = useCallback(() => setCurrent(c => (c - 1 + insights.length) % insights.length), [insights.length]);
  const next = useCallback(() => setCurrent(c => (c + 1) % insights.length), [insights.length]);

  useEffect(() => {
    if (paused || insights.length <= 1) return;
    const id = setInterval(next, INTERVAL);
    return () => clearInterval(id);
  }, [paused, next, insights.length]);

  if (!insights.length) return null;

  const item = insights[current];

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden select-none h-56 sm:h-80 md:h-[420px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* 슬라이드 이미지 */}
      {insights.map((ins, i) => (
        <div
          key={ins.id}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === current ? 1 : 0, zIndex: i === current ? 1 : 0 }}
        >
          <img src={ins.image ?? ''} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        </div>
      ))}

      {/* 텍스트 */}
      <Link
        href={`/insights/${item.slug}`}
        className="absolute inset-0 z-10 flex flex-col justify-end p-6 md:p-8 group"
      >
        <h2 className="text-xl md:text-2xl font-black text-white leading-tight mb-2 group-hover:text-indigo-300 transition-colors line-clamp-2">
          {item.title}
        </h2>
        <p className="text-sm text-white/70 line-clamp-2">{item.excerpt}</p>
      </Link>

      {/* 이전/다음 */}
      {insights.length > 1 && (
        <>
          <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/30 hover:bg-black/60 text-white flex items-center justify-center transition-colors backdrop-blur-sm" aria-label="이전">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/30 hover:bg-black/60 text-white flex items-center justify-center transition-colors backdrop-blur-sm" aria-label="다음">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
          </button>
        </>
      )}

      {/* 인디케이터 */}
      {insights.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
          {insights.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`rounded-full transition-all duration-300 ${i === current ? 'w-5 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/70'}`}
              aria-label={`${i + 1}번째`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
