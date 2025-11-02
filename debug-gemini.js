import { GoogleGenerativeAI } from '@google/generative-ai';

// API 키 확인
const apiKey = process.env.GEMINI_API_KEY;
console.log('API Key exists:', !!apiKey);
console.log('API Key length:', apiKey?.length || 0);

if (apiKey && apiKey !== 'demo-key') {
  const genAI = new GoogleGenerativeAI(apiKey);
  
  // 사용 가능한 모델 목록 조회
  async function listModels() {
    try {
      const models = await genAI.listModels();
      console.log('Available models:');
      models.forEach((model) => {
        console.log(`- ${model.name} (${model.supportedGenerationMethods?.join(', ')})`);
      });
    } catch (error) {
      console.error('Error listing models:', error);
    }
  }
  
  listModels();
} else {
  console.log('No valid API key found');
}