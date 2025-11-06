import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export로 변경 (CDN 호스팅용)
  output: 'export',
  
  // 이미지 최적화 설정 (외부 이미지 허용)
  images: {
    unoptimized: true
  },
  
  // Static export 시 필요한 설정
  trailingSlash: true,
  
  // 베이스 경로 설정 (필요시)
  // basePath: '',
};

export default nextConfig;
