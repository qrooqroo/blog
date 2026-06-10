import { MetadataRoute } from 'next';
import sql from '@/lib/supabase';

export const revalidate = 3600;

const BASE = 'https://www.aiinsightnote.com';

const staticRoutes: MetadataRoute.Sitemap = [
  { url: BASE, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
  { url: `${BASE}/news`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
  { url: `${BASE}/insights`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
  { url: `${BASE}/papers`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
  { url: `${BASE}/categories`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const [articles, categories, newsItems, insights, papers] = await Promise.all([
      sql<{ slug: string; date: string }[]>`
        SELECT slug, date FROM documents WHERE published = true AND (is_internal IS NULL OR is_internal = FALSE) ORDER BY date DESC
      `,
      sql<{ slug: string }[]>`
        SELECT slug FROM categories ORDER BY slug
      `,
      sql<{ slug: string; date: string }[]>`
        SELECT slug, date FROM news WHERE (published IS NULL OR published = TRUE) ORDER BY date DESC
      `,
      sql<{ slug: string; date: string }[]>`
        SELECT slug, date FROM insights WHERE (published IS NULL OR published = TRUE) ORDER BY date DESC
      `,
      sql<{ slug: string; date: string }[]>`
        SELECT slug, date FROM papers WHERE (published IS NULL OR published = TRUE) ORDER BY date DESC
      `,
    ]);

    return [
      ...staticRoutes,
      ...newsItems.map((n) => ({ url: `${BASE}/news/${n.slug}`, lastModified: new Date(n.date), changeFrequency: 'monthly' as const, priority: 0.7 })),
      ...insights.map((i) => ({ url: `${BASE}/insights/${i.slug}`, lastModified: new Date(i.date), changeFrequency: 'monthly' as const, priority: 0.7 })),
      ...papers.map((p) => ({ url: `${BASE}/papers/${p.slug}`, lastModified: new Date(p.date), changeFrequency: 'monthly' as const, priority: 0.6 })),
      ...articles.map((a) => ({ url: `${BASE}/wiki/${a.slug}`, lastModified: new Date(a.date), changeFrequency: 'monthly' as const, priority: 0.6 })),
      ...categories.map((c) => ({ url: `${BASE}/category/${c.slug}`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.5 })),
    ];
  } catch {
    return staticRoutes;
  }
}
