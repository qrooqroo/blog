'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Article } from '@/types';
import { formatDate } from '@/lib/format';

const CATEGORY_COLORS: Record<string, string> = {
  'AI': 'bg-violet-500 text-white',
  '비트코인': 'bg-amber-500 text-white',
  '경제': 'bg-blue-500 text-white',
  'IT': 'bg-indigo-500 text-white',
  '뉴스': 'bg-slate-500 text-white',
};

const INTERVAL = 5000;

export default function NewsSlider({ articles }: { articles: Article[] }) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const prev = useCallback(() => setCurrent(c => (c - 1 + articles.length) % articles.length), [articles.length]);
  const next = useCallback(() => setCurrent(c => (c + 1) % articles.length), [articles.length]);

  useEffect(() => {
    if (paused || articles.length <= 1) return;
    const id = setInterval(next, INTERVAL);
    return () => clearInterval(id);
  }, [paused, next, articles.length]);

  if (articles.length === 0) return null;

  const article = articles[current];
  const tagColor = CATEGORY_COLORS[article.category] ?? 'bg-slate-500 text-white';

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden select-none"
      style={{ height: '420px' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* 슬라이드 이미지들 (미리 렌더, opacity로 전환) */}
      {articles.map((a, i) => (
        <div
          key={a.id}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === current ? 1 : 0, zIndex: i === current ? 1 : 0 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={a.image || undefined}
            alt=""
            className="w-full h-full object-cover"
          />
          {/* 그라데이션 오버레이 */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        </div>
      ))}

      {/* 텍스트 콘텐츠 */}
      <Link
        href={`/news/${article.slug}`}
        className="absolute inset-0 z-10 flex flex-col justify-end p-6 md:p-8 group"
      >
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${tagColor}`}>
              {article.category}
            </span>
            <span className="text-xs text-white/60">{formatDate(article.date)}</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-white leading-tight mb-2 group-hover:text-indigo-300 transition-colors line-clamp-2">
            {article.title}
          </h2>
          <p className="text-sm text-white/70 line-clamp-2 max-w-2xl">
            {article.excerpt}
          </p>
        </div>
      </Link>

      {/* 이전/다음 버튼 */}
      {articles.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/30 hover:bg-black/60 text-white flex items-center justify-center transition-colors backdrop-blur-sm"
            aria-label="이전"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/30 hover:bg-black/60 text-white flex items-center justify-center transition-colors backdrop-blur-sm"
            aria-label="다음"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </>
      )}

      {/* 인디케이터 도트 */}
      {articles.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
          {articles.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`rounded-full transition-all duration-300 ${
                i === current
                  ? 'w-5 h-1.5 bg-white'
                  : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`${i + 1}번째 슬라이드`}
            />
          ))}
        </div>
      )}

      {/* 진행 바 */}
      {!paused && articles.length > 1 && (
        <div className="absolute bottom-0 left-0 z-20 h-0.5 bg-indigo-400/80 animate-progress" />
      )}
    </div>
  );
}
