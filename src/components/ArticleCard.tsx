'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Article } from '@/types';
import { formatDate } from '@/lib/format';
import { parseTitleParts, resolveDisplayKo } from '@/lib/title-parser';

const CATEGORY_COLORS: Record<string, string> = {
  '경제': 'bg-blue-50 text-blue-700',
  '정치': 'bg-red-50 text-red-700',
  '사회': 'bg-green-50 text-green-700',
  '건강': 'bg-teal-50 text-teal-700',
  '스포츠': 'bg-orange-50 text-orange-700',
  'IT': 'bg-violet-50 text-violet-700',
  '문화': 'bg-pink-50 text-pink-700',
};

// 이미지 오류 시 카테고리별 그래디언트 플레이스홀더
const PLACEHOLDER_GRADIENTS: Record<string, string> = {
  '블록체인':   'from-violet-100 to-indigo-50',
  'IT':         'from-indigo-100 to-blue-50',
  '컴퓨터공학': 'from-blue-100 to-cyan-50',
  '소프트웨어 개발': 'from-sky-100 to-blue-50',
  '프로그래밍 언어론': 'from-indigo-100 to-violet-50',
  '알고리즘':   'from-purple-100 to-indigo-50',
  '자료구조':   'from-blue-100 to-indigo-50',
  '운영체제':   'from-slate-200 to-slate-100',
  '컴퓨터 네트워크': 'from-teal-100 to-cyan-50',
  '데이터베이스': 'from-emerald-100 to-teal-50',
  '암호학':     'from-yellow-100 to-amber-50',
  '사이버 보안': 'from-red-100 to-orange-50',
  '머신러닝':   'from-blue-100 to-violet-50',
  '딥러닝':     'from-violet-100 to-purple-50',
  '대규모 언어 모델': 'from-purple-100 to-pink-50',
  '생성형 AI':  'from-pink-100 to-rose-50',
  '인공지능':   'from-violet-100 to-blue-50',
  '아키텍처 & 설계': 'from-slate-200 to-blue-50',
  'DevOps & CI/CD': 'from-orange-100 to-amber-50',
  '컨테이너 & 쿠버네티스': 'from-blue-100 to-sky-50',
};

function getPlaceholderGradient(category: string): string {
  if (PLACEHOLDER_GRADIENTS[category]) return PLACEHOLDER_GRADIENTS[category];
  // 상위 카테고리 매칭
  for (const [key, val] of Object.entries(PLACEHOLDER_GRADIENTS)) {
    if (category.includes(key) || key.includes(category)) return val;
  }
  return 'from-slate-150 to-slate-100';
}

interface Props {
  article: Article;
  size?: 'normal' | 'small';
  basePath?: string;
  showImage?: boolean;
}

export default function ArticleCard({ article, size = 'normal', basePath = '/wiki', showImage = true }: Props) {
  // 이미지 URL이 없으면 즉시 placeholder 표시 (SSR과 완전히 호환)
  const [imgError, setImgError] = useState(!article.image);
  const tagColor = CATEGORY_COLORS[article.category] ?? 'bg-slate-100 text-slate-600';

  const h = size === 'small' ? 'h-36' : 'h-44';
  const gradient = getPlaceholderGradient(article.category ?? '');

  return (
    <Link
      href={`${basePath}/${article.slug}`}
      className="group block bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-indigo-300 hover:shadow-md transition-all duration-200"
    >
      {/* 썸네일 */}
      {showImage && (
        <div className={`relative overflow-hidden ${h} bg-slate-200`}>
          {imgError ? (
            /* 이미지 없음 또는 로드 실패 시 그래디언트 플레이스홀더 */
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} flex items-end justify-end p-3`}>
              <span className="text-3xl font-black text-white/20 select-none leading-none">
                {(article.title_ko || article.title).slice(0, 2)}
              </span>
            </div>
          ) : (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={article.image!}
              alt=""
              className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-all duration-500"
              onError={() => setImgError(true)}
            />
          )}
        </div>
      )}

      {/* 내용 */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2.5">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${tagColor}`}>
            {article.category}
          </span>
          <span className="text-xs text-slate-400">{formatDate(article.date)}</span>
        </div>

        {(() => {
          const parts = article.title_ko && article.title_en
            ? { ko: article.title_ko, en: article.title_en }
            : parseTitleParts(article.title);
          const displayKo = resolveDisplayKo(article.title, parts.ko);
          return (
            <h3 className={`font-bold text-slate-800 leading-snug group-hover:text-indigo-600 transition-colors ${size === 'small' ? 'text-sm' : 'text-[0.95rem]'}`}>
              <span className="line-clamp-2">{displayKo}</span>
              {parts.en && (
                <span className="block font-normal text-slate-400 text-xs mt-0.5 line-clamp-1">
                  {parts.en}
                </span>
              )}
            </h3>
          );
        })()}

      </div>
    </Link>
  );
}
