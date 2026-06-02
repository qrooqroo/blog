'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Article {
  id: number;
  title: string;
  slug: string;
}

export default function NewsVerticalTicker({ articles, locale = 'ko' }: { articles: Article[]; locale?: string }) {
  const [idx, setIdx] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    if (articles.length <= 1) return;
    const id = setInterval(() => {
      setTransitioning(true);
      setTimeout(() => {
        setIdx(i => (i + 1) % articles.length);
        setTransitioning(false);
      }, 600);
    }, 10000);
    return () => clearInterval(id);
  }, [articles.length]);

  if (!articles.length) return null;

  const current = articles[idx];
  const next = articles[(idx + 1) % articles.length];

  return (
    <div className="flex items-center gap-2.5">
      <svg className="flex-shrink-0 text-indigo-400" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
      </svg>
    <div className="relative overflow-hidden flex-1" style={{ height: '44px' }}>
      {/* 현재 항목: 위로 올라가며 사라짐. key로 idx 변경 시 강제 리마운트 */}
      <Link
        key={idx}
        href={`/${locale}/news/${current.slug}`}
        className="absolute inset-0 flex items-center text-sm font-semibold text-slate-700 hover:text-indigo-600 hover:underline truncate"
        style={{
          transform: transitioning ? 'translateY(-100%)' : 'translateY(0)',
          opacity: transitioning ? 0 : 1,
          transition: transitioning ? 'transform 0.6s ease, opacity 0.4s ease' : 'none',
        }}
      >
        {current.title}
      </Link>

      {/* 다음 항목: 아래에서 위로 올라오며 등장 */}
      {transitioning && (
        <Link
          key={`next-${idx}`}
          href={`/${locale}/news/${next.slug}`}
          className="absolute inset-0 flex items-center text-sm font-semibold text-slate-700 truncate"
          style={{ animation: 'slideUpIn 0.6s ease forwards' }}
        >
          {next.title}
        </Link>
      )}
    </div>
    </div>
  );
}
