#!/bin/bash

# Google Cloud Scheduler 설정 스크립트

PROJECT_ID="gasan-yamyam"  # 실제 프로젝트 ID로 변경
APP_URL="https://gasan-yamyam-869358620809.asia-northeast3.run.app"

echo "🕐 Google Cloud Scheduler 설정을 시작합니다..."

# 1. Cloud Scheduler API 활성화
echo "📝 Cloud Scheduler API를 활성화합니다..."
gcloud services enable cloudscheduler.googleapis.com --project=$PROJECT_ID

# 2. App Engine 앱 생성 (Cloud Scheduler 사용을 위해 필요)
echo "⚙️ App Engine 앱을 생성합니다..."
gcloud app create --region=asia-northeast3 --project=$PROJECT_ID

# 3. 스케줄러 작업 생성 - 평일 오전 10:10 (한국시간)
echo "⏰ 스케줄러 작업을 생성합니다..."
gcloud scheduler jobs create http menu-collection-job \
  --location=asia-northeast3 \
  --schedule="10 10 * * 1-5" \
  --uri="$APP_URL/api/collect-menus" \
  --http-method=POST \
  --time-zone="Asia/Seoul" \
  --description="가산디지털단지 구내식당 메뉴 수집 (평일 오전 10:10)" \
  --project=$PROJECT_ID

echo "✅ Cloud Scheduler 설정이 완료되었습니다!"
echo "📋 생성된 작업:"
gcloud scheduler jobs list --location=asia-northeast3 --project=$PROJECT_ID

echo ""
echo "🔧 다음 단계:"
echo "1. 배포 완료 후 APP_URL을 실제 URL로 수정"
echo "2. 스케줄러 작업 테스트: gcloud scheduler jobs run menu-collection-job --location=asia-northeast3"