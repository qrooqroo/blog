export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { headers } from 'next/headers';
import { supabase } from '@/lib/supabase';
import sql from '@/lib/supabase';
import ArticleCard from '@/components/ArticleCard';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { Article } from '@/types';
import { mergeTitleParts } from '@/lib/articles';
import { isLocalHost } from '@/lib/image-utils';

interface Props {
  params: Promise<{ slug: string }>;
}

type Cat = {
  id: number; name: string; slug: string; parent_id: number | null;
  excerpt: string; markdown_content: string; image: string;
};

function collectDescendants(rootId: number, allCats: Cat[]): number[] {
  const children = allCats.filter(c => c.parent_id === rootId);
  return children.flatMap(c => [c.id, ...collectDescendants(c.id, allCats)]);
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const host = (await headers()).get('host') ?? '';
  const isLocal = isLocalHost(host);

  // 모든 카테고리 조회
  const { data: allCatsRaw, error: allCatsErr } = await supabase
    .from('categories')
    .select('id, name, slug, parent_id, excerpt, markdown_content, image');
  const allCats = allCatsRaw as Cat[] | null;

  if (allCatsErr || !allCats) {
    return <ErrorView msg={`카테고리 조회 실패: ${allCatsErr?.message}`} />;
  }

  // 숫자 ID로 접근 시 slug URL로 리다이렉트 (하위 호환)
  const numId = Number(slug);
  if (!isNaN(numId) && numId > 0) {
    const byId = allCats.find(c => c.id === numId);
    if (byId?.slug) {
      const { redirect } = await import('next/navigation');
      redirect(`/category/${byId.slug}`);
    }
    return <ErrorView msg={`카테고리 ID ${numId}를 찾을 수 없습니다.`} />;
  }

  // slug로 카테고리 찾기
  const cat = allCats.find(c => c.slug === slug);
  if (!cat) return <ErrorView msg={`카테고리 "${slug}"를 찾을 수 없습니다.`} />;

  const categoryId = cat.id;
  const parent     = cat.parent_id ? (allCats.find(c => c.id === cat.parent_id) ?? null) : null;
  const children   = allCats.filter(c => c.parent_id === categoryId);

  const descendantIds = collectDescendants(categoryId, allCats);
  const allIds   = [categoryId, ...descendantIds];
  const allNames = allIds.map(i => allCats.find(c => c.id === i)?.name).filter(Boolean) as string[];

  // 문서 목록 조회 — documents_with_category 뷰에 published 컬럼이 없으므로
  // documents 테이블과 JOIN해 발행된 문서만 가져온다.
  let docs: Article[] = [];
  try {
    const imageFilter = isLocal ? sql`` : sql`AND (d.image_ok IS NULL OR d.image_ok = TRUE)`;
    const rawDocs = await sql<Article[]>`
      SELECT dwc.*
      FROM documents_with_category dwc
      JOIN documents d ON d.id = dwc.id
      WHERE dwc.category_id = ANY(${allIds}::int[])
        AND (d.published IS NULL OR d.published = TRUE)
        AND (d.is_internal IS NULL OR d.is_internal = FALSE)
        ${imageFilter}
      ORDER BY dwc.date DESC, dwc.id DESC
    `;
    docs = await mergeTitleParts(rawDocs);
  } catch {
    // 폴백: documents 테이블 직접 조회
    const q = supabase.from('documents').select('*').publishedOnly().publicOnly().in('category_id', allIds)
      .order('date', { ascending: false }).order('id', { ascending: false });
    if (!isLocal) q.imageOkOnly();
    const idRes = await q;
    docs = idRes.error ? [] : (idRes.data ?? []) as Article[];
  }

  const newsRes = await supabase
    .from('news').select('*').in('category', allNames)
    .order('date', { ascending: false }).order('id', { ascending: false });
  const news: Article[] = newsRes.error ? [] : (newsRes.data ?? []) as Article[];

  const articles = [...docs, ...news].sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);

  const hasWiki = !!cat.markdown_content?.trim();

  return (
    <div className="max-w-3xl mx-auto">
      {/* 브레드크럼 */}
      <nav className="flex items-center gap-1.5 text-sm text-slate-400 mb-6 flex-wrap">
        <Link href="/" className="hover:text-indigo-500 transition-colors">홈</Link>
        <span>›</span>
        {parent && (
          <>
            <Link href={`/category/${parent.slug}`} className="hover:text-indigo-500 transition-colors">
              {parent.name}
            </Link>
            <span>›</span>
          </>
        )}
        <span className="text-slate-600">{cat.name}</span>
      </nav>

      {/* ── 카테고리 위키 문서 ── */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mb-8">
        {cat.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cat.image} alt={cat.name} className="w-full h-48 object-cover" />
        )}

        <div className="p-6 md:p-8">
          <div className="flex items-start justify-between gap-4 mb-4">
            <h1 className="text-2xl md:text-3xl font-black text-slate-900">{cat.name}</h1>
            <Link
              href={`/editor/category/${cat.id}`}
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 border border-slate-200 hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              편집
            </Link>
          </div>

          {cat.excerpt && (
            <p className="text-slate-500 text-sm leading-relaxed mb-6 border-l-2 border-slate-200 pl-4">
              {cat.excerpt}
            </p>
          )}

          {hasWiki ? (
            <MarkdownRenderer className="prose text-slate-700 text-[0.95rem]">
              {cat.markdown_content}
            </MarkdownRenderer>
          ) : (
            <p className="text-sm text-slate-300 italic">
              아직 작성된 설명이 없습니다.{' '}
              <Link href={`/editor/category/${cat.id}`} className="text-indigo-400 hover:underline">
                편집하기 →
              </Link>
            </p>
          )}
        </div>
      </div>

      {/* ── 하위 카테고리 탭 ── */}
      {children.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {children.map(c => (
            <Link
              key={c.id} href={`/category/${c.slug}`}
              className="px-3 py-1.5 text-sm font-medium rounded-full bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
            >
              {c.name}
            </Link>
          ))}
        </div>
      )}

      {/* ── 문서 목록 ── */}
      <div className="flex items-center gap-2.5 mb-4">
        <span className="w-1 h-5 bg-indigo-500 rounded-full" />
        <h2 className="text-base font-black text-slate-800">문서 목록</h2>
        <span className="text-sm text-slate-400">{articles.length}개</span>
      </div>

      {articles.length === 0 ? (
        <p className="text-sm text-slate-400 py-12 text-center">아직 작성된 문서가 없습니다.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {articles.map(a => (
            <ArticleCard key={`${a.id}-${a.category}`} article={a} />
          ))}
        </div>
      )}
    </div>
  );
}

function ErrorView({ msg }: { msg: string }) {
  return (
    <div className="max-w-3xl mx-auto py-16">
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-sm text-red-700">
        <p className="font-semibold mb-2">페이지를 불러올 수 없습니다</p>
        <p className="font-mono text-xs bg-red-100 px-2 py-1 rounded">{msg}</p>
      </div>
    </div>
  );
}
