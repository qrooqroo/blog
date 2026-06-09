import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { mergeTitleParts } from '@/lib/articles';
import { Article } from '@/types';
import { isLocalHost } from '@/lib/image-utils';

export async function GET(req: NextRequest) {
  const page  = Math.max(1, Number(req.nextUrl.searchParams.get('page')  ?? '1'));
  const limit = Math.max(1, Number(req.nextUrl.searchParams.get('limit') ?? '9'));
  const from  = (page - 1) * limit;
  const to    = from + limit - 1;

  const host = req.headers.get('host') ?? '';
  const isLocal = isLocalHost(host);

  const buildQuery = (table: string) => {
    const q = supabase.from(table).select('*');
    if (!isLocal) q.imageOkOnly();
    q.publishedOnly();
    q.publicOnly();
    return q.order('date', { ascending: false }).order('id', { ascending: false }).range(from, to);
  };

  const viewRes = await buildQuery('documents_with_category');
  if (!viewRes.error) {
    const articles = await mergeTitleParts((viewRes.data ?? []) as Article[]);
    return NextResponse.json({ articles });
  }

  const tableRes = await buildQuery('documents');
  return NextResponse.json({ articles: tableRes.data ?? [] });
}
