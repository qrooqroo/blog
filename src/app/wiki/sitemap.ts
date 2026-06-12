import { MetadataRoute } from 'next';
import sql from '@/lib/supabase';

export const revalidate = 86400;

const BASE = 'https://www.aiinsightnote.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const items = await sql<{ slug: string; date: string }[]>`
    SELECT slug, date FROM documents
    WHERE published = true AND (is_internal IS NULL OR is_internal = FALSE)
    ORDER BY date DESC
  `;

  return items.map((a) => ({
    url: `${BASE}/wiki/${a.slug}`,
    lastModified: new Date(a.date),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));
}
