import { supabase } from './supabase';
import { Article } from '@/types';
export { isNewsCategory, tableFor } from './table-utils';

export async function getAllNews(): Promise<Article[]> {
  const { data } = await supabase
    .from('news')
    .select('*')
    .order('date', { ascending: false })
    .order('id', { ascending: false });
  return (data ?? []) as Article[];
}

export async function getNewsByCategory(category: string): Promise<Article[]> {
  const { data } = await supabase
    .from('news')
    .select('*')
    .eq('category', category)
    .order('date', { ascending: false })
    .order('id', { ascending: false });
  return (data ?? []) as Article[];
}

export async function getNewsBySlug(slug: string): Promise<Article | undefined> {
  const decoded = decodeURIComponent(slug);
  const { data } = await supabase
    .from('news')
    .select('*')
    .eq('slug', decoded)
    .limit(1);
  return data?.[0] as Article | undefined;
}

export async function getNewsById(id: number): Promise<Article | undefined> {
  const { data } = await supabase
    .from('news')
    .select('*')
    .eq('id', id)
    .limit(1);
  return data?.[0] as Article | undefined;
}

export async function getRecentNews(count = 9): Promise<Article[]> {
  const { data } = await supabase
    .from('news')
    .select('*')
    .order('date', { ascending: false })
    .order('id', { ascending: false })
    .limit(count);
  return (data ?? []) as Article[];
}
