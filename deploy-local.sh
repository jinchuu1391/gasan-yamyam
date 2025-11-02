#!/bin/bash

# 대안 배포 스크립트 - 로컬 Docker 빌드 사용

echo "🚀 Google Cloud 배포를 시작합니다 (로컬 빌드 방식)..."

# 1. 프로젝트 ID 설정
PROJECT_ID="gasan-yamyam"
REGION="asia-northeast3"
SERVICE_NAME="gasan-yamyam"
IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME"

echo "프로젝트 ID: $PROJECT_ID"
echo "리전: $REGION"
echo "이미지: $IMAGE_NAME"

# 2. gcloud 설정
echo "📝 gcloud 설정 중..."
gcloud config set project $PROJECT_ID
gcloud config set run/region $REGION

# 3. Docker 인증 설정
echo "🔐 Docker 인증 설정 중..."
gcloud auth configure-docker

# 4. 로컬에서 Docker 이미지 빌드
echo "🐳 Docker 이미지를 로컬에서 빌드합니다..."
docker build -t $IMAGE_NAME .

if [ $? -ne 0 ]; then
    echo "❌ Docker 빌드에 실패했습니다."
    exit 1
fi

# 5. Container Registry에 푸시
echo "📤 이미지를 Container Registry에 푸시합니다..."
docker push $IMAGE_NAME

if [ $? -ne 0 ]; then
    echo "❌ 이미지 푸시에 실패했습니다."
    exit 1
fi

# 6. Cloud Run에 배포
echo "☁️ Cloud Run에 배포합니다..."
gcloud run deploy $SERVICE_NAME \
  --image $IMAGE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --memory 1Gi \
  --cpu 1 \
  --port 3000 \
  --set-env-vars NODE_ENV=production \
  --max-instances 10

if [ $? -eq 0 ]; then
    echo "✅ 배포가 완료되었습니다!"
    echo "🌐 배포된 URL을 확인하려면 다음 명령어를 실행하세요:"
    echo "   gcloud run services describe $SERVICE_NAME --region=$REGION --format='value(status.url)'"
else
    echo "❌ Cloud Run 배포에 실패했습니다."
    exit 1
fi