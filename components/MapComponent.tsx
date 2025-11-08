'use client';

import { useEffect, useRef, forwardRef, useImperativeHandle, useState } from 'react';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { Feature } from 'ol';
import { Point } from 'ol/geom';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Style, Icon, Text, Fill, Stroke } from 'ol/style';
import { fromLonLat } from 'ol/proj';
import { Restaurant } from '@/lib/types';
import { MapPin, Loader2 } from 'lucide-react';

const GASAN_CENTER_COORDINATES: [number, number] = [126.88254198968177, 37.48034809363842];

interface MapComponentProps {
  restaurants?: Restaurant[];
  selectedRestaurantId?: string | null;
  onRestaurantSelect?: (restaurantId: string) => void;
}

export interface MapComponentRef {
  moveToRestaurant: (restaurantId: string) => void;
}

const MapComponent = forwardRef<MapComponentRef, MapComponentProps>(function MapComponent(
  { restaurants, selectedRestaurantId, onRestaurantSelect },
  ref
) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<Map | null>(null);
  const vectorLayerRef = useRef<VectorLayer<VectorSource> | null>(null);
  const userLocationLayerRef = useRef<VectorLayer<VectorSource> | null>(null);
  
  const [isLocating, setIsLocating] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  // 내 위치 찾기 함수
  const moveToMyLocation = async () => {
    if (!mapInstanceRef.current) return;
    
    setIsLocating(true);
    
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Geolocation is not supported by this browser.'));
          return;
        }
        
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        });
      });
      
      const { latitude, longitude } = position.coords;
      const userCoords: [number, number] = [longitude, latitude];
      setUserLocation(userCoords);
      
      // 지도를 내 위치로 이동
      const view = mapInstanceRef.current.getView();
      view.animate({
        center: fromLonLat(userCoords),
        zoom: 17,
        duration: 1000,
      });
      
      // 내 위치 마커 추가/업데이트
      updateUserLocationMarker(userCoords);
      
    } catch (error) {
      console.error('Error getting location:', error);
      alert('위치를 가져올 수 없습니다. 위치 권한을 확인해주세요.');
    } finally {
      setIsLocating(false);
    }
  };

  // 사용자 위치 마커 업데이트
  const updateUserLocationMarker = (coords: [number, number]) => {
    if (!mapInstanceRef.current) return;
    
    // 기존 사용자 위치 레이어 제거
    if (userLocationLayerRef.current) {
      mapInstanceRef.current.removeLayer(userLocationLayerRef.current);
    }
    
    // 새 사용자 위치 마커 생성
    const userFeature = new Feature({
      geometry: new Point(fromLonLat(coords)),
      name: '내 위치',
    });
    
    userFeature.setStyle(new Style({
      image: new Icon({
        anchor: [0.5, 0.5],
        anchorXUnits: 'fraction',
        anchorYUnits: 'fraction',
        src: 'data:image/svg+xml;base64,' + btoa(`
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="8" fill="#10B981" stroke="#ffffff" stroke-width="3"/>
            <circle cx="12" cy="12" r="3" fill="#ffffff"/>
          </svg>
        `),
        scale: 1.5,
      }),
      text: new Text({
        text: '내 위치',
        offsetY: -30,
        fill: new Fill({
          color: '#10B981',
        }),
        stroke: new Stroke({
          color: '#ffffff',
          width: 3,
        }),
        font: 'bold 12px Arial',
      }),
    }));
    
    const userVectorSource = new VectorSource();
    userVectorSource.addFeature(userFeature);
    
    const userLocationLayer = new VectorLayer({
      source: userVectorSource,
    });
    
    mapInstanceRef.current.addLayer(userLocationLayer);
    userLocationLayerRef.current = userLocationLayer;
  };

  // 외부에서 호출할 수 있는 함수들
  useImperativeHandle(ref, () => ({
    moveToRestaurant: (restaurantId: string) => {
      if (!mapInstanceRef.current) return;
      
      const restaurant = restaurants?.find(r => r.id === restaurantId);
      if (restaurant) {
        const view = mapInstanceRef.current.getView();
        view.animate({
          center: fromLonLat(restaurant.coordinates),
          zoom: 18,
          duration: 1000,
        });
      }
    },
  }), [restaurants]);

  // 마커 스타일 생성 함수
  const createMarkerStyle = (restaurant: Restaurant, isSelected: boolean) => {
    return new Style({
      image: new Icon({
        anchor: [0.5, 1],
        anchorXUnits: 'fraction',
        anchorYUnits: 'fraction',
        src: 'data:image/svg+xml;base64,' + btoa(`
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22S19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9S10.62 6.5 12 6.5S14.5 7.62 14.5 9S13.38 11.5 12 11.5Z" fill="${isSelected ? '#EF4444' : '#3B82F6'}"/>
          </svg>
        `),
        scale: isSelected ? 2.0 : 1.5,
      }),
      text: new Text({
        text: restaurant.name,
        offsetY: 15,
        fill: new Fill({
          color: isSelected ? '#EF4444' : '#374151',
        }),
        stroke: new Stroke({
          color: '#ffffff',
          width: 3,
        }),
        font: `${isSelected ? 'bold 14px' : 'bold 12px'} Arial`,
      }),
    });
  };

  // 지도 초기화 (한 번만 실행)
  useEffect(() => {
    if (!mapRef.current) return;

    // 초기 중심점을 내 위치로 설정 시도
    const initializeMapWithLocation = async () => {
      let initialCenter = fromLonLat(GASAN_CENTER_COORDINATES);
      let initialZoom = 16;
      
      // 내 위치 가져오기 시도
      try {
        if (navigator.geolocation) {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 3000, // 빠른 초기화를 위해 3초로 단축
              maximumAge: 60000 // 1분 캐시 허용
            });
          });
          
          const { latitude, longitude } = position.coords;
          const userCoords: [number, number] = [longitude, latitude];
          setUserLocation(userCoords);
          initialCenter = fromLonLat(userCoords);
          initialZoom = 15; // 내 위치일 때는 약간 더 넓게
          
          console.log('지도를 사용자 위치로 초기화:', userCoords);
        }
      } catch (error) {
        console.log('사용자 위치를 가져올 수 없어 기본 위치로 설정:', error);
        // 실패해도 계속 진행 (기본 좌표 사용)
      }

      // 지도 초기화
      const map = new Map({
        target: mapRef.current!,
        layers: [
          new TileLayer({
            source: new OSM(),
          }),
        ],
        view: new View({
          center: initialCenter,
          zoom: initialZoom,
        }),
      });

      // 마커 레이어 생성
      const vectorSource = new VectorSource();
      
      restaurants?.forEach((restaurant) => {
        const feature = new Feature({
          geometry: new Point(fromLonLat(restaurant.coordinates)),
          name: restaurant.name,
          restaurant: restaurant,
        });

        // 초기 스타일 설정 (모두 선택되지 않은 상태)
        feature.setStyle(createMarkerStyle(restaurant, false));
        vectorSource.addFeature(feature);
      });

      const vectorLayer = new VectorLayer({
        source: vectorSource,
      });

      map.addLayer(vectorLayer);
      vectorLayerRef.current = vectorLayer;

      // 내 위치가 있으면 마커 표시
      if (userLocation) {
        updateUserLocationMarker(userLocation);
      }

      // 마커 클릭 이벤트 (애니메이션만)
      map.on('click', (event) => {
        const feature = map.forEachFeatureAtPixel(event.pixel, (feature) => feature);
        if (feature) {
          const restaurant = feature.get('restaurant') as Restaurant;
          onRestaurantSelect?.(restaurant.id);
          // 클릭된 식당으로 애니메이션과 함께 이동
          const view = map.getView();
          view.animate({
            center: fromLonLat(restaurant.coordinates),
            zoom: 18,
            duration: 1000,
          });
        }
      });

      // 마우스 오버 커서 변경
      map.on('pointermove', (event) => {
        const feature = map.forEachFeatureAtPixel(event.pixel, (feature) => feature);
        map.getTargetElement().style.cursor = feature ? 'pointer' : '';
      });

      mapInstanceRef.current = map;

      return () => {
        map.setTarget();
      };
    };

    // 함수 실행
    initializeMapWithLocation();
  }, []);

  // 마커 스타일 업데이트 + 선택된 식당으로 지도 중심 이동
  useEffect(() => {
    if (!vectorLayerRef.current || !mapInstanceRef.current) return;

    const vectorSource = vectorLayerRef.current.getSource();
    if (!vectorSource) return;

    vectorSource.forEachFeature((feature) => {
      const restaurant = feature.get('restaurant') as Restaurant;
      const isSelected = selectedRestaurantId === restaurant.id;
      feature.setStyle(createMarkerStyle(restaurant, isSelected));
    });

    // 선택된 식당이 있으면 해당 위치로 지도 중심 이동
    if (selectedRestaurantId) {
      const selectedRestaurant = restaurants?.find(r => r.id === selectedRestaurantId);
      if (selectedRestaurant) {
        const view = mapInstanceRef.current.getView();
        view.animate({
          center: fromLonLat(selectedRestaurant.coordinates),
          zoom: 18,
          duration: 1000,
        });
      }
    }
  }, [selectedRestaurantId, restaurants]);

  return (
    <div className="bg-white rounded-lg md:rounded-l-none shadow-sm border md:border-l-0 h-full overflow-hidden relative">
      <div ref={mapRef} className="w-full h-full" style={{ minHeight: '400px' }} />
      
      {/* 내 위치로 이동 버튼 */}
      <button
        onClick={moveToMyLocation}
        disabled={isLocating}
        className="absolute top-4 right-4 bg-white hover:bg-gray-50 disabled:bg-gray-100 border border-gray-300 rounded-lg p-3 shadow-lg transition-colors z-10 flex items-center justify-center"
        title="내 위치로 이동"
      >
        {isLocating ? (
          <Loader2 className="w-5 h-5 text-gray-600 animate-spin" />
        ) : (
          <MapPin className="w-5 h-5 text-gray-700" />
        )}
      </button>
    </div>
  );
});

export default MapComponent;