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
    <div className="relative overflow-hidden" style={{ height: '44px' }}>
      {/* 현재 항목: 위로 올라가며 사라짐 */}
      <Link
        href={`/${locale}/news/${current.slug}`}
        className="absolute inset-0 flex items-center text-sm font-semibold text-slate-700 hover:text-indigo-600 hover:underline truncate"
        style={{
          transform: transitioning ? 'translateY(-100%)' : 'translateY(0)',
          opacity: transitioning ? 0 : 1,
          transition: 'transform 0.6s ease, opacity 0.4s ease',
        }}
      >
        {current.title}
      </Link>

      {/* 다음 항목: 아래에서 위로 올라오며 등장 */}
      {transitioning && (
        <Link
          href={`/${locale}/news/${next.slug}`}
          className="absolute inset-0 flex items-center text-sm font-semibold text-slate-700 truncate"
          style={{ animation: 'slideUpIn 0.6s ease forwards' }}
        >
          {next.title}
        </Link>
      )}
    </div>
  );
}
