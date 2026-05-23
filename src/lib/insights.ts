import { supabase } from './supabase';

export interface Insight {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  date: string;
  image: string;
  tags: string[];
  published: boolean | null;
}

export async function getAllInsights(): Promise<Insight[]> {
  const { data } = await supabase
    .from('insights')
    .select('*')
    .publishedOnly()
    .order('date', { ascending: false })
    .order('id', { ascending: false });
  return (data ?? []) as Insight[];
}

export async function getInsightBySlug(slug: string): Promise<Insight | undefined> {
  const decoded = decodeURIComponent(slug);
  const { data } = await supabase
    .from('insights')
    .select('*')
    .eq('slug', decoded)
    .limit(1);
  return data?.[0] as Insight | undefined;
}

export async function getRecentInsights(count = 6): Promise<Insight[]> {
  const { data } = await supabase
    .from('insights')
    .select('*')
    .publishedOnly()
    .order('date', { ascending: false })
    .order('id', { ascending: false })
    .limit(count);
  return (data ?? []) as Insight[];
}
