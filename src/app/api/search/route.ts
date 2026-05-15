import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import { mergeTitleParts } from '@/lib/articles';
import { Article } from '@/types';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim() ?? '';
  if (q.length < 2) return NextResponse.json({ results: [] });

  const pattern = `%${q}%`;

  const [docsRes, newsRes] = await Promise.all([
    supabase
      .from('documents_with_category')
      .select('id, title, slug, category, image, date')
      .or(`title.ilike.${pattern},content.ilike.${pattern}`)
      .order('date', { ascending: false })
      .limit(8),
    supabase
      .from('news')
      .select('id, title, slug, category, image, date')
      .or(`title.ilike.${pattern},content.ilike.${pattern}`)
      .order('date', { ascending: false })
      .limit(4),
  ]);

  const docs = await mergeTitleParts((docsRes.data ?? []) as Article[]);
  const results = [
    ...docs,
    ...(newsRes.data ?? []),
  ].slice(0, 10);

  return NextResponse.json({ results });
}
