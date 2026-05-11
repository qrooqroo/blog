import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  // categories 테이블: * 로 조회해서 parent_id 컬럼 유무에 상관없이 동작
  const catRes = await supabase
    .from('categories')
    .select('*')
    .order('name');

  if (catRes.error) {
    return NextResponse.json({ error: catRes.error.message }, { status: 500 });
  }

  // documents / news 테이블에서 카테고리별 글 수 집계 (테이블 없으면 0으로 처리)
  // documents는 뷰를 통해 category 이름 조회, news는 직접 조회
  const [artRes, newsRes] = await Promise.allSettled([
    supabase.from('documents_with_category').select('category'),
    supabase.from('news').select('category'),
  ]);

  const countMap: Record<string, number> = {};
  const artRows  = artRes.status  === 'fulfilled' ? (artRes.value.data  ?? []) : [];
  const newsRows = newsRes.status === 'fulfilled' ? (newsRes.value.data ?? []) : [];
  for (const a of [...artRows, ...newsRows]) {
    countMap[a.category] = (countMap[a.category] ?? 0) + 1;
  }

  const categories = (catRes.data ?? []).map((c: Record<string, unknown>) => ({
    id:        c.id        as number,
    name:      c.name      as string,
    parent_id: (c.parent_id as number | null) ?? null,
    count:     countMap[c.name as string] ?? 0,
  }));

  return NextResponse.json({ categories });
}

export async function POST(req: NextRequest) {
  const { name, parent_id } = await req.json();
  if (!name?.trim()) {
    return NextResponse.json({ error: '카테고리 이름을 입력해주세요.' }, { status: 400 });
  }

  const { error } = await supabase
    .from('categories')
    .insert({ name: name.trim(), parent_id: parent_id ?? null });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
