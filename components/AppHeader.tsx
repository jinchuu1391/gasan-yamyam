import { List, Map, Mail } from 'lucide-react';

type ViewMode = 'list' | 'map';

interface AppHeaderProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export default function AppHeader({ viewMode, onViewModeChange }: AppHeaderProps) {
  return (
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
                onClick={() => onViewModeChange('list')}
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
                onClick={() => onViewModeChange('map')}
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
  );
}
