#!/bin/bash

# Google Cloud CDN 설정 스크립트
PROJECT_ID="gasan-yamyam"
BUCKET_NAME="gasan-yamyam-web"
BACKEND_NAME="gasan-yamyam-backend"
URL_MAP_NAME="gasan-yamyam-url-map"
TARGET_PROXY_NAME="gasan-yamyam-target-proxy"
FORWARDING_RULE_NAME="gasan-yamyam-forwarding-rule"
IP_NAME="gasan-yamyam-ip"

echo "🌐 Setting up Load Balancer + CDN..."

# 1. 백엔드 버킷 생성
echo "📦 Creating backend bucket..."
gcloud compute backend-buckets create $BACKEND_NAME \
  --gcs-bucket-name=$BUCKET_NAME \
  --enable-cdn \
  --project=$PROJECT_ID

# 2. URL 맵 생성
echo "🗺️ Creating URL map..."
gcloud compute url-maps create $URL_MAP_NAME \
  --default-backend-bucket=$BACKEND_NAME \
  --project=$PROJECT_ID

# 3. HTTP 타겟 프록시 생성
echo "🎯 Creating target HTTP proxy..."
gcloud compute target-http-proxies create $TARGET_PROXY_NAME \
  --url-map=$URL_MAP_NAME \
  --project=$PROJECT_ID

# 4. 정적 IP 주소 예약
echo "📍 Reserving static IP address..."
gcloud compute addresses create $IP_NAME \
  --ip-version=IPV4 \
  --global \
  --project=$PROJECT_ID

# IP 주소 가져오기
IP_ADDRESS=$(gcloud compute addresses describe $IP_NAME \
  --format="get(address)" \
  --global \
  --project=$PROJECT_ID)

echo "✅ Reserved IP: $IP_ADDRESS"

# 5. 전역 포워딩 규칙 생성
echo "🔀 Creating forwarding rule..."
gcloud compute forwarding-rules create $FORWARDING_RULE_NAME \
  --address=$IP_NAME \
  --global \
  --target-http-proxy=$TARGET_PROXY_NAME \
  --ports=80 \
  --project=$PROJECT_ID

echo ""
echo "✅ Load Balancer + CDN setup completed!"
echo "🌐 Your site will be available at: http://$IP_ADDRESS"
echo ""
echo "📋 Next steps:"
echo "1. Wait 5-10 minutes for propagation"
echo "2. Test: curl -I http://$IP_ADDRESS"
echo "3. (Optional) Set up custom domain with Cloud DNS"
echo "4. (Optional) Add HTTPS with SSL certificate"
