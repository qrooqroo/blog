import { supabase } from './supabase';
import { Article, Category } from '@/types';
export { formatDate } from './format';

// documents_with_category 뷰는 title_ko / title_en 컬럼을 포함하지 않으므로
// 뷰로 조회한 결과에 documents 테이블의 해당 컬럼을 병합한다.
export async function mergeTitleParts(articles: Article[]): Promise<Article[]> {
  if (!articles.length) return articles;
  const ids = articles.map(a => a.id);
  const { data } = await supabase
    .from('documents')
    .select('id, title_ko, title_en')
    .in('id', ids);
  if (!data) return articles;
  const map = new Map(data.map(r => [r.id as number, r as { id: number; title_ko: string | null; title_en: string | null }]));
  return articles.map(a => {
    const extra = map.get(a.id);
    if (!extra) return a;
    return {
      ...a,
      title_ko: a.title_ko ?? extra.title_ko,
      title_en: a.title_en ?? extra.title_en,
    };
  });
}

// 3단계 폴백:
// 1) documents_with_category 뷰  (마이그레이션 완료)
// 2) documents + category_id     (뷰 미생성, category 컬럼 삭제)
// 3) documents + category 텍스트 (마이그레이션 전)
async function safeQuery(
  view:  () => Promise<{ data: unknown; error: unknown }>,
  byId:  () => Promise<{ data: unknown; error: unknown }>,
  byTxt: () => Promise<{ data: unknown; error: unknown }>
): Promise<Article[]> {
  const r1 = await view();
  if (!r1.error) {
    const articles = ((r1.data as unknown[]) ?? []) as Article[];
    return mergeTitleParts(articles);
  }

  const r2 = await byId();
  if (!r2.error) return ((r2.data as unknown[]) ?? []) as Article[];

  const r3 = await byTxt();
  return ((r3.data as unknown[]) ?? []) as Article[];
}

export async function getAllArticles(): Promise<Article[]> {
  return safeQuery(
    async () => supabase.from('documents_with_category').select('*').order('date', { ascending: false }).order('id', { ascending: false }),
    async () => supabase.from('documents').select('*').order('date', { ascending: false }).order('id', { ascending: false }),
    async () => supabase.from('documents').select('*').order('date', { ascending: false }).order('id', { ascending: false })
  );
}

export async function getArticlesByCategory(category: Category): Promise<Article[]> {
  return safeQuery(
    async () => supabase.from('documents_with_category').select('*').eq('category', category).order('date', { ascending: false }).order('id', { ascending: false }),
    async () => supabase.from('documents').select('*').eq('category', category).order('date', { ascending: false }).order('id', { ascending: false }),
    async () => supabase.from('documents').select('*').eq('category', category).order('date', { ascending: false }).order('id', { ascending: false })
  );
}

export async function getArticleById(id: number): Promise<Article | undefined> {
  const rows = await safeQuery(
    async () => supabase.from('documents_with_category').select('*').eq('id', id).limit(1),
    async () => supabase.from('documents').select('*').eq('id', id).limit(1),
    async () => supabase.from('documents').select('*').eq('id', id).limit(1)
  );
  return rows[0];
}

export async function getArticleBySlug(slug: string): Promise<Article | undefined> {
  const decoded = decodeURIComponent(slug);
  const rows = await safeQuery(
    async () => supabase.from('documents_with_category').select('*').eq('slug', decoded).limit(1),
    async () => supabase.from('documents').select('*').eq('slug', decoded).limit(1),
    async () => supabase.from('documents').select('*').eq('slug', decoded).limit(1)
  );
  return rows[0];
}

export async function getFeaturedArticle(): Promise<Article | null> {
  const rows = await safeQuery(
    async () => supabase.from('documents_with_category').select('*').order('date', { ascending: false }).order('id', { ascending: false }).limit(1),
    async () => supabase.from('documents').select('*').order('date', { ascending: false }).order('id', { ascending: false }).limit(1),
    async () => supabase.from('documents').select('*').order('date', { ascending: false }).order('id', { ascending: false }).limit(1)
  );
  return rows[0] ?? null;
}

export async function getRecentArticles(count = 9): Promise<Article[]> {
  return safeQuery(
    async () => supabase.from('documents_with_category').select('*').order('date', { ascending: false }).order('id', { ascending: false }).limit(count),
    async () => supabase.from('documents').select('*').order('date', { ascending: false }).order('id', { ascending: false }).limit(count),
    async () => supabase.from('documents').select('*').order('date', { ascending: false }).order('id', { ascending: false }).limit(count)
  );
}

