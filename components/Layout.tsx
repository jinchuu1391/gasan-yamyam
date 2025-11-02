'use client';

import { useState, useCallback, useRef } from 'react';
import { List, Map, Mail, ChevronLeft, ChevronRight } from 'lucide-react';
import RestaurantList from './RestaurantList';
import MapComponent, { MapComponentRef } from './MapComponent';
import { Restaurant } from '@/lib/types';

type ViewMode = 'list' | 'map';

interface LayoutProps {
  restaurants: Restaurant[];
  lastUpdated?: string;
}

export default function Layout({ restaurants, lastUpdated }: LayoutProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(null);
  const [isListCollapsed, setIsListCollapsed] = useState(false);
  const mapRef = useRef<MapComponentRef>(null);

  const handleRestaurantSelect = useCallback((restaurantId: string) => {
    setSelectedRestaurantId(restaurantId);
    // 지도로 직접 이동 명령
    mapRef.current?.moveToRestaurant(restaurantId);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900">
              가산디지털단지 구내식당
            </h1>
            
            <div className="flex items-center gap-4">
              {/* 문의하기 링크 */}
              <a 
                href="mailto:jinsoo.mw@gmail.com" 
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
              >
                <Mail className="w-4 h-4" />
                <span className="hidden sm:inline">contact: jinsoo.mw@gmail.com</span>
              </a>
              
              {/* 모바일 뷰 모드 전환 버튼 */}
              <div className="flex md:hidden bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <List size={16} />
                목록
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'map'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Map size={16} />
                지도
              </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="h-[calc(100vh-4rem)] bg-gray-50">        
        {/* 데스크탑/태블릿: 사이드바 레이아웃 */}
        <div className="hidden md:flex md:overflow-y-auto h-full relative">
          <div 
            className={`relative z-10 transition-all duration-300 ease-in-out ${
              isListCollapsed ? 'w-12' : 'w-1/3'
            }`}
          >
            <div className="h-full shadow-xl shadow-black/10 relative">
              {!isListCollapsed && (
                <RestaurantList 
                  restaurants={restaurants} 
                  selectedRestaurantId={selectedRestaurantId}
                  onRestaurantSelect={handleRestaurantSelect}
                  lastUpdated={lastUpdated}
                />
              )}
              
              {/* 토글 버튼 */}
              <button
                onClick={() => setIsListCollapsed(!isListCollapsed)}
                className={`absolute top-1/2 -translate-y-1/2 bg-white border border-gray-300 rounded-full p-2 shadow-lg hover:shadow-xl transition-all z-20 ${
                  isListCollapsed ? 'right-2' : '-right-4'
                }`}
                title={isListCollapsed ? '목록 보기' : '목록 숨기기'}
              >
                {isListCollapsed ? (
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                ) : (
                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                )}
              </button>
            </div>
          </div>
          <div className="flex-1 relative">
            <MapComponent 
              ref={mapRef}
              restaurants={restaurants} 
              selectedRestaurantId={selectedRestaurantId}
              onRestaurantSelect={handleRestaurantSelect}
            />
          </div>
        </div>

        {/* 모바일: 토글 가능한 뷰 */}
        <div className="md:hidden h-full">
          {viewMode === 'list' ? (
            <div className="h-full overflow-y-auto">
              <RestaurantList 
                restaurants={restaurants} 
                selectedRestaurantId={selectedRestaurantId}
                onRestaurantSelect={handleRestaurantSelect}
                lastUpdated={lastUpdated}
              />
            </div>
          ) : (
            <div className="h-full">
              <MapComponent 
                ref={mapRef}
                restaurants={restaurants} 
                selectedRestaurantId={selectedRestaurantId}
                onRestaurantSelect={handleRestaurantSelect}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}