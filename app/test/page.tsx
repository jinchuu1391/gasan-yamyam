'use client';

import { useState } from 'react';

export default function TestPage() {
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testMenuCollection = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('🧪 Starting menu collection test...');
      
      const response = await fetch('/api/test-collection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (response.ok) {
        console.log('✅ Test completed successfully:', data);
        setResult(data);
      } else {
        console.error('❌ Test failed:', data);
        setError(data.error || 'Unknown error');
      }
    } catch (err) {
      console.error('❌ Network error:', err);
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentData = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/collect-menus');
      const data = await response.json();
      
      console.log('📋 Current menu data:', data);
      setResult(data);
    } catch (err) {
      console.error('❌ Error fetching current data:', err);
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">메뉴 수집 테스트</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex gap-4 mb-6">
            <button
              onClick={testMenuCollection}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium"
            >
              {loading ? '실행 중...' : '🧪 메뉴 수집 테스트'}
            </button>
            
            <button
              onClick={getCurrentData}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium"
            >
              📋 현재 데이터 조회
            </button>
          </div>
          
          {loading && (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">처리 중...</p>
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <h3 className="text-red-800 font-medium">오류 발생</h3>
              <p className="text-red-600 mt-1">{error}</p>
            </div>
          )}
          
          {result && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="text-gray-800 font-medium mb-2">결과</h3>
              <pre className="text-sm text-gray-600 overflow-auto max-h-96">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">테스트 설명</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            <li><strong>메뉴 수집 테스트</strong>: 카카오톡 채널에서 메뉴 이미지를 스크래핑하고 Google Vision API로 텍스트를 추출합니다.</li>
            <li><strong>현재 데이터 조회</strong>: 이미 수집된 메뉴 데이터를 조회합니다.</li>
            <li>처리 시간은 네트워크 속도와 이미지 크기에 따라 달라질 수 있습니다.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}