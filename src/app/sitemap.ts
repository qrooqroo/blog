import { MetadataRoute } from 'next';
import sql from '@/lib/supabase';

const BASE = 'https://www.aiinsightnote.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 발행된 위키 문서
  const articles = await sql<{ slug: string; date: string }[]>`
    SELECT slug, date FROM documents WHERE published = true ORDER BY date DESC
  `;

  // 카테고리 슬러그
  const categories = await sql<{ slug: string }[]>`
    SELECT slug FROM categories ORDER BY slug
  `;

  // 고정 페이지
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE}/categories`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE}/news`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
  ];

  // 위키 문서 페이지
  const articleRoutes: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${BASE}/wiki/${a.slug}`,
    lastModified: new Date(a.date),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // 카테고리 페이지
  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${BASE}/category/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  }));

  return [...staticRoutes, ...articleRoutes, ...categoryRoutes];
}
