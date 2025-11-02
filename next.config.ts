import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Docker 배포를 위한 standalone 모드 활성화
  output: 'standalone',
  
  // 이미지 최적화 설정 (외부 이미지 허용)
  images: {
    domains: ['k.kakaocdn.net'],
    unoptimized: true
  }
};

export default nextConfig;
