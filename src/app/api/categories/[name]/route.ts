import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface Props {
  params: Promise<{ name: string }>;
}

// param이 숫자면 ID, 아니면 name으로 조회
function isNumeric(s: string) { return /^\d+$/.test(s); }

// GET: 카테고리 위키 조회 (ID로 접근)
export async function GET(_req: NextRequest, { params }: Props) {
  const { name: encoded } = await params;
  const raw = decodeURIComponent(encoded);
  const query = isNumeric(raw)
    ? supabase.from('categories').select('id,name,parent_id,excerpt,markdown_content,image').eq('id', Number(raw)).single()
    : supabase.from('categories').select('id,name,parent_id,excerpt,markdown_content,image').eq('name', raw).single();
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json({ category: data });
}

// PATCH: 카테고리 위키 내용 수정 (ID로 접근)
export async function PATCH(req: NextRequest, { params }: Props) {
  const { name: encoded } = await params;
  const raw = decodeURIComponent(encoded);
  const { excerpt, markdown_content, image } = await req.json();
  const query = isNumeric(raw)
    ? supabase.from('categories').update({ excerpt, markdown_content, image }).eq('id', Number(raw))
    : supabase.from('categories').update({ excerpt, markdown_content, image }).eq('name', raw);
  const { error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

// 카테고리 이름 변경
// documents 테이블은 category_id(FK)로 참조하므로 별도 업데이트 불필요
// news 테이블은 아직 category 텍스트를 사용하므로 업데이트 필요
export async function PUT(req: NextRequest, { params }: Props) {
  const { name: encoded } = await params;
  const oldName = decodeURIComponent(encoded);
  const { newName, parent_id } = await req.json();

  if (!newName?.trim()) {
    return NextResponse.json({ error: '새 이름을 입력해주세요.' }, { status: 400 });
  }

  const [catRes, newsRes] = await Promise.all([
    supabase.from('categories').update({ name: newName.trim(), parent_id: parent_id ?? null }).eq('name', oldName),
    supabase.from('news').update({ category: newName.trim() }).eq('category', oldName),
  ]);

  if (catRes.error) {
    return NextResponse.json({ error: catRes.error.message }, { status: 500 });
  }
  if (newsRes.error) {
    return NextResponse.json({ error: newsRes.error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

// 카테고리 삭제 (documents는 FK → ON DELETE 처리, news는 직접 이동)
export async function DELETE(req: NextRequest, { params }: Props) {
  const { name: encoded } = await params;
  const name = decodeURIComponent(encoded);
  const { targetCategory } = await req.json();

  if (targetCategory) {
    // news 테이블 이동
    const { error: newsErr } = await supabase
      .from('news')
      .update({ category: targetCategory })
      .eq('category', name);
    if (newsErr) {
      return NextResponse.json({ error: newsErr.message }, { status: 500 });
    }

    // documents 테이블: target 카테고리 ID 조회 후 업데이트
    const { data: targetCat } = await supabase
      .from('categories')
      .select('id')
      .eq('name', targetCategory)
      .single();

    if (targetCat?.id) {
      const { data: thisCat } = await supabase
        .from('categories')
        .select('id')
        .eq('name', name)
        .single();

      if (thisCat?.id) {
        const { error: docErr } = await supabase
          .from('documents')
          .update({ category_id: targetCat.id })
          .eq('category_id', thisCat.id);
        if (docErr) {
          return NextResponse.json({ error: docErr.message }, { status: 500 });
        }
      }
    }
  }

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('name', name);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
