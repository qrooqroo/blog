import { MetadataRoute } from 'next';
import sql from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 86400;

const BASE = 'https://www.aiinsightnote.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const items = await sql<{ slug: string; date: string }[]>`
    SELECT slug, date FROM papers
    WHERE (published IS NULL OR published = TRUE)
    ORDER BY date DESC
  `;

  return items.map((p) => ({
    url: `${BASE}/papers/${p.slug}`,
    lastModified: new Date(p.date),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));
}
