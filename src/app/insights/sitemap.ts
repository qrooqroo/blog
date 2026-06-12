import { MetadataRoute } from 'next';
import sql from '@/lib/supabase';

export const revalidate = 3600;

const BASE = 'https://www.aiinsightnote.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const items = await sql<{ slug: string; date: string }[]>`
    SELECT slug, date FROM insights
    WHERE (published IS NULL OR published = TRUE)
    ORDER BY date DESC
  `;

  return items.map((i) => ({
    url: `${BASE}/insights/${i.slug}`,
    lastModified: new Date(i.date),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));
}
