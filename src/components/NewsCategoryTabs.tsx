'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Article } from '@/types';
import { formatDate } from '@/lib/format';
import { parseTitleParts, resolveDisplayKo } from '@/lib/title-parser';

const CATEGORY_ORDER = ['AI', '암호화폐', '증권', '경제', '건강', '부동산', '사회', '국제', '스포츠'];
const ALL_TAB = '전체';
const CATEGORY_EN: Record<string, string> = {
  '전체': 'All', 'AI': 'AI', '암호화폐': 'Crypto', '증권': 'Markets',
  '경제': 'Economy', '건강': 'Health', '부동산': 'Real Estate',
  '사회': 'Society', '국제': 'World', '스포츠': 'Sports',
};

interface Props {
  byCategory: Record<string, Article[]>;
  allArticles: Article[];
}

function getTitle(a: Article, isEn: boolean) {
  if (isEn) return a.title_en ?? a.title;
  const parts = a.title_ko && a.title_en
    ? { ko: a.title_ko, en: a.title_en }
    : parseTitleParts(a.title);
  return resolveDisplayKo(a.title, parts.ko);
}

export default function NewsCategoryTabs({ byCategory, allArticles, isEn = false }: Props & { isEn?: boolean }) {
  const categories = CATEGORY_ORDER.filter(c => byCategory[c]?.length > 0);
  const [active, setActive] = useState(ALL_TAB);

  const articles = active === ALL_TAB ? allArticles : (byCategory[active] ?? []);
  const leftCards = articles.slice(0, 2);
  const sideList = articles.slice(2, 7);
  const middleList = articles.slice(7, 21);

  return (
    <div className="space-y-5">
      {/* 탭 */}
      <div className="flex flex-wrap gap-0 border-b border-slate-200">
        {[ALL_TAB, ...categories].map(cat => {
          const isActive = cat === active;
          const count = cat === ALL_TAB ? allArticles.length : (byCategory[cat]?.length ?? 0);
          return (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`px-4 py-2 text-sm font-semibold transition-all duration-150 border-b-2 cursor-pointer ${
                isActive
                  ? 'border-b-2 text-slate-900 border-indigo-500'
                  : 'border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-300'
              }`}
            >
              {isEn ? (CATEGORY_EN[cat] ?? cat) : cat}
              <span className={`ml-1.5 text-xs ${isActive ? 'opacity-80' : 'opacity-50'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {articles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4" style={{ height: '440px' }}>
          {/* 왼쪽: 이미지 카드 2개 + 가운데 기사 목록 */}
          <div className="md:col-span-2 grid grid-cols-4 gap-4" style={{ height: '440px' }}>
            {/* 이미지 카드 2개 (왼쪽 2/4) */}
            <div className="col-span-2 flex flex-col gap-4" style={{ height: '440px' }}>
              {leftCards.map(a => (
                <Link
                  key={a.id}
                  href={`/news/${a.slug}`}
                  className="group flex-1 flex flex-col rounded-xl overflow-hidden border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-md transition-all min-h-0"
                >
                  <div className="relative flex-1 bg-slate-200 overflow-hidden min-h-0">
                    {a.image ? (
                      <img
                        src={a.image}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 to-violet-50" />
                    )}
                  </div>
                  <div className="px-3 py-2.5 shrink-0">
                    <h3 className="text-sm font-bold text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors h-[2.5rem] overflow-hidden">
                      {getTitle(a, isEn)}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>

            {/* 가운데 기사 목록 (오른쪽 2/4, 이미지 없음, 스크롤 없음) */}
            {middleList.length > 0 && (
              <div
                className="col-span-2 flex flex-col divide-y divide-slate-100 overflow-hidden"
                style={{ height: '440px' }}
              >
                {middleList.map(a => (
                  <Link
                    key={a.id}
                    href={`/news/${a.slug}`}
                    className="flex items-center px-4 py-2.5 hover:bg-slate-50 transition-colors group shrink-0"
                  >
                    <p className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors leading-snug h-[2.5rem] overflow-hidden">
                      {getTitle(a, isEn)}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* 오른쪽: 사이드 리스트 (기존 그대로) */}
          {sideList.length > 0 && (
            <div
              className="flex flex-col divide-y divide-slate-100 border border-slate-200 rounded-xl bg-white overflow-hidden"
              style={{ height: '440px' }}
            >
              {sideList.map(a => (
                <Link
                  key={a.id}
                  href={`/news/${a.slug}`}
                  className="flex items-center gap-3 p-3 hover:bg-slate-50 transition-colors group shrink-0"
                >
                  <div className="shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-slate-100">
                    {a.image ? (
                      <img src={a.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-100" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors leading-snug h-[2.5rem] overflow-hidden">
                      {getTitle(a, isEn)}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">{formatDate(a.date)}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
