#!/bin/bash

# Google Cloud 배포 스크립트

echo "🚀 Google Cloud 배포를 시작합니다..."

# 1. 프로젝트 ID 설정 (여기를 본인의 프로젝트 ID로 변경하세요)
PROJECT_ID="gasan-yamyam"
REGION="asia-northeast3"  # 서울 리전
SERVICE_NAME="gasan-yamyam"

echo "프로젝트 ID: $PROJECT_ID"
echo "리전: $REGION"

# 2. gcloud 설정
echo "📝 gcloud 설정 중..."
gcloud config set project $PROJECT_ID
gcloud config set run/region $REGION

# 3. API 활성화
echo "🔧 필요한 API들을 활성화합니다..."
gcloud services enable \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  vision.googleapis.com \
  containerregistry.googleapis.com

# 4. Docker 이미지 빌드 및 푸시
echo "🐳 Docker 이미지를 빌드하고 푸시합니다..."
gcloud builds submit --tag gcr.io/$PROJECT_ID/$SERVICE_NAME

# 5. Cloud Run에 배포
echo "☁️ Cloud Run에 배포합니다..."
gcloud run deploy $SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/$SERVICE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --memory 1Gi \
  --cpu 1 \
  --port 3000 \
  --set-env-vars NODE_ENV=production \
  --max-instances 10

echo "✅ 배포가 완료되었습니다!"
echo "🌐 배포된 URL을 확인하세요."