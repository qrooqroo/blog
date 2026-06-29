import { MetadataRoute } from 'next';
import sql from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const BASE = 'https://www.aiinsightnote.com';

const staticRoutes: MetadataRoute.Sitemap = [
  { url: BASE, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
  { url: `${BASE}/compare`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
  { url: `${BASE}/insights`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
  { url: `${BASE}/papers`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
  { url: `${BASE}/categories`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
  { url: `${BASE}/about`, lastModified: new Date('2026-06-15'), changeFrequency: 'monthly', priority: 0.5 },
  { url: `${BASE}/privacy`, lastModified: new Date('2026-06-15'), changeFrequency: 'monthly', priority: 0.4 },
];

const QUERY_TIMEOUT = 8000;

// 색인 대상은 가치 콘텐츠(인사이트·논문)로 한정한다.
// 자동 양산 뉴스·위키는 폐지(홈 리다이렉트), 개별 카테고리 페이지도 noindex이므로 sitemap에서 제외한다.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('sitemap query timeout')), QUERY_TIMEOUT)
    );

    const [insights, papers] = await Promise.race([
      Promise.all([
        sql<{ slug: string; date: string }[]>`
          SELECT slug, date FROM insights WHERE (published IS NULL OR published = TRUE) ORDER BY date DESC
        `,
        sql<{ slug: string; date: string }[]>`
          SELECT slug, date FROM papers WHERE (published IS NULL OR published = TRUE) ORDER BY date DESC
        `,
      ]),
      timeoutPromise,
    ]);

    return [
      ...staticRoutes,
      ...insights.map((i) => ({ url: `${BASE}/insights/${i.slug}`, lastModified: new Date(i.date), changeFrequency: 'monthly' as const, priority: 0.7 })),
      ...papers.map((p) => ({ url: `${BASE}/papers/${p.slug}`, lastModified: new Date(p.date), changeFrequency: 'monthly' as const, priority: 0.6 })),
    ];
  } catch {
    return staticRoutes;
  }
}
