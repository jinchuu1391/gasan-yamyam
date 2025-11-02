#!/bin/bash

# 간편 배포 스크립트 (push-deploy.sh)
# Git push와 동시에 배포까지 한 번에!

echo "🚀 Git Push + 자동 배포를 시작합니다..."

# 1. Git 커밋 및 푸시
if [ $# -eq 0 ]; then
    echo "💬 커밋 메시지를 입력하세요:"
    read -r commit_message
else
    commit_message="$*"
fi

echo "📝 Git 커밋 및 푸시 중..."
git add .
git commit -m "$commit_message"
git push origin main

if [ $? -ne 0 ]; then
    echo "❌ Git push에 실패했습니다."
    exit 1
fi

# 2. Cloud Build로 자동 배포
echo "☁️ Cloud Build로 배포를 시작합니다..."
gcloud builds submit --config=cloudbuild.yaml

if [ $? -eq 0 ]; then
    echo "✅ 배포가 완료되었습니다!"
    echo "🌐 서비스 URL: https://gasan-yamyam-869358620809.asia-northeast3.run.app"
    
    # 간단한 헬스체크
    echo "🩺 서비스 상태 확인 중..."
    sleep 5
    response=$(curl -s -o /dev/null -w "%{http_code}" https://gasan-yamyam-869358620809.asia-northeast3.run.app)
    if [ "$response" = "200" ]; then
        echo "✅ 서비스가 정상적으로 작동합니다!"
    else
        echo "⚠️ 서비스 응답: HTTP $response"
    fi
else
    echo "❌ 배포에 실패했습니다."
    exit 1
fi