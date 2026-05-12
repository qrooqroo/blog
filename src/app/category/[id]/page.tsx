export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import ArticleCard from '@/components/ArticleCard';
import { Article } from '@/types';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CategoryPage({ params }: Props) {
  const { id } = await params;
  const categoryId = Number(id);

  if (!categoryId || isNaN(categoryId)) {
    return <ErrorView msg={`잘못된 카테고리 ID: "${id}"`} />;
  }

  // 카테고리 조회
  const catRes = await supabase
    .from('categories')
    .select('id, name, parent_id')
    .eq('id', categoryId)
    .single();

  if (catRes.error || !catRes.data) {
    return <ErrorView msg={`카테고리 ID ${categoryId} 조회 실패: ${catRes.error?.message ?? '데이터 없음'}`} />;
  }

  const cat = catRes.data as { id: number; name: string; parent_id: number | null };

  // 상위 카테고리 조회
  let parent: { id: number; name: string } | null = null;
  if (cat.parent_id) {
    const parentRes = await supabase
      .from('categories')
      .select('id, name')
      .eq('id', cat.parent_id)
      .single();
    if (!parentRes.error && parentRes.data) parent = parentRes.data;
  }

  // documents 조회 — 3단계 폴백
  // 1) documents_with_category 뷰 (마이그레이션 완료)
  // 2) documents 테이블 + category_id (category 컬럼 삭제, 뷰 미생성)
  // 3) documents 테이블 + category 텍스트 (마이그레이션 전)
  let docs: Article[] = [];
  const viewRes = await supabase
    .from('documents_with_category')
    .select('*')
    .eq('category_id', cat.id)
    .order('date', { ascending: false })
    .order('id', { ascending: false });

  if (!viewRes.error) {
    docs = (viewRes.data ?? []) as Article[];
  } else {
    const idRes = await supabase
      .from('documents')
      .select('*')
      .eq('category_id', cat.id)
      .order('date', { ascending: false })
      .order('id', { ascending: false });

    if (!idRes.error) {
      docs = (idRes.data ?? []) as Article[];
    } else {
      const textRes = await supabase
        .from('documents')
        .select('*')
        .eq('category', cat.name)
        .order('date', { ascending: false })
        .order('id', { ascending: false });
      docs = (textRes.data ?? []) as Article[];
    }
  }

  // news 조회
  const newsRes = await supabase
    .from('news')
    .select('*')
    .eq('category', cat.name)
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

      <div className="flex items-center gap-3 mb-8">
        <span className="w-1 h-7 bg-indigo-500 rounded-full" />
        <div>
          <h1 className="text-2xl font-black text-slate-900">{cat.name}</h1>
          <p className="text-sm text-slate-400 mt-0.5">총 {articles.length}개의 글</p>
        </div>
      </div>

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
