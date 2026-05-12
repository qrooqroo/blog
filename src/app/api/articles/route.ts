import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const page  = Math.max(1, Number(req.nextUrl.searchParams.get('page')  ?? '1'));
  const limit = Math.max(1, Number(req.nextUrl.searchParams.get('limit') ?? '9'));
  const from  = (page - 1) * limit;
  const to    = from + limit - 1;

  // documents_with_category 뷰 시도 → documents 테이블 폴백
  const viewRes = await supabase
    .from('documents_with_category')
    .select('*')
    .order('date', { ascending: false })
    .order('id',   { ascending: false })
    .range(from, to);

  if (!viewRes.error) {
    return NextResponse.json({ articles: viewRes.data ?? [] });
  }

  const tableRes = await supabase
    .from('documents')
    .select('*')
    .order('date', { ascending: false })
    .order('id',   { ascending: false })
    .range(from, to);

  return NextResponse.json({ articles: tableRes.data ?? [] });
}
