export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import ArticleCard from '@/components/ArticleCard';
import { Article } from '@/types';
import { mergeTitleParts } from '@/lib/articles';

interface Props {
  params: Promise<{ id: string }>;
}

type Cat = { id: number; name: string; parent_id: number | null };

function collectDescendants(rootId: number, allCats: Cat[]): number[] {
  const children = allCats.filter(c => c.parent_id === rootId);
  return children.flatMap(c => [c.id, ...collectDescendants(c.id, allCats)]);
}

export default async function CategoryPage({ params }: Props) {
  const { id } = await params;
  const categoryId = Number(id);

  if (!categoryId || isNaN(categoryId)) {
    return <ErrorView msg={`잘못된 카테고리 ID: "${id}"`} />;
  }

  // 모든 카테고리 한 번에 조회
  const { data: allCats, error: allCatsErr } = await supabase
    .from('categories')
    .select('id, name, parent_id');

  if (allCatsErr || !allCats) {
    return <ErrorView msg={`카테고리 조회 실패: ${allCatsErr?.message}`} />;
  }

  const cat = allCats.find(c => c.id === categoryId);
  if (!cat) return <ErrorView msg={`카테고리 ID ${categoryId}를 찾을 수 없습니다.`} />;

  const parent = cat.parent_id ? (allCats.find(c => c.id === cat.parent_id) ?? null) : null;
  const children = allCats.filter(c => c.parent_id === categoryId);

  // 현재 + 모든 하위 카테고리 ID·이름 수집
  const descendantIds = collectDescendants(categoryId, allCats);
  const allIds = [categoryId, ...descendantIds];
  const allNames = allIds
    .map(i => allCats.find(c => c.id === i)?.name)
    .filter(Boolean) as string[];

  // documents 조회 — 3단계 폴백
  let docs: Article[] = [];
  const viewRes = await supabase
    .from('documents_with_category')
    .select('*')
    .in('category_id', allIds)
    .order('date', { ascending: false })
    .order('id', { ascending: false });

  if (!viewRes.error) {
    docs = await mergeTitleParts((viewRes.data ?? []) as Article[]);
  } else {
    const idRes = await supabase
      .from('documents')
      .select('*')
      .in('category_id', allIds)
      .order('date', { ascending: false })
      .order('id', { ascending: false });

    if (!idRes.error) {
      docs = (idRes.data ?? []) as Article[];
    } else {
      const textRes = await supabase
        .from('documents')
        .select('*')
        .in('category', allNames)
        .order('date', { ascending: false })
        .order('id', { ascending: false });
      docs = (textRes.data ?? []) as Article[];
    }
  }

  // news 조회
  const newsRes = await supabase
    .from('news')
    .select('*')
    .in('category', allNames)
    .order('date', { ascending: false })
    .order('id', { ascending: false });
  const news: Article[] = newsRes.error ? [] : (newsRes.data ?? []) as Article[];

  const articles = [...docs, ...news]
    .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);

  return (
    <div className="max-w-3xl mx-auto">
      <nav className="flex items-center gap-1.5 text-sm text-slate-400 mb-6 flex-wrap">
        <Link href="/" className="hover:text-indigo-500 transition-colors">홈</Link>
        <span>›</span>
        {parent && (
          <>
            <Link href={`/category/${parent.id}`} className="hover:text-indigo-500 transition-colors">
              {parent.name}
            </Link>
            <span>›</span>
          </>
        )}
        <span className="text-slate-600">{cat.name}</span>
      </nav>

      <div className="flex items-center gap-3 mb-5">
        <span className="w-1 h-7 bg-indigo-500 rounded-full" />
        <div>
          <h1 className="text-2xl font-black text-slate-900">{cat.name}</h1>
          <p className="text-sm text-slate-400 mt-0.5">총 {articles.length}개의 글</p>
        </div>
      </div>

      {/* 하위 카테고리 탭 */}
      {children.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {children.map(c => (
            <Link
              key={c.id}
              href={`/category/${c.id}`}
              className="px-3 py-1.5 text-sm font-medium rounded-full bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
            >
              {c.name}
            </Link>
          ))}
        </div>
      )}

      {articles.length === 0 ? (
        <p className="text-sm text-slate-400 py-16 text-center">아직 작성된 글이 없습니다.</p>
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
