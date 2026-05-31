'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Insight } from '@/lib/insights';

const INTERVAL = 5000;

export default function InsightSlider({ insights, locale = 'ko' }: { insights: Insight[]; locale?: string }) {
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
  const isEn = locale === 'en';
  const itemTitle = (isEn && item.title_en) ? item.title_en : item.title;
  const itemExcerpt = (isEn && item.excerpt_en) ? item.excerpt_en : item.excerpt;

  return (
    <div className="flex flex-col md:flex-row gap-5 items-stretch">
      {/* 슬라이더 */}
      <div
        className="relative w-full md:w-2/3 md:flex-shrink-0 rounded-2xl overflow-hidden select-none h-56 sm:h-80 md:h-[420px]"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {insights.map((ins, i) => (
          <div
            key={ins.id}
            className="absolute inset-0 transition-opacity duration-700"
            style={{ opacity: i === current ? 1 : 0, zIndex: i === current ? 1 : 0 }}
          >
            {ins.image && <img src={ins.image} alt="" className="w-full h-full object-cover" />}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          </div>
        ))}

        <Link
          href={`/${locale}/insights/${item.slug}`}
          className="absolute inset-0 z-10 flex flex-col justify-end p-6 md:p-8 group"
        >
          <h2 className="text-xl md:text-2xl font-black text-white leading-tight mb-2 group-hover:text-indigo-300 transition-colors line-clamp-2">
            {itemTitle}
          </h2>
          <p className="text-sm text-white/70 line-clamp-2">{itemExcerpt}</p>
        </Link>

        {insights.length > 1 && (
          <>
            <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/30 hover:bg-black/60 text-white flex items-center justify-center transition-colors backdrop-blur-sm cursor-pointer" aria-label="이전">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/30 hover:bg-black/60 text-white flex items-center justify-center transition-colors backdrop-blur-sm cursor-pointer" aria-label="다음">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          </>
        )}

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

      {/* 오른쪽 목록 — current와 동기화 */}
      <div className="hidden md:flex flex-1 flex-col justify-between md:h-[420px]">
        {insights.map((ins, i) => {
          const title = (isEn && ins.title_en) ? ins.title_en : ins.title;
          const isActive = i === current;
          return (
            <button
              key={ins.id}
              onClick={() => setCurrent(i)}
              className={`flex gap-3 items-center p-2 rounded-xl transition-all border text-left flex-1 w-full cursor-pointer ${
                isActive
                  ? 'bg-indigo-50 border-indigo-200'
                  : 'border-transparent hover:bg-white hover:shadow-sm hover:border-slate-200'
              }`}
            >
              {ins.image && (
                <img src={ins.image} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
              )}
              <p className={`text-sm font-semibold leading-snug line-clamp-2 transition-colors ${
                isActive ? 'text-indigo-600' : 'text-slate-700'
              }`}>
                {title}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
