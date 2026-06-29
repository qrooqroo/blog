import { MetadataRoute } from 'next';

// 자동 생성 뉴스는 전면 noindex(저가치 콘텐츠) → sitemap에서 제외해 빈 목록 반환.
// robots.ts에서도 이 sitemap 참조를 제거함.
export default function sitemap(): MetadataRoute.Sitemap {
  return [];
}
