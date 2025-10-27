import { Restaurant } from '@/lib/types';
import { MapPin } from 'lucide-react';

interface RestaurantListProps {
  restaurants: Restaurant[];
}

export default function RestaurantList({ restaurants }: RestaurantListProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border md:h-full overflow-hidden">
      <div className="p-4 border-b bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-900">식당 목록</h2>
        <p className="text-sm text-gray-600 mt-1">총 {restaurants.length}개 식당</p>
      </div>
      
      <div className="overflow-y-auto md:h-full pb-4 space-y-0">
        {restaurants.map((restaurant) => (
          <div key={restaurant.id} className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-lg font-medium text-gray-900">{restaurant.name}</h3>
              <div className="hidden sm:flex items-center text-xs text-gray-500">
                <MapPin size={12} className="mr-1" />
                {restaurant.coordinates[1].toFixed(4)}, {restaurant.coordinates[0].toFixed(4)}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">오늘의 메뉴</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                {restaurant.todaysMenu.map((menu, index) => (
                  <span
                    key={index}
                    className="inline-block px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded-full text-center"
                  >
                    {menu}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}