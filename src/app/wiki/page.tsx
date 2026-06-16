export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import sql from '@/lib/supabase';
import Link from 'next/link';
import SearchBar from '@/components/SearchBar';
import { headers } from 'next/headers';

export const metadata: Metadata = {
  title: '위키 | AI Insight Note',
  description: '컴퓨터 과학, AI, 블록체인, 보안, 수학 등 IT 전문 용어와 개념을 정리한 기술 위키 데이터베이스.',
  alternates: { canonical: 'https://www.aiinsightnote.com/wiki' },
  openGraph: {
    type: 'website',
    url: 'https://www.aiinsightnote.com/wiki',
    title: '위키 | AI Insight Note',
    description: '컴퓨터 과학, AI, 블록체인, 보안, 수학 등 IT 전문 용어와 개념을 정리한 기술 위키 데이터베이스.',
    siteName: 'AI Insight Note',
  },
};

type RecentDoc = { title: string; title_en: string | null; slug: string; category_name: string | null };
type SubCategory = { name: string; slug: string; doc_count: number };
type Category = {
  id: number;
  name: string;
  slug: string;
  excerpt: string | null;
  total_docs: number;
  sub_categories: SubCategory[];
};

const PALETTE: Record<string, { grad: string; accent: string; badge: string; chip: string; arrow: string }> = {
  'blockchain':          { grad: 'from-purple-50 to-violet-50',  accent: 'border-l-purple-400',  badge: 'bg-purple-100 text-purple-700',  chip: 'bg-purple-50 text-purple-600 border-purple-200',    arrow: 'text-purple-500' },
  'computer-science':    { grad: 'from-blue-50 to-cyan-50',       accent: 'border-l-blue-400',    badge: 'bg-blue-100 text-blue-700',      chip: 'bg-blue-50 text-blue-600 border-blue-200',          arrow: 'text-blue-500' },
  'it':                  { grad: 'from-indigo-50 to-violet-50',   accent: 'border-l-indigo-400',  badge: 'bg-indigo-100 text-indigo-700',  chip: 'bg-indigo-50 text-indigo-600 border-indigo-200',    arrow: 'text-indigo-500' },
  'ai':                  { grad: 'from-emerald-50 to-teal-50',    accent: 'border-l-emerald-400', badge: 'bg-emerald-100 text-emerald-700',chip: 'bg-emerald-50 text-emerald-600 border-emerald-200', arrow: 'text-emerald-500' },
  'security-privacy':    { grad: 'from-rose-50 to-red-50',        accent: 'border-l-rose-400',    badge: 'bg-rose-100 text-rose-700',      chip: 'bg-rose-50 text-rose-600 border-rose-200',          arrow: 'text-rose-500' },
  'cloud-infrastructure':{ grad: 'from-sky-50 to-blue-50',        accent: 'border-l-sky-400',     badge: 'bg-sky-100 text-sky-700',        chip: 'bg-sky-50 text-sky-600 border-sky-200',             arrow: 'text-sky-500' },
  'mathematics':         { grad: 'from-amber-50 to-yellow-50',    accent: 'border-l-amber-400',   badge: 'bg-amber-100 text-amber-700',    chip: 'bg-amber-50 text-amber-600 border-amber-200',       arrow: 'text-amber-500' },
  'chemistry':           { grad: 'from-green-50 to-lime-50',      accent: 'border-l-green-400',   badge: 'bg-green-100 text-green-700',    chip: 'bg-green-50 text-green-600 border-green-200',       arrow: 'text-green-500' },
  'business-industry':   { grad: 'from-orange-50 to-amber-50',    accent: 'border-l-orange-400',  badge: 'bg-orange-100 text-orange-700',  chip: 'bg-orange-50 text-orange-600 border-orange-200',    arrow: 'text-orange-500' },
  'emerging-tech':       { grad: 'from-fuchsia-50 to-pink-50',    accent: 'border-l-fuchsia-400', badge: 'bg-fuchsia-100 text-fuchsia-700',chip: 'bg-fuchsia-50 text-fuchsia-600 border-fuchsia-200', arrow: 'text-fuchsia-500' },
};
const DEFAULT_P = { grad: 'from-slate-50 to-gray-50', accent: 'border-l-slate-300', badge: 'bg-slate-100 text-slate-600', chip: 'bg-slate-50 text-slate-500 border-slate-200', arrow: 'text-slate-400' };

function withTimeout<T>(p: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([p, new Promise<T>(r => setTimeout(() => r(fallback), ms))]);
}

async function getRecentDocs(): Promise<RecentDoc[]> {
  try {
    return await withTimeout(sql<RecentDoc[]>`
      SELECT d.title, d.title_en, d.slug, c.name as category_name
      FROM documents d
      LEFT JOIN categories c ON c.id = d.category_id
      WHERE d.published = true
        AND (d.is_internal IS NULL OR d.is_internal = FALSE)
      ORDER BY d.id DESC
      LIMIT 10
    `, 5000, []);
  } catch {
    return [];
  }
}

async function getCategories(): Promise<Category[]> {
  try {
  const [parents, children] = await Promise.all([
    withTimeout(sql<{ id: number; name: string; slug: string; excerpt: string | null; total_docs: number }[]>`
      SELECT
        p.id, p.name, p.slug, p.excerpt,
        COUNT(DISTINCT d.id)::int as total_docs
      FROM categories p
      LEFT JOIN categories c2 ON c2.id = p.id OR c2.parent_id = p.id
      LEFT JOIN documents d
        ON d.category_id = c2.id
        AND d.published = true
        AND (d.is_internal IS NULL OR d.is_internal = FALSE)
      WHERE p.parent_id IS NULL
      GROUP BY p.id, p.name, p.slug, p.excerpt
      ORDER BY total_docs DESC NULLS LAST, p.name
    `, 5000, []),
    withTimeout(sql<{ id: number; name: string; slug: string; parent_id: number; doc_count: number }[]>`
      SELECT c.id, c.name, c.slug, c.parent_id,
        COUNT(d.id)::int as doc_count
      FROM categories c
      LEFT JOIN documents d
        ON d.category_id = c.id
        AND d.published = true
        AND (d.is_internal IS NULL OR d.is_internal = FALSE)
      WHERE c.parent_id IS NOT NULL
      GROUP BY c.id, c.name, c.slug, c.parent_id
      ORDER BY doc_count DESC
    `, 5000, []),
  ]);

  const childMap = new Map<number, SubCategory[]>();
  for (const c of children) {
    if (!childMap.has(c.parent_id)) childMap.set(c.parent_id, []);
    childMap.get(c.parent_id)!.push({ name: c.name, slug: c.slug, doc_count: c.doc_count });
  }

  return parents.map(p => ({
    ...p,
    sub_categories: (childMap.get(p.id) ?? []).sort((a, b) => b.doc_count - a.doc_count),
  }));
  } catch {
    return [];
  }
}

export default async function WikiPage() {
  const headersList = await headers();
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  const locale = headersList.get('x-locale') ?? cookieStore.get('NEXT_LOCALE')?.value ?? 'ko';
  const isEn = locale === 'en';

  const [categories, recentDocs] = await Promise.all([getCategories(), getRecentDocs()]);
  const active  = categories.filter(c => c.total_docs > 0);
  const empty   = categories.filter(c => c.total_docs === 0);
  const totalDocs = active.reduce((s, c) => s + c.total_docs, 0);

  return (
    <div className="space-y-8">
      <SearchBar />

      {/* 최근 등록 문서 */}
      {recentDocs.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">
            {isEn ? 'Recently Added' : '최근 등록'}
          </h2>
          <div className="flex flex-col divide-y divide-slate-100 rounded-xl border border-slate-100 bg-white overflow-hidden">
            {recentDocs.map(doc => (
              <Link
                key={doc.slug}
                href={`/wiki/${doc.slug}`}
                className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 transition-colors group"
              >
                <span className="text-sm text-slate-700 group-hover:text-indigo-600 transition-colors font-medium truncate">
                  {isEn && doc.title_en ? doc.title_en : doc.title}
                </span>
                {doc.category_name && (
                  <span className="ml-3 flex-shrink-0 text-xs text-slate-400">
                    {doc.category_name}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 헤더 */}
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-800 tracking-tight">
            {isEn ? 'Categories' : '카테고리'}
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            {isEn
              ? `${totalDocs.toLocaleString()} articles · ${active.length} categories`
              : `${totalDocs.toLocaleString()}개 문서 · ${active.length}개 카테고리`}
          </p>
        </div>
        <Link
          href="/wiki/all"
          className="text-xs text-slate-400 hover:text-indigo-500 transition-colors"
        >
          {isEn ? 'View all →' : '전체 목록 →'}
        </Link>
      </div>

      {/* 카테고리 트리 */}
      <div className="space-y-5">
        {active.map(cat => {
          const p = PALETTE[cat.slug] ?? DEFAULT_P;
          const subs = cat.sub_categories.filter(s => s.doc_count > 0).slice(0, 8);

          return (
            <div key={cat.id} className="flex flex-col items-start">
              {/* 대메뉴 노드 */}
              <Link
                href={`/category/${cat.slug}`}
                className={`inline-flex items-center gap-2 rounded-xl bg-gradient-to-br ${p.grad} border border-white border-l-4 ${p.accent} shadow-sm px-4 py-2.5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`}
              >
                <span className="font-black text-slate-800 text-sm">{cat.name}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${p.badge}`}>{cat.total_docs}</span>
              </Link>

              {/* 소메뉴 노드들 — 아래로 */}
              {subs.length > 0 && (
                <div className="mt-1 ml-4 pl-5 border-l border-slate-200 flex flex-col gap-2 py-1.5">
                  {subs.map(sub => (
                    <div key={sub.slug} className="relative flex items-center">
                      {/* 수평 꺾임선 */}
                      <div className="absolute -left-5 top-1/2 w-5 h-px bg-slate-200" />
                      <Link
                        href={`/category/${sub.slug}`}
                        className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border ${p.chip} hover:shadow-sm transition-all whitespace-nowrap`}
                      >
                        {sub.name}
                        {sub.doc_count > 0 && (
                          <span className="ml-1.5 font-normal opacity-50">{sub.doc_count}</span>
                        )}
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 비어있는 카테고리 */}
      {empty.length > 0 && (
        <div>
          <p className="text-xs font-medium text-slate-400 mb-2">아직 문서 없음</p>
          <div className="flex flex-wrap gap-2">
            {empty.map(cat => (
              <span
                key={cat.id}
                className="text-xs px-3 py-1.5 bg-slate-50 text-slate-400 rounded-full border border-slate-200 cursor-default"
              >
                {cat.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
