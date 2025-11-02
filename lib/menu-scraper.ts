import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * 카카오톡 채널 페이지에서 og:image meta 태그를 추출하는 함수
 */
export async function extractMenuImageFromKakaoChannel(channelUrl: string): Promise<string | null> {
  try {
    console.log(`Fetching menu image from: ${channelUrl}`);
    
    const response = await axios.get(channelUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000 // 10초 타임아웃
    });

    const $ = cheerio.load(response.data);
    
    // og:image meta 태그 찾기
    const ogImageUrl = $('meta[property="og:image"]').attr('content');
    
    if (ogImageUrl) {
      console.log(`Found menu image URL: ${ogImageUrl}`);
      return ogImageUrl;
    } else {
      console.log('No og:image meta tag found');
      return null;
    }
  } catch (error) {
    console.error(`Error extracting menu image from ${channelUrl}:`, error);
    return null;
  }
}

/**
 * 이미지가 유효한지 검증하는 함수
 */
function isValidImageBuffer(buffer: Buffer): boolean {
  // JPEG 시그니처 체크
  if (buffer.length >= 2 && buffer[0] === 0xFF && buffer[1] === 0xD8) {
    return true;
  }
  
  // PNG 시그니처 체크
  if (buffer.length >= 8 && 
      buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47 &&
      buffer[4] === 0x0D && buffer[5] === 0x0A && buffer[6] === 0x1A && buffer[7] === 0x0A) {
    return true;
  }
  
  // GIF 시그니처 체크
  if (buffer.length >= 6 && 
      ((buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38 && buffer[4] === 0x37 && buffer[5] === 0x61) ||
       (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38 && buffer[4] === 0x39 && buffer[5] === 0x61))) {
    return true;
  }
  
  // WebP 시그니처 체크
  if (buffer.length >= 12 &&
      buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
      buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50) {
    return true;
  }
  
  return false;
}

/**
 * URL에서 이미지를 다운로드하고 base64로 변환하는 함수
 */
export async function convertImageToBase64(imageUrl: string): Promise<string | null> {
  try {
    console.log(`Converting image to base64: ${imageUrl}`);
    
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: 15000, // 15초 타임아웃
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'image/jpeg,image/png,image/gif,image/webp,image/*,*/*;q=0.8'
      }
    });

    // Content-Type 체크
    const contentType = response.headers['content-type'];
    if (contentType && !contentType.startsWith('image/')) {
      console.error(`Invalid content type: ${contentType} for URL: ${imageUrl}`);
      return null;
    }

    const buffer = Buffer.from(response.data);
    
    // 이미지 유효성 검증
    if (!isValidImageBuffer(buffer)) {
      console.error(`Invalid image format for URL: ${imageUrl}`);
      return null;
    }

    // 이미지 크기 체크 (너무 크거나 작은 이미지 제외)
    if (buffer.length < 1000) { // 1KB 미만
      console.error(`Image too small (${buffer.length} bytes) for URL: ${imageUrl}`);
      return null;
    }
    
    if (buffer.length > 10 * 1024 * 1024) { // 10MB 초과
      console.error(`Image too large (${buffer.length} bytes) for URL: ${imageUrl}`);
      return null;
    }

    const base64 = buffer.toString('base64');
    console.log(`Successfully converted image to base64 (length: ${base64.length})`);
    
    return base64;
  } catch (error) {
    console.error(`Error converting image to base64 from ${imageUrl}:`, error);
    return null;
  }
}

/**
 * 여러 구내식당의 메뉴 이미지를 동시에 스크래핑하는 함수
 */
export async function scrapeAllMenuImages(kakaoChannelUrls: string[]): Promise<{url: string, imageUrl: string | null}[]> {
  console.log(`Starting to scrape ${kakaoChannelUrls.length} menu images...`);
  
  const promises = kakaoChannelUrls.map(async (url) => ({
    url,
    imageUrl: await extractMenuImageFromKakaoChannel(url)
  }));
  
  const results = await Promise.all(promises);
  
  console.log(`Completed scraping. Found ${results.filter(r => r.imageUrl).length} images out of ${results.length} channels`);
  
  return results;
}