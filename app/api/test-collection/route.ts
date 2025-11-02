import { NextResponse } from 'next/server';

// 테스트용 메뉴 수집 트리거
export async function POST() {
  try {
    console.log('Test menu collection triggered');
    
    // 메뉴 수집 API 호출
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/collect-menus`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const result = await response.json();
      return NextResponse.json({
        message: 'Test menu collection completed successfully',
        result
      });
    } else {
      const error = await response.text();
      return NextResponse.json({ 
        error: 'Menu collection failed',
        details: error
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Error in test menu collection:', error);
    return NextResponse.json({ 
      error: 'Test menu collection failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// 현재 메뉴 데이터 조회
export async function GET() {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/collect-menus`);
    
    if (response.ok) {
      const data = await response.json();
      return NextResponse.json(data);
    } else {
      return NextResponse.json({ 
        message: 'No menu data available',
        restaurants: []
      }, { status: 404 });
    }
  } catch (error) {
    console.error('Error fetching menu data:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch menu data' 
    }, { status: 500 });
  }
}