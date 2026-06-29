import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    // 자동 양산 서비스(뉴스·위키) 폐지 — 해당 sitemap 참조 제거.
    // 색인 대상은 가치 콘텐츠(인사이트·논문)로 한정한다.
    sitemap: [
      'https://www.aiinsightnote.com/sitemap.xml',
      'https://www.aiinsightnote.com/insights/sitemap.xml',
      'https://www.aiinsightnote.com/papers/sitemap.xml',
    ],
  };
}
