import { MetadataRoute } from 'next';
import sql from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

const BASE = 'https://www.aiinsightnote.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const items = await sql<{ slug: string; date: string }[]>`
    SELECT slug, date FROM news
    WHERE (published IS NULL OR published = TRUE)
    ORDER BY date DESC
  `;

  return items.map((n) => ({
    url: `${BASE}/news/${n.slug}`,
    lastModified: new Date(n.date),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));
}
