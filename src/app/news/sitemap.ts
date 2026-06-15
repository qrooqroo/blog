import { MetadataRoute } from 'next';
import sql from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

const BASE = 'https://www.aiinsightnote.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // thin content(300자 미만) 페이지는 noindex이므로 sitemap에도 제외
  const items = await sql<{ slug: string; date: string }[]>`
    SELECT slug, date FROM news
    WHERE (published IS NULL OR published = TRUE)
      AND LENGTH(COALESCE(markdown_content, content, '')) >= 300
    ORDER BY date DESC
  `;

  return items.map((n) => ({
    url: `${BASE}/news/${n.slug}`,
    lastModified: new Date(n.date),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));
}
