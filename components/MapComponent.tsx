'use client';

import { useEffect, useRef } from 'react';
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
import { GASAN_CENTER_COORDINATES } from '@/lib/data';

interface MapComponentProps {
  restaurants: Restaurant[];
}

export default function MapComponent({ restaurants }: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // 지도 초기화
    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      view: new View({
        center: fromLonLat(GASAN_CENTER_COORDINATES),
        zoom: 16,
      }),
    });

    // 마커 레이어 생성
    const vectorSource = new VectorSource();
    
    restaurants.forEach((restaurant) => {
      const feature = new Feature({
        geometry: new Point(fromLonLat(restaurant.coordinates)),
        name: restaurant.name,
        restaurant: restaurant,
      });

      // 마커 스타일 설정
      feature.setStyle(
        new Style({
          image: new Icon({
            anchor: [0.5, 1],
            anchorXUnits: 'fraction',
            anchorYUnits: 'fraction',
            src: 'data:image/svg+xml;base64,' + btoa(`
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22S19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9S10.62 6.5 12 6.5S14.5 7.62 14.5 9S13.38 11.5 12 11.5Z" fill="#3B82F6"/>
              </svg>
            `),
            scale: 1.5,
          }),
          text: new Text({
            text: restaurant.name,
            offsetY: 15,
            fill: new Fill({
              color: '#374151',
            }),
            stroke: new Stroke({
              color: '#ffffff',
              width: 3,
            }),
            font: 'bold 12px Arial',
          }),
        })
      );

      vectorSource.addFeature(feature);
    });

    const vectorLayer = new VectorLayer({
      source: vectorSource,
    });

    map.addLayer(vectorLayer);

    // 마커 클릭 이벤트
    map.on('click', (event) => {
      const feature = map.forEachFeatureAtPixel(event.pixel, (feature) => feature);
      if (feature) {
        const restaurant = feature.get('restaurant') as Restaurant;
        alert(`${restaurant.name}\n오늘의 메뉴: ${restaurant.todaysMenu.join(', ')}`);
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
  }, [restaurants]);

  return (
    <div className="bg-white rounded-lg shadow-sm border h-full overflow-hidden">
      <div className="p-4 border-b bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-900">식당 위치</h2>
        <p className="text-sm text-gray-600 mt-1">지도에서 마커를 클릭하면 상세 정보를 볼 수 있습니다</p>
      </div>
      <div ref={mapRef} className="w-full h-full" style={{ minHeight: '400px' }} />
    </div>
  );
}