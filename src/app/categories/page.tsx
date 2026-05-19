export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { supabase } from '@/lib/supabase';

type Cat = { id: number; name: string; slug: string; parent_id: number | null; count: number };

const ICONS: Record<string, string> = {
  'AI & 머신러닝':     '🤖',
  '클라우드 & 인프라': '☁️',
  '소프트웨어 개발':   '💻',
  '데이터 & 분석':     '📊',
  '블록체인 & Web3':   '⛓️',
  '신기술 & 미래':     '🚀',
  '보안 & 프라이버시': '🔐',
  '컴퓨터공학 기초':   '📐',
  '화학 & 생명과학':   '🧬',
  '비즈니스 & 산업':   '💼',
};

const COLORS: Record<string, { bg: string; border: string; badge: string; text: string }> = {
  'AI & 머신러닝':     { bg: 'bg-violet-50',  border: 'border-violet-200', badge: 'bg-violet-100 text-violet-700', text: 'text-violet-700' },
  '클라우드 & 인프라': { bg: 'bg-sky-50',     border: 'border-sky-200',    badge: 'bg-sky-100 text-sky-700',     text: 'text-sky-700'    },
  '소프트웨어 개발':   { bg: 'bg-indigo-50',  border: 'border-indigo-200', badge: 'bg-indigo-100 text-indigo-700', text: 'text-indigo-700' },
  '데이터 & 분석':     { bg: 'bg-cyan-50',    border: 'border-cyan-200',   badge: 'bg-cyan-100 text-cyan-700',   text: 'text-cyan-700'   },
  '블록체인 & Web3':   { bg: 'bg-amber-50',   border: 'border-amber-200',  badge: 'bg-amber-100 text-amber-700', text: 'text-amber-700'  },
  '신기술 & 미래':     { bg: 'bg-rose-50',    border: 'border-rose-200',   badge: 'bg-rose-100 text-rose-700',   text: 'text-rose-700'   },
  '보안 & 프라이버시': { bg: 'bg-red-50',     border: 'border-red-200',    badge: 'bg-red-100 text-red-700',     text: 'text-red-700'    },
  '컴퓨터공학 기초':   { bg: 'bg-slate-50',   border: 'border-slate-200',  badge: 'bg-slate-100 text-slate-700', text: 'text-slate-700'  },
  '화학 & 생명과학':   { bg: 'bg-green-50',   border: 'border-green-200',  badge: 'bg-green-100 text-green-700', text: 'text-green-700'  },
  '비즈니스 & 산업':   { bg: 'bg-orange-50',  border: 'border-orange-200', badge: 'bg-orange-100 text-orange-700', text: 'text-orange-700' },
};

const DEFAULT_COLOR = { bg: 'bg-slate-50', border: 'border-slate-200', badge: 'bg-slate-100 text-slate-700', text: 'text-slate-700' };

export default async function CategoriesPage() {
  const { data: raw } = await supabase
    .from('categories')
    .select('*')
    .order('id');

  const all: Cat[] = (raw ?? []) as Cat[];
  const tops  = all.filter(c => !c.parent_id);
  const countMap: Record<number, number> = {};
  for (const c of all) countMap[c.id] = c.count ?? 0;

  const totalDocs = all.reduce((s, c) => s + (c.count ?? 0), 0);

  return (
    <div className="max-w-5xl mx-auto">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-slate-400 mb-3">
          <Link href="/" className="hover:text-indigo-500 transition-colors">홈</Link>
          <span>›</span>
          <span className="text-slate-600">카테고리</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900">전체 카테고리</h1>
        <p className="text-sm text-slate-400 mt-1">
          {tops.length}개 분야 · {all.filter(c => c.parent_id).length}개 세부 카테고리
          {totalDocs > 0 && ` · 총 ${totalDocs}개 문서`}
        </p>
      </div>

      {/* 카테고리 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {tops.map(top => {
          const children = all.filter(c => c.parent_id === top.id);
          const color = COLORS[top.name] ?? DEFAULT_COLOR;
          const icon  = ICONS[top.name] ?? '📁';
          const topCount = children.reduce((s, c) => s + (c.count ?? 0), 0) + (top.count ?? 0);

          return (
            <div
              key={top.id}
              className={`rounded-2xl border ${color.border} ${color.bg} p-5 flex flex-col gap-4`}
            >
              {/* 최상위 카테고리 헤더 */}
              <div className="flex items-center justify-between">
                <Link
                  href={`/category/${top.slug}`}
                  className="flex items-center gap-2.5 group"
                >
                  <span className="text-xl">{icon}</span>
                  <span className={`font-black text-base ${color.text} group-hover:underline`}>
                    {top.name}
                  </span>
                </Link>
                {topCount > 0 && (
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${color.badge}`}>
                    {topCount}개
                  </span>
                )}
              </div>

              {/* 서브카테고리 태그들 */}
              {children.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {children.map(child => (
                    <Link
                      key={child.id}
                      href={`/category/${child.slug}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-white/80 hover:border-slate-300 hover:shadow-sm text-sm text-slate-700 hover:text-slate-900 transition-all"
                    >
                      <span>{child.name}</span>
                      {(child.count ?? 0) > 0 && (
                        <span className="text-xs text-slate-400">{child.count}</span>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
