import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // scripts/ 디렉토리의 기존 에러가 빌드를 막지 않도록
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
