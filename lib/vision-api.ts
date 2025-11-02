import { ImageAnnotatorClient } from '@google-cloud/vision';
import { convertImageToBase64 } from './menu-scraper';
import { cleanMenuText } from './text-cleaner';

import path from 'path';

// Google Vision API 클라이언트 초기화
// 로컬 개발: service-account.json 파일 사용
// Google Cloud 환경: ADC(Application Default Credentials) 자동 사용
const visionClient = new ImageAnnotatorClient({
  // 로컬에서는 service-account.json 파일 경로 지정
  ...(process.env.NODE_ENV !== 'production' && {
    keyFilename: path.join(process.cwd(), 'service-account.json')
  })
});

/**
 * Google Vision API를 사용하여 이미지에서 텍스트를 추출하는 함수
 */
export async function extractTextFromImage(imageUrl: string): Promise<string | null> {
  try {
    console.log(`Extracting text from image: ${imageUrl}`);
    
    // 이미지를 base64로 변환
    const base64Image = await convertImageToBase64(imageUrl);
    if (!base64Image) {
      console.error('Failed to convert image to base64');
      return null;
    }

    // Base64 이미지 크기 체크 (Vision API 제한: 20MB)
    const sizeInBytes = (base64Image.length * 3) / 4;
    if (sizeInBytes > 20 * 1024 * 1024) {
      console.error(`Image too large for Vision API: ${sizeInBytes} bytes`);
      return null;
    }

    // Google Vision API로 텍스트 감지 (재시도 로직 포함)
    let result;
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        [result] = await visionClient.textDetection({
          image: {
            content: base64Image,
          },
          imageContext: {
            languageHints: ['ko', 'en'], // 한국어와 영어 힌트 추가
          },
        });
        break; // 성공하면 루프 종료
      } catch (visionError: unknown) {
        retryCount++;
        const errorMessage = visionError instanceof Error ? visionError.message : String(visionError);
        console.error(`Vision API attempt ${retryCount} failed:`, errorMessage);
        
        // 특정 오류는 재시도하지 않음
        if (errorMessage?.includes('DECODER routines::unsupported') || 
            errorMessage?.includes('INVALID_ARGUMENT') ||
            retryCount >= maxRetries) {
          console.error(`Giving up on image ${imageUrl} after ${retryCount} attempts`);
          return null;
        }
        
        // 재시도 전 잠시 대기
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      }
    }

    if (!result) {
      console.error('Failed to get result from Vision API after retries');
      return null;
    }

    const detections = result.textAnnotations;
    
    if (detections && detections.length > 0) {
      // 첫 번째 항목은 전체 텍스트를 포함
      const extractedText = detections[0].description || '';
      console.log(`Successfully extracted text from image (${extractedText.length} characters)`);
      return extractedText;
    } else {
      console.log('No text detected in the image');
      return null;
    }
  } catch (error) {
    console.error(`Error extracting text from image ${imageUrl}:`, error);
    return null;
  }
}

/**
 * 추출된 텍스트를 메뉴 항목으로 파싱하는 함수
 * (간단한 예시 - 실제로는 더 정교한 파싱이 필요할 수 있음)
 */
export function parseMenuText(text: string): string[] {
  if (!text) return [];
  
  // 줄바꿈으로 분리하고 빈 줄 제거
  const lines = text.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
  
  // 메뉴로 보이는 항목들 필터링 (한글이 포함된 줄들)
  const menuItems = lines.filter(line => {
    // 한글이 포함되고, 너무 짧지 않은 항목들
    return /[가-힣]/.test(line) && line.length >= 2 && line.length <= 20;
  });
  
  return menuItems;
}

/**
 * 이미지 URL의 유효성을 검사하는 함수
 */
function isValidImageUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    
    // HTTP/HTTPS 프로토콜만 허용
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return false;
    }
    
    // 일반적인 이미지 파일 확장자 체크 (선택적)
    const pathname = parsedUrl.pathname.toLowerCase();
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
    
    // 확장자가 명시적으로 있는 경우 체크, 없으면 통과 (카카오 이미지 URL은 확장자가 없을 수 있음)
    if (pathname.includes('.')) {
      return imageExtensions.some(ext => pathname.endsWith(ext));
    }
    
    return true;
  } catch {
    return false;
  }
}

/**
 * 여러 이미지에서 동시에 텍스트를 추출하고 정제하는 함수
 */
export async function extractTextFromMultipleImages(imageUrls: string[]): Promise<{
  imageUrl: string, 
  text: string | null, 
  cleanedText: string | null,
  menuItems: string[],
  cleaningMethod?: 'rule-based' | 'rule-based + ai',
  error?: string
}[]> {
  console.log(`Starting to extract text from ${imageUrls.length} images...`);
  
  // 유효한 URL만 필터링
  const validUrls = imageUrls.filter(url => {
    const isValid = isValidImageUrl(url);
    if (!isValid) {
      console.error(`Invalid image URL: ${url}`);
    }
    return isValid;
  });
  
  console.log(`Processing ${validUrls.length} valid URLs out of ${imageUrls.length} total URLs`);
  
  const promises = validUrls.map(async (imageUrl) => {
    try {
      const rawText = await extractTextFromImage(imageUrl);
      const menuItems = parseMenuText(rawText || '');
      
      // 텍스트 정제 실행
      let cleanedText = null;
      let cleaningMethod: 'rule-based' | 'rule-based + ai' | undefined;
      
      if (rawText) {
        try {
          const cleaningResult = await cleanMenuText(rawText);
          cleanedText = cleaningResult.cleanedText;
          cleaningMethod = cleaningResult.method;
          console.log(`✨ Text cleaned for ${imageUrl} using ${cleaningMethod}`);
        } catch (error) {
          console.error(`❌ Error cleaning text for ${imageUrl}:`, error);
          cleanedText = rawText; // 정제 실패 시 원본 사용
        }
      }
      
      return {
        imageUrl,
        text: rawText,
        cleanedText,
        menuItems,
        cleaningMethod
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`❌ Failed to process image ${imageUrl}:`, errorMessage);
      
      return {
        imageUrl,
        text: null,
        cleanedText: null,
        menuItems: [],
        error: errorMessage
      };
    }
  });
  
  // 무효한 URL들도 결과에 포함
  const invalidUrls = imageUrls.filter(url => !isValidImageUrl(url)).map(url => ({
    imageUrl: url,
    text: null,
    cleanedText: null,
    menuItems: [],
    error: 'Invalid image URL'
  }));
  
  const validResults = await Promise.all(promises);
  const allResults = [...validResults, ...invalidUrls];
  
  const successCount = allResults.filter(r => r.text && !r.error).length;
  console.log(`Completed text extraction and cleaning. Successfully processed ${successCount} images out of ${allResults.length}`);
  
  return allResults;
}