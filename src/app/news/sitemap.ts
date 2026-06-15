import { MetadataRoute } from 'next';
import sql from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const BASE = 'https://www.aiinsightnote.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    // thin content(300자 미만) 페이지는 noindex이므로 sitemap에도 제외
    // GREATEST로 ko/en 컬럼 중 가장 긴 것 기준으로 판단 (isThinContent 로직과 동일)
    const items = await sql<{ slug: string; date: string }[]>`
      SELECT slug, date FROM news
      WHERE (published IS NULL OR published = TRUE)
        AND GREATEST(
          LENGTH(COALESCE(markdown_content, '')),
          LENGTH(COALESCE(content, '')),
          LENGTH(COALESCE(markdown_content_en, '')),
          LENGTH(COALESCE(content_en, ''))
        ) >= 300
      ORDER BY date DESC
    `;

    return items.map((n) => ({
      url: `${BASE}/news/${n.slug}`,
      lastModified: new Date(n.date),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));
  } catch {
    return [];
  }
}
