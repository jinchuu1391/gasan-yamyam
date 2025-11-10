import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export 모드 유지 (정적 HTML 파일 생성)
  output: 'export',
  
  // 이미지 최적화 설정 (외부 이미지 허용)
  images: {
    unoptimized: true, // Static export에서는 필수
  },
  
  // Static export 시 필요한 설정
  trailingSlash: true,
};

export default nextConfig;
