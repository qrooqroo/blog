'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Article } from '@/types';
import { formatDate } from '@/lib/format';
import { parseTitleParts, resolveDisplayKo } from '@/lib/title-parser';

const CATEGORY_COLORS: Record<string, string> = {
  '경제': 'bg-blue-100 text-blue-700',
  '정치': 'bg-red-100 text-red-700',
  '사회': 'bg-green-100 text-green-700',
  '건강': 'bg-teal-100 text-teal-700',
  '스포츠': 'bg-orange-100 text-orange-700',
  'IT': 'bg-violet-100 text-violet-700',
  '문화': 'bg-pink-100 text-pink-700',
};

export default function FeaturedArticle({ article }: { article: Article }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const tagColor = CATEGORY_COLORS[article.category] ?? 'bg-slate-100 text-slate-600';

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;
    if (img.complete) {
      if (img.naturalWidth === 0) { setImgLoaded(true); setImgError(true); }
      else { setImgLoaded(true); }
    }
  }, []);

  return (
    <Link
      href={`/wiki/${article.slug}`}
      className="group block bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-indigo-300 hover:shadow-lg transition-all duration-200"
    >
      <div className="md:flex">
        {/* 이미지 */}
        <div className="md:w-2/5 h-52 md:h-auto relative overflow-hidden bg-slate-100 flex-shrink-0">
          {!imgLoaded && <div className="absolute inset-0 bg-slate-200 animate-pulse" />}
          {imgError && (
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 to-violet-50 flex items-end justify-end p-4">
              <span className="text-5xl font-black text-white/20 select-none leading-none">
                {(article.title_ko || article.title).slice(0, 2)}
              </span>
            </div>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgRef}
            src={article.image || undefined}
            alt=""
            className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-500 ${
              imgLoaded && !imgError ? 'opacity-90' : 'opacity-0'
            }`}
            onLoad={(e) => {
              const img = e.currentTarget;
              if (img.naturalWidth === 0) { setImgLoaded(true); setImgError(true); }
              else { setImgLoaded(true); }
            }}
            onError={() => { setImgLoaded(true); setImgError(true); }}
          />
        </div>

        {/* 내용 */}
        <div className="flex-1 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                최신 노트
              </span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${tagColor}`}>
                {article.category}
              </span>
            </div>
            {(() => {
              const parts = article.title_ko && article.title_en
                ? { ko: article.title_ko, en: article.title_en }
                : parseTitleParts(article.title);
              const displayKo = resolveDisplayKo(article.title, parts.ko);
              return (
                <h2 className="text-xl md:text-2xl font-black text-slate-900 leading-tight mb-3 group-hover:text-indigo-600 transition-colors">
                  {displayKo}
                  {parts.en && (
                    <span className="block font-normal text-slate-400 text-sm mt-0.5">
                      {parts.en}
                    </span>
                  )}
                </h2>
              );
            })()}
            <p className="text-sm text-slate-500 leading-relaxed line-clamp-3 whitespace-pre-wrap">
              {article.excerpt}
            </p>
          </div>
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
            <span className="text-xs text-slate-400">{formatDate(article.date)}</span>
            <span className="text-xs font-semibold text-indigo-600 group-hover:underline">
              읽기 →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
