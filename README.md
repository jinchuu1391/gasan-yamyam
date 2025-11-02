# 가산 맛집 (Gasan Yamyam) 🍽️

가산디지털단지 구내식당들의 오늘의 메뉴를 자동으로 수집하고 표시하는 웹 애플리케이션입니다.

## 주요 기능

- 🕙 **자동화된 메뉴 수집**: GitHub Actions로 평일(월-금) 오전 10시 10분(한국시간)에 자동으로 구내식당 메뉴 수집
- 🤖 **AI 텍스트 추출**: Google Vision API를 사용하여 메뉴 이미지에서 텍스트 자동 추출
- ✨ **AI 텍스트 정제**: Gemini AI로 인사말, 영업시간 등 불필요한 텍스트 자동 제거
- 📱 **반응형 디자인**: 모바일, 태블릿, 데스크톱 모든 기기에서 최적화된 UI
- 🗺️ **지도 통합**: OpenLayers를 사용한 구내식당 위치 표시
- ⚡ **서버사이드 캐싱**: 빠른 로딩을 위한 메뉴 데이터 캐싱

## 기술 스택

- **Frontend**: Next.js 16, React 19, TailwindCSS
- **Backend**: Next.js API Routes, Node.js
- **AI/ML**: Google Cloud Vision API, Google Gemini AI
- **스케줄링**: node-cron
- **지도**: OpenLayers
- **스크래핑**: Cheerio, Axios
- **언어**: TypeScript

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

4. **개발 서버 실행**
   ```bash
   npm run dev
   ```

5. **브라우저에서 확인**
   - http://localhost:3000 접속

## API 엔드포인트

### 메뉴 수집 API
- `GET /api/collect-menus` - 현재 저장된 메뉴 데이터 조회
- `POST /api/collect-menus` - 수동으로 메뉴 수집 실행

### 테스트 API
- `GET /api/test-collection` - 현재 메뉴 데이터 조회 (테스트용)
- `POST /api/test-collection` - 테스트용 메뉴 수집 실행

## 프로젝트 구조

```
├── app/
│   ├── api/
│   │   ├── collect-menus/     # 메뉴 수집 API
│   │   └── test-collection/   # 테스트 API
│   ├── page.tsx              # 메인 페이지
│   └── layout.tsx            # 루트 레이아웃
├── components/
│   ├── Layout.tsx            # 메인 레이아웃 컴포넌트
│   ├── RestaurantList.tsx    # 식당 목록 컴포넌트
│   └── MapComponent.tsx      # 지도 컴포넌트
├── lib/
│   ├── data.ts              # 기본 식당 데이터
│   ├── types.ts             # TypeScript 타입 정의
│   ├── menu-scraper.ts      # 메뉴 스크래핑 함수
│   ├── vision-api.ts        # Google Vision API 연동

└── data/
    └── menu-data.json       # 수집된 메뉴 데이터 (자동 생성)
```

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

## 배포

### Vercel 배포
1. Vercel에 리포지토리 연결
2. 환경 변수 설정 (필요시)
3. Google Cloud 서비스 계정 키를 Vercel의 파일로 업로드

### 다른 플랫폼
- Node.js를 지원하는 모든 플랫폼에서 배포 가능
- `npm run build && npm start` 명령어로 프로덕션 실행

## 주의사항

- Google Vision API 사용량에 따라 요금이 발생할 수 있습니다
- 크론 작업은 서버가 계속 실행되고 있을 때만 동작합니다
- 카카오톡 채널의 구조가 변경되면 스크래핑이 실패할 수 있습니다

## 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 연락처

프로젝트 링크: [https://github.com/jinchuu1391/gasan-yamyam](https://github.com/jinchuu1391/gasan-yamyam)
