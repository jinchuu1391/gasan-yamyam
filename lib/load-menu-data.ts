import fs from 'fs/promises';
import path from 'path';
import { Restaurant } from '@/lib/types';

export interface MenuData {
  lastUpdated: string;
  restaurants: Restaurant[];
}

// 저장된 메뉴 데이터를 읽는 함수
export async function loadMenuData(): Promise<MenuData | null> {
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
