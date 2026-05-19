import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { mergeTitleParts } from '@/lib/articles';
import { Article } from '@/types';

export async function GET(req: NextRequest) {
  const page  = Math.max(1, Number(req.nextUrl.searchParams.get('page')  ?? '1'));
  const limit = Math.max(1, Number(req.nextUrl.searchParams.get('limit') ?? '9'));
  const from  = (page - 1) * limit;
  const to    = from + limit - 1;

  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .draftOnly()
    .order('date', { ascending: true })
    .order('id', { ascending: true })
    .range(from, to);

  if (error) return NextResponse.json({ articles: [] });

  const articles = await mergeTitleParts((data ?? []) as Article[]);
  return NextResponse.json({ articles });
}
