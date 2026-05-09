import { supabase } from './supabase';
import { Article, Category } from '@/types';

export async function getAllArticles(): Promise<Article[]> {
  const { data } = await supabase
    .from('articles')
    .select('*')
    .order('date', { ascending: false })
    .order('id', { ascending: false });
  return (data ?? []) as Article[];
}

export async function getArticlesByCategory(category: Category): Promise<Article[]> {
  const { data } = await supabase
    .from('articles')
    .select('*')
    .eq('category', category)
    .order('date', { ascending: false })
    .order('id', { ascending: false });
  return (data ?? []) as Article[];
}

export async function getArticleBySlug(slug: string): Promise<Article | undefined> {
  const { data } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .single();
  return data ?? undefined;
}

export async function getFeaturedArticle(): Promise<Article | null> {
  const { data } = await supabase
    .from('articles')
    .select('*')
    .order('date', { ascending: false })
    .order('id', { ascending: false })
    .limit(1)
    .single();
  return data ?? null;
}

export async function getRecentArticles(count = 9): Promise<Article[]> {
  const { data } = await supabase
    .from('articles')
    .select('*')
    .order('date', { ascending: false })
    .order('id', { ascending: false })
    .limit(count);
  return (data ?? []) as Article[];
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}
