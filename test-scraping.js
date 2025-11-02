import { extractMenuImageFromKakaoChannel } from './lib/menu-scraper';

async function testScraping() {
  console.log('🧪 Testing menu scraping...');
  
  try {
    const testUrl = 'https://pf.kakao.com/_iyscG';
    console.log(`Testing with URL: ${testUrl}`);
    
    const imageUrl = await extractMenuImageFromKakaoChannel(testUrl);
    
    if (imageUrl) {
      console.log('✅ Success! Found menu image URL:', imageUrl);
    } else {
      console.log('❌ No image URL found');
    }
  } catch (error) {
    console.error('❌ Error during test:', error);
  }
}

testScraping();