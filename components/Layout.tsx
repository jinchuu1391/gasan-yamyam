'use client';

import { useState } from 'react';
import { List, Map } from 'lucide-react';
import RestaurantList from './RestaurantList';
import MapComponent from './MapComponent';
import { RESTAURANTS } from '@/lib/data';

type ViewMode = 'list' | 'map';

export default function Layout() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900">
              가산디지털단지 구내식당
            </h1>
            
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
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 데스크탑/태블릿: 사이드바 레이아웃 */}
        <div className="hidden md:flex gap-6 h-[calc(100vh-8rem)]">
          <div className="w-1/3">
            <RestaurantList restaurants={RESTAURANTS} />
          </div>
          <div className="flex-1">
            <MapComponent restaurants={RESTAURANTS} />
          </div>
        </div>

        {/* 모바일: 토글 가능한 뷰 */}
        <div className="md:hidden">
          {viewMode === 'list' ? (
            <div className="max-h-[calc(100vh-10rem)] overflow-y-auto">
              <RestaurantList restaurants={RESTAURANTS} />
            </div>
          ) : (
            <div className="h-[calc(100vh-10rem)]">
              <MapComponent restaurants={RESTAURANTS} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}