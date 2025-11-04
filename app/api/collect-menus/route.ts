import { NextResponse } from 'next/server';
import { scrapeAllMenuImages } from '@/lib/menu-scraper';
import { extractTextFromMultipleImages } from '@/lib/vision-api';
import { Restaurant } from '@/lib/types';
import fs from 'fs/promises';
import path from 'path';
import { revalidatePath } from 'next/cache';

// 구내식당 정보 (카카오톡 채널 URL 포함)
const RESTAURANT_CONFIGS: Array<{
  id: string;
  name: string;
  coordinates: [number, number];
  kakaoChannelUrl: string;
}> = [
  {
    id: "dasibom",
    name: "다시봄",
    coordinates: [126.878271, 37.479803],
    kakaoChannelUrl: "http://pf.kakao.com/_xhNExmn"
  },
  {
    id: "defolis",
    name: "디폴리스",
    coordinates: [126.877190, 37.479949],
    kakaoChannelUrl: "http://pf.kakao.com/_iyscG"
  },
  {
    id:'baeksang',
    name:'백상',
    coordinates:[126.877444,37.482465],
    kakaoChannelUrl:'https://pf.kakao.com/_VQqxmG/posts'
  }
];

// 메뉴 데이터를 파일에 저장하는 함수
async function saveMenuData(restaurants: Restaurant[]) {
  const dataDir = path.join(process.cwd(), 'data');
  
  try {
    // data 디렉토리가 없으면 생성
    await fs.mkdir(dataDir, { recursive: true });
    
    const filePath = path.join(dataDir, 'menu-data.json');
    const data = {
      lastUpdated: new Date().toISOString(),
      restaurants
    };
    
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Menu data saved to ${filePath}`);
  } catch (error) {
    console.error('Error saving menu data:', error);
  }
}

// 저장된 메뉴 데이터를 읽는 함수
export async function loadMenuData(): Promise<{ lastUpdated: string; restaurants: Restaurant[] } | null> {
  const dataDir = path.join(process.cwd(), 'data');
  const filePath = path.join(dataDir, 'menu-data.json');
  
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch {
    console.log('No existing menu data found');
    return null;
  }
}

// 메뉴 수집 메인 함수
async function collectMenus(): Promise<Restaurant[]> {
  try {
    console.log('Starting menu collection process...');
    
    // 1. 모든 카카오톡 채널에서 메뉴 이미지 URL 추출
    const kakaoChannelUrls = RESTAURANT_CONFIGS.map(config => config.kakaoChannelUrl);
    const imageResults = await scrapeAllMenuImages(kakaoChannelUrls);
    
    // 2. 추출된 이미지들에서 텍스트 추출
    const validImageUrls = imageResults
      .filter(result => result.imageUrl)
      .map(result => result.imageUrl!);
    
    console.log(`Found ${validImageUrls.length} valid image URLs out of ${imageResults.length} total results`);
    
    if (validImageUrls.length === 0) {
      console.log('No menu images found');
      return [];
    }
    
    const textResults = await extractTextFromMultipleImages(validImageUrls);
    
    // 텍스트 추출 결과 요약 로깅
    const successfulExtractions = textResults.filter(result => result.text && !result.error);
    const failedExtractions = textResults.filter(result => result.error);
    
    console.log(`Text extraction summary: ${successfulExtractions.length} successful, ${failedExtractions.length} failed`);
    
    if (failedExtractions.length > 0) {
      console.log('Failed extractions:');
      failedExtractions.forEach(result => {
        console.log(`  - ${result.imageUrl}: ${result.error}`);
      });
    }
    
    // 3. 결과를 Restaurant 객체로 변환
    const updatedRestaurants: Restaurant[] = RESTAURANT_CONFIGS.map(config => {
      const imageResult = imageResults.find(img => 
        RESTAURANT_CONFIGS.find(c => c.kakaoChannelUrl === img.url)?.id === config.id
      );
      
      const textResult = textResults.find(text => text.imageUrl === imageResult?.imageUrl);
      
      // 오류 메시지 수집
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
    
    console.log(`Menu collection completed. Processed ${updatedRestaurants.length} restaurants`);
    return updatedRestaurants;
    
  } catch (error) {
    console.error('Error in menu collection process:', error);
    throw error;
  }
}

// GET 요청: 현재 저장된 메뉴 데이터 반환
export async function GET() {
  try {
    const menuData = await loadMenuData();
    
    if (!menuData) {
      return NextResponse.json({ 
        message: 'No menu data available',
        restaurants: []
      }, { status: 404 });
    }
    
    return NextResponse.json(menuData);
  } catch (error) {
    console.error('Error loading menu data:', error);
    return NextResponse.json({ 
      error: 'Failed to load menu data' 
    }, { status: 500 });
  }
}

// POST 요청: 메뉴 수집 실행 (수동 트리거 또는 크론 작업용)
export async function POST() {
  try {
    console.log('Manual menu collection triggered');
    
    const restaurants = await collectMenus();
    await saveMenuData(restaurants);
    
    // 🎯 여기에 추가!
    revalidatePath('/');  // 메인 페이지 캐시 무효화
    
    return NextResponse.json({
      message: 'Menu collection completed successfully',
      timestamp: new Date().toISOString(),
      restaurantsProcessed: restaurants.length,
      restaurants
    });
    
  } catch (error) {
    console.error('Error in menu collection:', error);
    return NextResponse.json({ 
      error: 'Menu collection failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}