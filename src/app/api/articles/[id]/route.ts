import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { parseTitleParts } from '@/lib/title-parser';
import { extractTitleEnFromContent } from '@/lib/title-extractor';

interface Props {
  params: Promise<{ id: string }>;
}

function getTable(req: NextRequest): 'documents' | 'news' {
  return req.nextUrl.searchParams.get('table') === 'news' ? 'news' : 'documents';
}

/** 카테고리 이름 → ID 조회 (documents 테이블 전용) */
async function getCategoryId(name: string): Promise<number | null> {
  const { data } = await supabase
    .from('categories')
    .select('id')
    .eq('name', name)
    .single();
  return data?.id ?? null;
}

export async function PUT(req: NextRequest, { params }: Props) {
  const { id } = await params;
  const table = getTable(req);
  const { title, category, excerpt, content, markdown_content } = await req.json();

  if (!title || !content) {
    return NextResponse.json({ error: '제목과 내용은 필수입니다.' }, { status: 400 });
  }

  let updateData: Record<string, unknown>;

  if (table === 'documents') {
    // documents 테이블: category_id 사용
    const categoryId = await getCategoryId(category);
    if (!categoryId) {
      return NextResponse.json({ error: `카테고리 '${category}'를 찾을 수 없습니다.` }, { status: 400 });
    }
    const fromTitle = parseTitleParts(title);
    // 제목 파싱으로 영문명을 못 찾으면 문서 내용에서 추출
    const fromContent = (!fromTitle.en && markdown_content)
      ? extractTitleEnFromContent(title, markdown_content)
      : { ko: null, en: null };
    const title_ko = fromTitle.ko ?? fromContent.ko ?? null;
    const title_en = fromTitle.en ?? fromContent.en ?? null;
    updateData = { title, title_ko, title_en, category_id: categoryId, excerpt, content, markdown_content };
  } else {
    // news 테이블: 기존 category 텍스트 사용
    updateData = { title, category, excerpt, content, markdown_content };
  }

  const { error } = await supabase
    .from(table)
    .update(updateData)
    .eq('id', Number(id));

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest, { params }: Props) {
  const { id } = await params;
  const table = getTable(req);

  const { error } = await supabase
    .from(table)
    .delete()
    .eq('id', Number(id));

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
