import { cache } from 'react';
import { supabase } from './supabase';

export interface Paper {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  date: string;
  tags: string[];
  published: boolean | null;
  paper_title: string;
  authors: string;
  institution: string;
  arxiv_id: string;
  paper_date: string | null;
  analyst: string;
  title_en: string | null;
  excerpt_en: string | null;
  content_en: string | null;
}

export async function getAllPapers(): Promise<Paper[]> {
  const { data } = await supabase
    .from('papers')
    .select('*')
    .publishedOnly()
    .order('date', { ascending: false })
    .order('id', { ascending: false });
  return (data ?? []) as Paper[];
}

export const getPaperBySlug = cache(async (slug: string): Promise<Paper | undefined> => {
  const decoded = decodeURIComponent(slug);
  const { data } = await supabase
    .from('papers')
    .select('*')
    .eq('slug', decoded)
    .limit(1);
  return data?.[0] as Paper | undefined;
});

export async function getRecentPapers(count = 3): Promise<Paper[]> {
  const { data } = await supabase
    .from('papers')
    .select('*')
    .publishedOnly()
    .order('date', { ascending: false })
    .order('id', { ascending: false })
    .limit(count);
  return (data ?? []) as Paper[];
}
