import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: [
      'https://www.aiinsightnote.com/sitemap.xml',
      'https://www.aiinsightnote.com/news/sitemap.xml',
      'https://www.aiinsightnote.com/insights/sitemap.xml',
      'https://www.aiinsightnote.com/papers/sitemap.xml',
      'https://www.aiinsightnote.com/wiki/sitemap.xml',
    ],
  };
}
