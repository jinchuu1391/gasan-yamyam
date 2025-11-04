import Layout from '@/components/Layout';
import { loadMenuData } from '@/app/api/collect-menus/route';

export default async function Home() {
  
  // 캐시된 메뉴 데이터 로드
  const menuData = await loadMenuData();
  
  return <Layout restaurants={menuData?.restaurants} lastUpdated={menuData?.lastUpdated} />;
}
