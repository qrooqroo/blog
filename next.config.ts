import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['172.17.235.232', '10.255.255.254', 'localhost'],
  reactStrictMode: false,
  transpilePackages: ['@dimforge/rapier3d-compat', '@react-three/rapier'],
  turbopack: {
    root: __dirname,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async redirects() {
    return [
      { source: '/ko', destination: '/', permanent: true },
      { source: '/ko/:path*', destination: '/:path*', permanent: true },
      { source: '/en', destination: '/', permanent: true },
      { source: '/en/:path*', destination: '/:path*', permanent: true },
      // 자동 양산 서비스(뉴스·위키) 폐지 — 라우트를 홈으로 영구 리다이렉트해 접근 차단.
      // 가치 콘텐츠(인사이트·논문)와 신규 비교 허브 중심으로 사이트를 재편한다.
      { source: '/news', destination: '/', permanent: true },
      { source: '/news/:path*', destination: '/', permanent: true },
      { source: '/wiki', destination: '/', permanent: true },
      { source: '/wiki/:path*', destination: '/', permanent: true },
    ];
  },
};

export default nextConfig;
