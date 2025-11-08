'use client';
import { useState, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import AppHeader from './AppHeader';
import RestaurantList from './RestaurantList';
import MapComponent, { MapComponentRef } from './MapComponent';
import { Restaurant } from '@/lib/types';

type ViewMode = 'list' | 'map';

interface RestaurantAppProps {
  restaurants?: Restaurant[];
  lastUpdated?: string;
}

export default function RestaurantApp({ restaurants, lastUpdated }: RestaurantAppProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(null);
  const [isListCollapsed, setIsListCollapsed] = useState(false);
  const mapRef = useRef<MapComponentRef>(null);

  const handleRestaurantSelect = useCallback((restaurantId: string) => {
    setSelectedRestaurantId(restaurantId);
    // 모바일에서는 지도 뷰로 자동 전환
    setViewMode('map');
    // 지도로 직접 이동 명령
    mapRef.current?.moveToRestaurant(restaurantId);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader viewMode={viewMode} onViewModeChange={setViewMode} />

      {/* 메인 콘텐츠 */}
      <main className="h-[calc(100vh-4rem)] bg-gray-50">        
        {/* 데스크탑/태블릿: 사이드바 레이아웃 */}
        <div className="hidden md:flex md:overflow-y-auto h-full relative">
          <div 
            className={`relative z-10 transition-all duration-300 ease-in-out ${
              isListCollapsed ? 'w-12' : 'w-1/2'
            }`}
          >
            <div className="h-full shadow-xl shadow-black/10 relative">
              {!isListCollapsed && (
                <RestaurantList 
                  restaurants={restaurants} 
                  selectedRestaurantId={selectedRestaurantId}
                  onRestaurantSelect={handleRestaurantSelect}
                  lastUpdated={lastUpdated}
                  gridColumns={2}
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
              onRestaurantSelect={setSelectedRestaurantId}
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
                onRestaurantSelect={setSelectedRestaurantId}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
