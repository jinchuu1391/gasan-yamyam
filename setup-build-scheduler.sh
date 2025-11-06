#!/bin/bash

# Cloud Scheduler를 통한 Cloud Build 자동 트리거 설정
# 매일 오전 10시 10분(평일)에 메뉴 데이터를 갱신합니다

PROJECT_ID="gasan-yamyam"
LOCATION="asia-northeast3"
JOB_NAME="daily-menu-build"
SCHEDULE="10 10 * * 1-5"  # 평일 오전 10시 10분 (월-금)
TIMEZONE="Asia/Seoul"
TOPIC_NAME="trigger-menu-build"

echo "🔧 Setting up Cloud Scheduler for Cloud Build..."

# 1. Pub/Sub 토픽 생성 (이미 있으면 무시)
echo "📮 Creating Pub/Sub topic..."
gcloud pubsub topics create $TOPIC_NAME --project=$PROJECT_ID 2>/dev/null || echo "Topic already exists"

# 2. Cloud Scheduler 작업 생성 (Pub/Sub 방식)
echo "⏰ Creating Cloud Scheduler job..."
gcloud scheduler jobs create pubsub $JOB_NAME \
  --location=$LOCATION \
  --schedule="$SCHEDULE" \
  --time-zone="$TIMEZONE" \
  --topic=$TOPIC_NAME \
  --message-body='{"action":"build-and-deploy"}' \
  --project=$PROJECT_ID

if [ $? -eq 0 ]; then
  echo "✅ Cloud Scheduler job created successfully!"
  echo ""
  echo "📋 Job details:"
  echo "   Name: $JOB_NAME"
  echo "   Schedule: $SCHEDULE ($TIMEZONE)"
  echo "   Target: Pub/Sub topic '$TOPIC_NAME'"
  echo ""
  echo "⚠️  Next steps:"
  echo "   1. GitHub Actions나 로컬에서 'gcloud builds submit'을 주기적으로 실행하거나"
  echo "   2. Cloud Functions를 만들어서 Pub/Sub 메시지를 받으면 빌드를 트리거하도록 설정"
  echo ""
  echo "🧪 To test manually, run:"
  echo "   gcloud scheduler jobs run $JOB_NAME --location=$LOCATION --project=$PROJECT_ID"
  echo ""
  echo "💡 Simpler alternative: Just run this command daily from your local machine or GitHub Actions:"
  echo "   gcloud builds submit --config=cloudbuild.yaml --project=$PROJECT_ID"
else
  echo "❌ Failed to create Cloud Scheduler job"
  exit 1
fi
