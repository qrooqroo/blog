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
  const { title, title_ko: inputKo, title_en: inputEn, category, excerpt, content, markdown_content, image, is_internal } = await req.json();

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
    // 사용자가 직접 입력한 값 우선, 없으면 제목에서 자동 파싱
    let title_ko = inputKo ?? null;
    let title_en = inputEn ?? null;
    if (!title_ko || !title_en) {
      const fromTitle = parseTitleParts(title);
      // 순수 영문 제목(한글 없음)은 추출 불필요 — 잘못된 본문 파싱 방지
    const fromContent = (!fromTitle.en && markdown_content && /[가-힣]/.test(title))
        ? extractTitleEnFromContent(title, markdown_content)
        : { ko: null, en: null };
      title_ko = title_ko ?? fromTitle.ko ?? fromContent.ko ?? null;
      title_en = title_en ?? fromTitle.en ?? fromContent.en ?? null;
    }
    updateData = { title, title_ko, title_en, category_id: categoryId, excerpt, content, markdown_content, ...(image ? { image } : {}), ...(typeof is_internal === 'boolean' ? { is_internal } : {}) };
  } else {
    // news 테이블: 기존 category 텍스트 사용
    updateData = { title, category, excerpt, content, markdown_content, ...(image ? { image } : {}) };
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

export async function PATCH(req: NextRequest, { params }: Props) {
  const { id } = await params;
  const body = await req.json();

  const patch: Record<string, unknown> = {};
  if (typeof body.published === 'boolean') patch.published = body.published;
  if (typeof body.is_internal === 'boolean') patch.is_internal = body.is_internal;

  if (Object.keys(patch).length > 0) {
    const { error } = await supabase
      .from('documents')
      .update(patch)
      .eq('id', Number(id));
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 });
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
