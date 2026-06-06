import { MetadataRoute } from 'next';
import sql from '@/lib/supabase';

const BASE = 'https://aiinsightnote.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, categories, newsItems, insights, papers] = await Promise.all([
    sql<{ slug: string; date: string }[]>`
      SELECT slug, date FROM documents WHERE published = true ORDER BY date DESC
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

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE}/news`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE}/insights`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE}/papers`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE}/categories`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ];

  const newsRoutes: MetadataRoute.Sitemap = newsItems.map((n) => ({
    url: `${BASE}/news/${n.slug}`,
    lastModified: new Date(n.date),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const insightRoutes: MetadataRoute.Sitemap = insights.map((i) => ({
    url: `${BASE}/insights/${i.slug}`,
    lastModified: new Date(i.date),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const paperRoutes: MetadataRoute.Sitemap = papers.map((p) => ({
    url: `${BASE}/papers/${p.slug}`,
    lastModified: new Date(p.date),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  const wikiRoutes: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${BASE}/wiki/${a.slug}`,
    lastModified: new Date(a.date),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${BASE}/category/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  }));

  return [...staticRoutes, ...newsRoutes, ...insightRoutes, ...paperRoutes, ...wikiRoutes, ...categoryRoutes];
}
