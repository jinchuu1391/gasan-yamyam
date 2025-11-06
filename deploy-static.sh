#!/bin/bash

# 정적 사이트 빌드 및 배포 스크립트
# 로컬에서 실행하여 Cloud Build로 빌드 후 Cloud Storage에 배포

PROJECT_ID="gasan-yamyam"

echo "🚀 Starting static site deployment..."
echo ""

# 현재 git 브랜치 확인
CURRENT_BRANCH=$(git branch --show-current)
echo "📌 Current branch: $CURRENT_BRANCH"

# 변경사항 확인
if [[ -n $(git status -s) ]]; then
  echo "⚠️  Warning: You have uncommitted changes"
  git status -s
  echo ""
  read -p "Continue anyway? (y/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled"
    exit 1
  fi
fi

echo ""
echo "🔨 Submitting build to Cloud Build..."

# Cloud Build 실행
gcloud builds submit \
  --config=cloudbuild.yaml \
  --project=$PROJECT_ID

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Deployment completed successfully!"
  echo ""
  echo "🌐 Your site is available at:"
  echo "   http://34.49.240.114"
  echo ""
  echo "📊 Build history:"
  echo "   https://console.cloud.google.com/cloud-build/builds?project=$PROJECT_ID"
else
  echo ""
  echo "❌ Deployment failed"
  exit 1
fi
