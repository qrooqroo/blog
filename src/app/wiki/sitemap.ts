import { MetadataRoute } from 'next';

// 위키(자동 생성 문서) 서비스 폐지 — 라우트는 홈으로 리다이렉트되고 sitemap에서도 제외한다.
export default function sitemap(): MetadataRoute.Sitemap {
  return [];
}
