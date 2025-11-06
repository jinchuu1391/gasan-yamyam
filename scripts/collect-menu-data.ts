/**
 * 빌드 타임에 메뉴 데이터를 수집하는 스크립트
 * Next.js 빌드 전에 실행되어 최신 메뉴 데이터를 가져옵니다
 */

import { scrapeAllMenuImages } from '../lib/menu-scraper';
import { extractTextFromMultipleImages } from '../lib/vision-api';
import fs from 'fs/promises';
import path from 'path';

// 구내식당 정보
const RESTAURANT_CONFIGS = [
  {
    id: "dasibom",
    name: "다시봄",
    coordinates: [126.878271, 37.479803] as [number, number],
    kakaoChannelUrl: "http://pf.kakao.com/_xhNExmn"
  },
  {
    id: "defolis",
    name: "디폴리스",
    coordinates: [126.877190, 37.479949] as [number, number],
    kakaoChannelUrl: "http://pf.kakao.com/_iyscG"
  },
  {
    id: 'baeksang',
    name: '백상',
    coordinates: [126.877444, 37.482465] as [number, number],
    kakaoChannelUrl: 'https://pf.kakao.com/_VQqxmG/posts'
  }
];

async function collectMenuData() {
  console.log('🍽️ Starting menu data collection for build...');
  
  try {
    // 1. 카카오톡 채널에서 메뉴 이미지 URL 추출
    console.log('📸 Scraping menu images from Kakao channels...');
    const kakaoChannelUrls = RESTAURANT_CONFIGS.map(config => config.kakaoChannelUrl);
    const imageResults = await scrapeAllMenuImages(kakaoChannelUrls);
    
    const validImageUrls = imageResults
      .filter(result => result.imageUrl)
      .map(result => result.imageUrl!);
    
    console.log(`✅ Found ${validImageUrls.length} valid image URLs`);
    
    if (validImageUrls.length === 0) {
      console.log('⚠️ No menu images found');
      return [];
    }
    
    // 2. 이미지에서 텍스트 추출
    console.log('🔍 Extracting text from images...');
    const textResults = await extractTextFromMultipleImages(validImageUrls);
    
    // 3. Restaurant 객체로 변환
    const restaurants = RESTAURANT_CONFIGS.map(config => {
      const imageResult = imageResults.find(img => 
        RESTAURANT_CONFIGS.find(c => c.kakaoChannelUrl === img.url)?.id === config.id
      );
      
      const textResult = textResults.find(text => text.imageUrl === imageResult?.imageUrl);
      
      let errorMessage;
      if (!imageResult?.imageUrl) {
        errorMessage = 'Failed to extract menu image from Kakao channel';
      } else if (textResult?.error) {
        errorMessage = `Text extraction failed: ${textResult.error}`;
      } else if (!textResult?.text) {
        errorMessage = 'No text could be extracted from menu image';
      }
      
      return {
        id: config.id,
        name: config.name,
        coordinates: config.coordinates,
        kakaoChannelUrl: config.kakaoChannelUrl,
        menuImageUrl: imageResult?.imageUrl || undefined,
        menuText: textResult?.text || undefined,
        cleanedMenuText: textResult?.cleanedText || undefined,
        todaysMenu: textResult?.menuItems || [],
        lastUpdated: new Date().toISOString(),
        error: errorMessage
      };
    });
    
    // 4. 데이터 디렉토리에 저장
    const dataDir = path.join(process.cwd(), 'data');
    await fs.mkdir(dataDir, { recursive: true });
    
    const menuData = {
      lastUpdated: new Date().toISOString(),
      restaurants
    };
    
    const filePath = path.join(dataDir, 'menu-data.json');
    await fs.writeFile(filePath, JSON.stringify(menuData, null, 2), 'utf8');
    
    console.log(`✅ Menu data saved to ${filePath}`);
    console.log(`📊 Collected data for ${restaurants.length} restaurants`);
    
    return restaurants;
    
  } catch (error) {
    console.error('❌ Error collecting menu data:', error);
    throw error;
  }
}

// 스크립트 실행
collectMenuData()
  .then(() => {
    console.log('✅ Build-time menu collection completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Build-time menu collection failed:', error);
    process.exit(1);
  });
