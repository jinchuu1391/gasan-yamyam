import { Restaurant } from '@/lib/types';
import Image from 'next/image';
import { useState, useMemo, useEffect } from 'react';
import { Search } from 'lucide-react';

interface RestaurantListProps {
  restaurants?: Restaurant[];
  selectedRestaurantId?: string | null;
  onRestaurantSelect?: (restaurantId: string) => void;
  lastUpdated?: string;
  gridColumns?: number; // 데스크탑 그리드 열 개수 (1 또는 2)
}

function formatLastUpdated(dateString?: string) {
  if (!dateString) return null;
  
  const date = new Date(dateString);
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export default function RestaurantList({ 
  restaurants = [], 
  selectedRestaurantId, 
  onRestaurantSelect, 
  lastUpdated,
  gridColumns = 1 
}: RestaurantListProps) {
  const [inputValue, setInputValue] = useState(''); // 사용자 입력값
  const [searchTerm, setSearchTerm] = useState(''); // 실제 검색에 사용되는 값

  // 디바운싱: 입력이 멈춘 후 1초 뒤에 검색 실행
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(inputValue);
    }, 1000);

    // 클린업: 새로운 입력이 들어오면 이전 타이머 취소
    return () => clearTimeout(timer);
  }, [inputValue]);

  const filteredRestaurants = useMemo(() => {
    if (!searchTerm.trim()) return restaurants;
    
    return restaurants?.filter(restaurant => {
      const searchText = searchTerm.toLowerCase();
      return (
        restaurant.name.toLowerCase().includes(searchText) ||
        restaurant.cleanedMenuText?.toLowerCase().includes(searchText) ||
        restaurant.menuText?.toLowerCase().includes(searchText)
      );
    });
  }, [restaurants, searchTerm]);

  return (
    <div className="bg-white rounded-r-lg md:rounded-r-none md:rounded-l-none shadow-sm border md:border-r-0 md:h-full overflow-hidden">
      <div className="p-4 border-b bg-gray-50">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="식당명이나 메뉴로 검색..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex justify-between items-center mt-2">
          <p className="text-sm text-gray-600">
            {filteredRestaurants.length}개 식당 {searchTerm && `(전체 ${restaurants.length}개 중)`}
          </p>
          {lastUpdated && (
            <p className="text-xs text-gray-500">
              {formatLastUpdated(lastUpdated)}
            </p>
          )}
        </div>
      </div>
      
      <div className="overflow-y-auto h-[calc(100%-6rem)] md:h-[calc(100%-6rem)]">
        <div className={`pb-6 ${gridColumns === 2 ? 'grid grid-cols-2 gap-4 p-4' : 'space-y-0'}`}>
          {filteredRestaurants.map((restaurant) => (
            <div 
              key={restaurant.id} 
              className={`${gridColumns === 2 ? 'flex flex-col' : ''} ${gridColumns !== 2 ? 'border-b border-gray-100' : ''} transition-all cursor-pointer ${
                selectedRestaurantId === restaurant.id
                  ? 'bg-blue-50 rounded-lg'
                  : 'bg-white hover:bg-gray-50 border border-gray-200 rounded-lg hover:shadow-md'
              }`}
              onClick={() => onRestaurantSelect?.(restaurant.id)}
            >
              {/* 식당명 - 가운데 정렬 */}
              <div className={`${gridColumns === 2 ? 'p-3 border-b' : 'p-4 pb-2'} bg-gray-50`}>
                <h3 
                  className={`text-lg font-bold text-center transition-colors`}
                >
                  {restaurant.name}
                </h3>
              </div>
              
              {/* 메뉴 내용 - 고정 높이 */}
              <div className={`${gridColumns === 2 ? 'flex-1 p-3' : 'p-4 pt-2'} overflow-hidden`}>
                <div className={gridColumns === 2 ? 'h-64 overflow-y-auto' : ''}>
                  {restaurant.error ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="flex items-start space-x-2">
                        <svg className="w-4 h-4 text-red-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-red-800">메뉴 정보를 불러올 수 없습니다</p>
                          <p className="text-xs text-red-600 mt-1">{restaurant.error}</p>
                        </div>
                      </div>
                    </div>
                  ) : restaurant.cleanedMenuText ? (
                    <div className="space-y-2">
                      {/* AI로 정제된 메뉴 */}
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans leading-relaxed">
                          {restaurant.cleanedMenuText}
                        </pre>
                      </div>
                    </div>
                  ) : restaurant.menuText ? (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                        {restaurant.menuText}
                      </pre>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-400 italic text-center py-4">
                      아직 메뉴 정보가 없습니다
                      <div className="text-xs text-gray-500 mt-1">
                        평일 오전 10:10에 자동으로 업데이트됩니다
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}