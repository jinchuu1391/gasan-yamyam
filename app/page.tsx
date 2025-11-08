import RestaurantApp from '@/components/RestaurantApp';
import { loadMenuData } from '@/lib/load-menu-data';

export default async function Home() {
  
  // 빌드 타임에 수집된 메뉴 데이터 로드
  const menuData = await loadMenuData();
  
  return <RestaurantApp restaurants={menuData?.restaurants} lastUpdated={menuData?.lastUpdated} />;
}
