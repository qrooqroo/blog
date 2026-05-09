import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface Props {
  params: Promise<{ id: string }>;
}

export async function PUT(req: NextRequest, { params }: Props) {
  const { id } = await params;
  const { title, category, excerpt, content, markdown_content } = await req.json();

  if (!title || !content) {
    return NextResponse.json({ error: '제목과 내용은 필수입니다.' }, { status: 400 });
  }

  const { error } = await supabase
    .from('articles')
    .update({ title, category, excerpt, content, markdown_content })
    .eq('id', Number(id));

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
