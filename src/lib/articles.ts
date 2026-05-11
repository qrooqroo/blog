import { supabase } from './supabase';
import { Article, Category } from '@/types';

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
  if (!r1.error) return ((r1.data as unknown[]) ?? []) as Article[];

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

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}
