import { Restaurant } from "./types";

// 가산디지털단지 중심 좌표
export const GASAN_CENTER_COORDINATES: [number, number] = [126.88254198968177, 37.48034809363842];

// 구내식당 데이터
export const RESTAURANTS: Restaurant[] = [
  {
    id: "dasibom",
    name: "다시봄",
    coordinates: [126.878271, 37.479803],
    todaysMenu: [
      "고추장 불고기",
      "현미밥",
      "돈까스",
      "계란국",
      "배추 겉절이",
      "샐러드"
    ]
  },
  // 추가 샘플 데이터
  {
    id: "happy-meal",
    name: "해피밀",
    coordinates: [126.881245, 37.481203],
    todaysMenu: [
      "김치찌개",
      "백미밥",
      "생선구이",
      "미역국",
      "오이무침",
      "과일"
    ]
  },
  {
    id: "good-taste",
    name: "맛고을",
    coordinates: [126.884567, 37.478934],
    todaysMenu: [
      "된장찌개",
      "잡곡밥",
      "제육볶음",
      "콩나물국",
      "시금치나물",
      "김치"
    ]
  }
];