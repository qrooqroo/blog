import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { tableFor } from '@/lib/table-utils';
import { parseTitleParts } from '@/lib/title-parser';
import { extractTitleEnFromContent } from '@/lib/title-extractor';

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

/** 카테고리 이름 → ID 조회 */
async function getCategoryId(name: string): Promise<number | null> {
  const { data } = await supabase
    .from('categories')
    .select('id')
    .eq('name', name)
    .single();
  return data?.id ?? null;
}

interface ArticlePayload {
  title: string;
  slug: string;
  category: string;
  excerpt?: string;
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

  const table = tableFor(category);
  const image = DEFAULT_IMAGES[category] ?? DEFAULT_IMAGES['IT'];

  // documents 테이블에 넣는 경우 category_id 사용, news 테이블은 기존 category 텍스트 사용
  const isDocuments = table === 'documents';
  // 카테고리를 찾지 못해도 null 로 저장 (선택 사항)
  const categoryId  = isDocuments && category ? await getCategoryId(category) : null;

  // id 컬럼에 auto-increment 기본값이 없으므로 max(id) + 1 직접 계산
  const { data: maxRow } = await supabase
    .from(table)
    .select('id')
    .order('id', { ascending: false })
    .limit(1)
    .single();
  const nextId = ((maxRow?.id as number) ?? 0) + 1;

  const fromTitle = parseTitleParts(title);
  // 순수 영문 제목(한글 없음)은 추출 불필요 — 잘못된 본문 파싱 방지
  const fromContent = (!fromTitle.en && markdown_content && /[가-힣]/.test(title))
    ? extractTitleEnFromContent(title, markdown_content)
    : { ko: null, en: null };
  const title_ko = fromTitle.ko ?? fromContent.ko ?? null;
  const title_en = fromTitle.en ?? fromContent.en ?? null;

  const insertData = isDocuments
    ? { id: nextId, title, title_ko, title_en, slug, category_id: categoryId, excerpt: excerpt ?? '', content, markdown_content, date, image, published: false }
    : { id: nextId, title, slug, category, excerpt: excerpt ?? '', content, markdown_content, date, image };

  const { data, error } = await supabase
    .from(table)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .insert(insertData as any)
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
