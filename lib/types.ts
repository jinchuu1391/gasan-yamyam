export interface Restaurant {
  id: string;
  name: string;
  coordinates: [number, number]; // [longitude, latitude]
  todaysMenu?: string[]; // 옵셔널로 변경
  menuImageUrl?: string; // 오늘의 메뉴 이미지 URL
  menuText?: string; // Google Vision API로 추출한 원본 텍스트
  cleanedMenuText?: string; // AI로 정제된 텍스트
  lastUpdated?: string; // 마지막 업데이트 시간 (ISO string)
  kakaoChannelUrl?: string; // 카카오톡 채널 URL
  error?: string; // 처리 중 발생한 오류 메시지
}