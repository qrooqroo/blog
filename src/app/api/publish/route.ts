import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const DEFAULT_IMAGES: Record<string, string> = {
  'AI 대화':        'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&q=80&fit=crop',
  '논문 분석':      'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80&fit=crop',
  '스타트업 AI 적용': 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80&fit=crop',
  '경제':   'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80&fit=crop',
  '정치':   'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&q=80&fit=crop',
  '사회':   'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80&fit=crop',
  '건강':   'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80&fit=crop',
  '스포츠': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80&fit=crop',
  'IT':     'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80&fit=crop',
  '문화':   'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80&fit=crop',
};

interface ArticlePayload {
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content: string;
  markdown_content: string;
  date: string;
}

export async function POST(req: NextRequest) {
  const payload: ArticlePayload = await req.json();
  const { title, slug, category, excerpt, content, markdown_content, date } = payload;

  if (!title || !slug || !content) {
    return NextResponse.json({ error: '제목, slug, 내용은 필수입니다.' }, { status: 400 });
  }

  const image = DEFAULT_IMAGES[category] ?? DEFAULT_IMAGES['IT'];

  const { data, error } = await supabase
    .from('articles')
    .insert({ title, slug, category, excerpt, content, markdown_content, date, image })
    .select('id, slug')
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: `slug '${slug}'가 이미 존재합니다. 다른 제목을 사용해주세요.` }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, id: data.id, slug: data.slug });
}
