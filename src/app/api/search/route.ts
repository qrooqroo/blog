import { supabase } from '@/lib/supabase';
import sql from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import { mergeTitleParts } from '@/lib/articles';
import { Article } from '@/types';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim() ?? '';
  if (q.length < 2) return NextResponse.json({ results: [] });

  const pattern = `%${q}%`;

  // documents_with_category 뷰에 published 컬럼이 없으므로
  // documents 테이블과 JOIN해 발행된 문서만 검색한다.
  const [docsRaw, newsRes] = await Promise.all([
    sql<Article[]>`
      SELECT dwc.id, dwc.title, dwc.title_ko, dwc.title_en,
             dwc.slug, dwc.category, dwc.image, dwc.date
      FROM documents_with_category dwc
      JOIN documents d ON d.id = dwc.id
      WHERE (d.published IS NULL OR d.published = TRUE)
        AND (d.is_internal IS NULL OR d.is_internal = FALSE)
        AND (dwc.title ILIKE ${pattern} OR dwc.content ILIKE ${pattern})
      ORDER BY dwc.date DESC
      LIMIT 8
    `,
    supabase
      .from('news')
      .select('id, title, slug, category, image, date')
      .or(`title.ilike.${pattern},content.ilike.${pattern}`)
      .order('date', { ascending: false })
      .limit(4),
  ]);

  const docs = await mergeTitleParts(docsRaw);
  const results = [
    ...docs,
    ...(newsRes.data ?? []),
  ].slice(0, 10);

  return NextResponse.json({ results });
}
