'use client';

import { useState } from 'react';
import ArticleCard from '@/components/ArticleCard';
import { Article } from '@/types';

const CATEGORY_ORDER = ['AI', '비트코인', '증권', '경제', '건강', '부동산', '사회', '국제', '스포츠'];

const CATEGORY_COLORS: Record<string, string> = {
  'AI':     'bg-violet-500 text-white',
  '비트코인': 'bg-amber-500 text-white',
  '증권':   'bg-emerald-500 text-white',
  '경제':   'bg-blue-500 text-white',
  '건강':   'bg-teal-500 text-white',
  '부동산': 'bg-orange-500 text-white',
  '사회':   'bg-rose-500 text-white',
  '국제':   'bg-indigo-500 text-white',
  '스포츠': 'bg-green-500 text-white',
};

interface Props {
  byCategory: Record<string, Article[]>;
}

export default function NewsCategoryTabs({ byCategory }: Props) {
  const categories = CATEGORY_ORDER.filter(c => byCategory[c]?.length > 0);
  const [active, setActive] = useState(categories[0] ?? '');

  const articles = byCategory[active] ?? [];

  return (
    <div className="space-y-5">
      {/* 탭 */}
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => {
          const isActive = cat === active;
          const color = CATEGORY_COLORS[cat] ?? 'bg-slate-500 text-white';
          return (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-150 ${
                isActive
                  ? color + ' shadow-sm scale-105'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {cat}
              <span className={`ml-1.5 text-xs ${isActive ? 'opacity-80' : 'opacity-50'}`}>
                {byCategory[cat]?.length ?? 0}
              </span>
            </button>
          );
        })}
      </div>

      {/* 기사 그리드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {articles.map(a => (
          <ArticleCard key={a.id} article={a} basePath="/news" />
        ))}
      </div>
    </div>
  );
}
