# 가산 맛집 (Gasan Yamyam) 🍽️

프로젝트 링크: [https://github.com/jinchuu1391/gasan-yamyam](https://github.com/jinchuu1391/gasan-yamyam)

가산디지털단지 구내식당들의 오늘의 메뉴를 자동으로 수집하고 표시하는 웹 애플리케이션입니다.

## 주요 기능

- **메뉴 수집**: GitHub Actions로 평일(월-금) 오전 10시 10분(한국시간)에 자동으로 구내식당 메뉴 수집
- **텍스트 추출**: Google Vision API를 사용하여 메뉴 이미지에서 텍스트 자동 추출
- **텍스트 정제**: Gemini AI로 인사말, 영업시간 등 불필요한 텍스트 자동 제거

## 시작하기

### 필수 조건

1. Node.js 18+ 설치
2. Google Cloud Vision API 서비스 계정 키 (`service-account.json`)

### 설치 및 실행

1. **리포지토리 클론**

   ```bash
   git clone https://github.com/jinchuu1391/gasan-yamyam.git
   cd gasan-yamyam
   ```

2. **의존성 설치**

   ```bash
   npm install
   ```

3. **Google Cloud 설정**
   - Google Cloud Console에서 Vision API 서비스 계정 키를 다운로드
   - 프로젝트 루트에 `service-account.json` 파일로 저장

4. **AI 텍스트 정제 설정 (선택사항)**

   ```bash
   # .env.local 파일 생성
   cp .env.example .env.local

   # Gemini API 키 설정 (https://aistudio.google.com/app/apikey)
   GEMINI_API_KEY=your_actual_api_key_here
   ```

5. **개발 서버 실행**

   ```bash
   npm run dev
   ```

6. **브라우저에서 확인**
   - http://localhost:3000 접속

## 메뉴 수집 프로세스

1. **스크래핑**: 카카오톡 채널 페이지에서 `og:image` 메타태그 추출
2. **이미지 변환**: 이미지 URL을 base64로 변환
3. **텍스트 추출**: Google Vision API로 이미지에서 텍스트 추출
4. **텍스트 정제**:
   - 1단계: 규칙 기반 필터링 (인사말, 연락처 등 제거)
   - 2단계: Gemini AI로 스마트 정제 (선택사항)
5. **데이터 파싱**: 정제된 텍스트를 메뉴 항목으로 파싱
6. **저장**: 원본/정제된 텍스트를 모두 JSON 파일로 저장
7. **캐싱**: 서버사이드 렌더링에서 캐시된 데이터 사용

## 새로운 구내식당 추가

`app/api/collect-menus/route.ts` 파일의 `RESTAURANT_CONFIGS` 배열에 새로운 식당 정보를 추가하세요:

```typescript
{
  id: "restaurant-id",
  name: "식당명",
  coordinates: [경도, 위도],
  kakaoChannelUrl: "https://pf.kakao.com/_xxxxx"
}
```
