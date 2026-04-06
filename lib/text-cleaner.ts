import { GoogleGenerativeAI } from "@google/generative-ai";

// Gemini API 클라이언트 초기화 (API 키는 환경변수에서 가져옴)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "demo-key");

/**
 * 규칙 기반 텍스트 정제 (1차 필터링)
 */
function ruleBasedCleanText(text: string): string {
  if (!text) return text;

  // 제거할 일반적인 문구들
  const commonPhrasesToRemove = [
    /맛있게\s*드세요!?/gi,
    /감사합니다!?/gi,
    /영업시간[:\s]*\d{1,2}:\d{2}\s*[-~]\s*\d{1,2}:\d{2}/gi,
    /전화번호[:\s]*\d{2,3}-\d{3,4}-\d{4}/gi,
    /문의[:\s]*\d{2,3}-\d{3,4}-\d{4}/gi,
    /주소[:\s]*.+구\s.+동/gi,
    /\d{4}년\s*\d{1,2}월\s*\d{1,2}일/gi,
    /\d{1,2}\/\d{1,2}\s*\([월화수목금토일]\)/gi,
    /좋은\s*하루\s*되세요/gi,
    /건강한\s*식사/gi,
    /맛있는\s*식사/gi,
  ];

  let cleanedText = text;

  // 일반적인 문구들 제거
  commonPhrasesToRemove.forEach((pattern) => {
    cleanedText = cleanedText.replace(pattern, "");
  });

  // 연續된 공백과 줄바꿈 정리
  cleanedText = cleanedText
    .replace(/\n\s*\n\s*\n/g, "\n\n") // 3개 이상의 연속 줄바꿈을 2개로
    .replace(/\s{3,}/g, " ") // 3개 이상의 연속 공백을 1개로
    .trim();

  return cleanedText;
}

/**
 * Gemini AI를 사용한 텍스트 정제 (2차 필터링)
 */
async function aiCleanText(text: string): Promise<{
  cleanedText: string;
  removedContent: string[];
}> {
  // 환경변수에 API 키가 없으면 규칙 기반 결과만 반환
  if (
    !process.env.GEMINI_API_KEY ||
    process.env.GEMINI_API_KEY === "demo-key"
  ) {
    console.log("⚠️ Gemini API key not found, using rule-based cleaning only");
    return {
      cleanedText: text,
      removedContent: ["AI 필터링 건너뜀 (API 키 없음)"],
    };
  }

  try {
    const modelsToTry = ["gemini-3.1-flash-lite-preview"];

    let model;

    for (const modelName of modelsToTry) {
      try {
        model = genAI.getGenerativeModel({ model: modelName });
        console.log(`✅ Using Gemini model: ${modelName}`);
        break;
      } catch {
        console.log(`⚠️ Model ${modelName} not available, trying next...`);
        continue;
      }
    }

    if (!model) {
      throw new Error("No available Gemini models found");
    }

    const prompt = `
다음은 구내식당 메뉴 이미지에서 추출한 텍스트입니다.
이 텍스트에 실제 메뉴가 포함되어 있다면 정제해주세요. 
만약 메뉴가 아닌 내용(식당 이름, 로고, 일반 텍스트 등)만 있다면 "메뉴 정보 없음"이라고 응답해주세요.

원본 텍스트:
${text}

규칙:
1. 텍스트에 실제 음식 메뉴가 있는지 먼저 확인
2. 메뉴가 있다면: 메뉴 이름과 가격 정보 유지하고 불필요한 내용 제거
3. 메뉴가 없다면: "메뉴 정보 없음"만 응답
4. 절대로 임의의 메뉴를 생성하지 말 것
5. "맛있게 드세요", "감사합니다" 같은 인사말 제거
6. 영업시간, 전화번호, 주소, 날짜 정보 제거

응답:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const cleanedText = response.text().trim();

    // AI가 "메뉴 정보 없음"이라고 응답했다면 빈 문자열 반환
    if (
      cleanedText.includes("메뉴 정보 없음") ||
      cleanedText.includes("메뉴가 없") ||
      cleanedText.includes("메뉴 없음")
    ) {
      console.log("✨ AI detected no menu information in text");
      return {
        cleanedText: "",
        removedContent: ["AI가 메뉴 정보 없음을 감지"],
      };
    }

    console.log("✨ AI text cleaning completed");

    return {
      cleanedText: cleanedText,
      removedContent: ["AI로 인사말 및 불필요한 정보 제거됨"],
    };
  } catch (error) {
    console.error("❌ Error in AI text cleaning:", error);

    // AI 처리 실패 시 원본 텍스트 반환
    return {
      cleanedText: text,
      removedContent: ["AI 처리 실패, 원본 텍스트 사용"],
    };
  }
}

/**
 * 메인 텍스트 정제 함수 (규칙 기반 + AI 조합)
 */
export async function cleanMenuText(rawText: string): Promise<{
  originalText: string;
  cleanedText: string;
  removedContent: string[];
  method: "rule-based" | "rule-based + ai";
}> {
  if (!rawText || rawText.trim().length === 0) {
    return {
      originalText: rawText,
      cleanedText: "",
      removedContent: [],
      method: "rule-based",
    };
  }

  console.log("🧹 Starting text cleaning process...");

  // 1단계: 규칙 기반 정제
  const ruleBasedResult = ruleBasedCleanText(rawText);
  console.log("✅ Rule-based cleaning completed");

  // 2단계: AI 정제 (선택적)
  const aiResult = await aiCleanText(ruleBasedResult);

  const hasApiKey =
    process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "demo-key";

  return {
    originalText: rawText,
    cleanedText: aiResult.cleanedText,
    removedContent: aiResult.removedContent,
    method: hasApiKey ? "rule-based + ai" : "rule-based",
  };
}

/**
 * 여러 텍스트를 동시에 정제하는 함수
 */
export async function cleanMultipleMenuTexts(
  textList: { id: string; text: string }[],
): Promise<
  { id: string; result: Awaited<ReturnType<typeof cleanMenuText>> }[]
> {
  console.log(
    `🧹 Starting batch text cleaning for ${textList.length} items...`,
  );

  const promises = textList.map(async (item) => ({
    id: item.id,
    result: await cleanMenuText(item.text),
  }));

  const results = await Promise.all(promises);

  console.log(`✅ Batch text cleaning completed for ${results.length} items`);

  return results;
}
