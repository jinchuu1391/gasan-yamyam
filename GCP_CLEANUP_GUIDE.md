# GCP 리소스 정리 가이드

Vercel로 마이그레이션 후 Google Cloud Platform 리소스를 정리하는 방법입니다.

## 🗑️ 삭제해야 할 GCP 리소스

### 1. Cloud CDN & Load Balancer (월 $18 절약!)

```bash
# 1. URL Map 삭제
gcloud compute url-maps delete gasan-yamyam-url-map --global

# 2. Target HTTP Proxy 삭제
gcloud compute target-http-proxies delete gasan-yamyam-http-proxy --global

# 3. Backend Bucket 삭제
gcloud compute backend-buckets delete gasan-yamyam-backend --global

# 4. Forwarding Rule 삭제
gcloud compute forwarding-rules delete gasan-yamyam-forwarding-rule --global

# 5. IP Address 삭제 (선택사항)
gcloud compute addresses delete gasan-yamyam-ip --global
```

### 2. Cloud Storage Bucket

```bash
# 버킷 내용 확인 후 삭제
gsutil ls gs://gasan-yamyam-web/

# 버킷 완전 삭제
gsutil -m rm -r gs://gasan-yamyam-web/
```

### 3. Cloud Build 트리거 비활성화

```bash
# Cloud Build 트리거 목록 확인
gcloud builds triggers list

# 트리거 삭제 (있다면)
gcloud builds triggers delete <TRIGGER_ID>
```

### 4. Secret Manager (API 키 보관용)

```bash
# Secret 삭제 (Vercel에 환경변수 설정 후)
gcloud secrets delete gemini-api-key
```

### 5. 서비스 계정

```bash
# 서비스 계정 목록 확인
gcloud iam service-accounts list

# GitHub Actions용 서비스 계정 삭제
gcloud iam service-accounts delete <SERVICE_ACCOUNT_EMAIL>
```

## 🧹 로컬 파일 정리

Vercel 마이그레이션 후 삭제해도 되는 파일들:

```bash
# GCP 설정 파일 삭제
rm cloudbuild.yaml
rm service-account.json  # ⚠️ 민감 정보이므로 반드시 삭제

# GitHub Actions (선택사항 - Vercel 자동 배포 사용 시)
rm -rf .github/workflows/deploy.yml

# Git에서도 제거
git rm cloudbuild.yaml service-account.json
git commit -m "chore: Remove GCP config files (migrated to Vercel)"
```

## 💰 예상 비용 절감

| 항목 | GCP 비용 | Vercel 비용 |
|-----|---------|-----------|
| CDN + Load Balancer | $18/월 | $0 (무료) |
| Cloud Storage | $0.5/월 | $0 (무료) |
| Cloud Build | $0.5/월 | $0 (무료) |
| GitHub Actions | $0.5/월 | $0 (무료) |
| **총계** | **$19.5/월** | **$0/월** |

**연간 약 $234 (약 30만원) 절약!** 🎉

## ⚠️ 주의사항

1. **백업 확인**: 삭제 전에 중요한 데이터가 있는지 확인하세요.
2. **순서 지키기**: Load Balancer 관련 리소스는 의존성 순서대로 삭제해야 합니다.
3. **Vercel 배포 성공 확인**: Vercel 배포가 정상 동작하는지 확인 후 GCP 리소스를 삭제하세요.
4. **프로젝트 전체 삭제**: GCP 프로젝트를 완전히 삭제하려면:
   ```bash
   gcloud projects delete gasan-yamyam
   ```

## 🔍 삭제 확인

```bash
# Load Balancer 확인
gcloud compute forwarding-rules list

# Storage 확인
gsutil ls

# Cloud Build 확인
gcloud builds list --limit=5

# 활성화된 API 확인
gcloud services list --enabled
```

모든 리소스가 삭제되었다면 GCP 콘솔에서도 확인해보세요:
- https://console.cloud.google.com/storage/browser
- https://console.cloud.google.com/net-services/loadbalancing/loadBalancers/list
- https://console.cloud.google.com/cloud-build/builds

## 📝 체크리스트

- [ ] Vercel 배포 성공 확인
- [ ] Vercel Cron Job 동작 확인
- [ ] Load Balancer & CDN 삭제
- [ ] Cloud Storage 버킷 삭제
- [ ] Secret Manager 정리
- [ ] 서비스 계정 삭제
- [ ] 로컬 GCP 설정 파일 삭제
- [ ] Git 히스토리에서 민감정보 제거 (service-account.json)
- [ ] GCP 프로젝트 삭제 또는 비활성화
- [ ] 최종 비용 확인 (며칠 후 GCP Billing 확인)
