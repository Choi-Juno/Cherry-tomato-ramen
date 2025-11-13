# 🚀 프로덕션 배포 가이드

## 📋 **배포 아키텍처**

```
┌─────────────────────┐
│   사용자 브라우저    │
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│  Next.js Frontend   │ ← Vercel (자동 배포)
│  (localhost:3000)   │
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│  FastAPI ML Service │ ← Google Cloud Run (수동 배포)
│  (ML API)           │
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│  Supabase Database  │ ← 이미 클라우드에 있음
│  (PostgreSQL)       │
└─────────────────────┘
```

---

## 🏆 **방법 1: Google Cloud Run (추천)**

### 장점
- ✅ 서버리스 - 서버 관리 불필요
- ✅ 자동 스케일링 (0 → N 인스턴스)
- ✅ 사용한 만큼만 과금
- ✅ 무료 할당량: 월 200만 요청
- ✅ Docker 기반 (이미 준비됨)

### 비용 예상
- **무료 범위**: 월 200만 요청, CPU 180,000 vCPU초
- **학생 프로젝트**: 거의 무료 ($0-5/월)
- **실제 서비스**: $10-30/월

---

## 📦 **1단계: Google Cloud 프로젝트 설정**

### 1.1 Google Cloud 계정 생성
1. https://console.cloud.google.com/ 접속
2. Google 계정으로 로그인
3. 신규 사용자: **$300 크레딧** 제공 (90일)

### 1.2 프로젝트 생성
```bash
# Google Cloud SDK 설치 (Mac)
brew install --cask google-cloud-sdk

# 또는 공식 설치 방법
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# 로그인
gcloud auth login

# 프로젝트 생성
gcloud projects create cherry-tomato-ramen --name="Cherry Tomato Ramen"

# 프로젝트 설정
gcloud config set project cherry-tomato-ramen

# Cloud Run API 활성화
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

---

## 🐳 **2단계: Docker 이미지 빌드 & 배포**

### 2.1 Dockerfile 확인

`ml-service/Dockerfile`가 이미 준비되어 있습니다:
```dockerfile
FROM python:3.13-slim-bookworm
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 2.2 Cloud Run에 배포

```bash
# ML 서비스 디렉토리로 이동
cd ml-service

# Cloud Run에 직접 배포 (권장 - 가장 간단)
gcloud run deploy ai-spending-coach-ml \
  --source . \
  --region asia-northeast3 \
  --platform managed \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2 \
  --min-instances 0 \
  --max-instances 10 \
  --set-env-vars ML_API_SECRET_KEY=your-production-secret-key-here

# 배포 완료 후 URL 출력
# 예: https://ai-spending-coach-ml-xxxxx-an.a.run.app
```

**참고**: 
- `--allow-unauthenticated`: 인증 없이 접근 가능 (API Key는 별도 관리)
- `--min-instances 0`: 트래픽 없으면 0개 인스턴스 (비용 절감)
- `--max-instances 10`: 최대 10개까지 자동 확장
- `--region asia-northeast3`: 서울 리전 (가장 빠름)

### 2.3 배포 URL 확인

```bash
gcloud run services describe ai-spending-coach-ml \
  --region asia-northeast3 \
  --format='value(status.url)'
```

출력 예시:
```
https://ai-spending-coach-ml-xxxxx-an.a.run.app
```

---

## 🔐 **3단계: 환경 변수 설정**

### 3.1 ML 서비스 환경 변수 업데이트

```bash
gcloud run services update ai-spending-coach-ml \
  --region asia-northeast3 \
  --set-env-vars ML_API_SECRET_KEY=production-super-secret-key-12345
```

### 3.2 Next.js 환경 변수 (Vercel Dashboard)

Vercel Dashboard → Settings → Environment Variables:

```env
# Production
NEXT_PUBLIC_ML_API_URL=https://ai-spending-coach-ml-xxxxx-an.a.run.app
ML_API_SECRET_KEY=production-super-secret-key-12345

# Preview (optional)
NEXT_PUBLIC_ML_API_URL=https://ai-spending-coach-ml-xxxxx-an.a.run.app
ML_API_SECRET_KEY=production-super-secret-key-12345
```

---

## ✅ **4단계: 테스트**

### 4.1 Health Check

```bash
curl https://ai-spending-coach-ml-xxxxx-an.a.run.app/health
```

예상 응답:
```json
{"status":"healthy","models_loaded":true}
```

### 4.2 API 테스트

```bash
curl -X POST "https://ai-spending-coach-ml-xxxxx-an.a.run.app/predict/insights" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: production-super-secret-key-12345" \
  -d '{
    "user_id": "test",
    "transactions": [
      {"date": "2025-01-10", "amount": 10000, "category": "food", "description": "테스트"}
    ],
    "current_month_budget": {"food": 300000}
  }'
```

---

## 🔄 **5단계: CI/CD 설정 (선택사항)**

### GitHub Actions로 자동 배포

`.github/workflows/deploy-ml.yml`:

```yaml
name: Deploy ML Service to Cloud Run

on:
  push:
    branches:
      - main
    paths:
      - 'ml-service/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - id: auth
        uses: google-github-actions/auth@v1
        with:
          credentials_json: ${{ secrets.GCP_SA_KEY }}
      
      - name: Set up Cloud SDK
        uses: google-github-actions/setup-gcloud@v1
      
      - name: Deploy to Cloud Run
        run: |
          cd ml-service
          gcloud run deploy ai-spending-coach-ml \
            --source . \
            --region asia-northeast3 \
            --platform managed \
            --allow-unauthenticated \
            --set-env-vars ML_API_SECRET_KEY=${{ secrets.ML_API_SECRET_KEY }}
```

---

## 💰 **비용 관리**

### Cloud Run 무료 할당량 (월)
- ✅ 200만 요청
- ✅ 360,000 GB초 메모리
- ✅ 180,000 vCPU초
- ✅ 1GB 아웃바운드 네트워크

### 예상 비용 (학생 프로젝트)
```
일일 요청: 100회
월 요청: 3,000회
메모리: 2GB × 평균 1초 × 3,000 = 6,000 GB초

→ 무료 범위 내 (200만 요청까지)
→ 월 비용: $0
```

### 실제 서비스 (가정)
```
일일 요청: 10,000회
월 요청: 300,000회
메모리: 2GB × 평균 2초 × 300,000 = 600,000 GB초

→ 무료 범위 초과분
→ 월 비용: 약 $5-15
```

---

## 📊 **모니터링**

### Cloud Run 대시보드
https://console.cloud.google.com/run

확인 사항:
- ✅ 요청 수
- ✅ 응답 시간
- ✅ 에러율
- ✅ 인스턴스 수
- ✅ 비용

### 로그 확인

```bash
gcloud run services logs read ai-spending-coach-ml \
  --region asia-northeast3 \
  --limit 50
```

---

## 🔧 **문제 해결**

### 1. 빌드 실패

**에러**: `ModuleNotFoundError`

**해결**:
```bash
# requirements.txt 확인
cat ml-service/requirements.txt

# 로컬 테스트
cd ml-service
docker build -t test-ml .
docker run -p 8000:8000 test-ml
```

### 2. 메모리 부족

**에러**: `Container exceeded memory limit`

**해결**:
```bash
gcloud run services update ai-spending-coach-ml \
  --region asia-northeast3 \
  --memory 4Gi  # 2Gi → 4Gi로 증가
```

### 3. Cold Start 느림

**문제**: 첫 요청이 느림 (5-10초)

**해결**:
```bash
# 최소 1개 인스턴스 유지 (비용 증가)
gcloud run services update ai-spending-coach-ml \
  --region asia-northeast3 \
  --min-instances 1  # 0 → 1

# 또는 CPU always-allocated
gcloud run services update ai-spending-coach-ml \
  --region asia-northeast3 \
  --cpu-throttling \
  --no-cpu-throttling  # CPU 항상 활성
```

---

## 🌐 **대안: Railway (가장 쉬운 방법)**

### 장점
- ✅ GitHub 연동 자동 배포
- ✅ 무료 플랜: $5 크레딧/월
- ✅ 설정 거의 없음
- ✅ CLI 없이 웹에서 모두 가능

### 배포 방법

1. **Railway 가입**
   - https://railway.app 접속
   - GitHub 계정으로 로그인

2. **New Project → Deploy from GitHub**
   - Repository 선택
   - Root Directory: `ml-service`

3. **환경 변수 설정**
   ```
   ML_API_SECRET_KEY=your-secret-key
   PORT=8000
   ```

4. **배포 완료**
   - URL: `https://your-service.railway.app`

---

## 🌐 **대안: Render**

### 장점
- ✅ 무료 플랜 있음 (750시간/월)
- ✅ GitHub 자동 배포
- ✅ Docker 지원

### 배포 방법

1. **Render 가입**
   - https://render.com 접속

2. **New → Web Service**
   - Connect Repository
   - Root Directory: `ml-service`
   - Docker 선택

3. **환경 변수 설정**
   ```
   ML_API_SECRET_KEY=your-secret-key
   ```

4. **무료 플랜 선택**
   - 15분 비활성 시 슬립 모드 (Cold Start 발생)

---

## 📝 **프로덕션 체크리스트**

### 배포 전
- [ ] `requirements.txt` 최신화
- [ ] `Dockerfile` 테스트
- [ ] 로컬에서 Docker 빌드 성공
- [ ] API 키 생성 (강력한 랜덤 키)
- [ ] `.env.local` 삭제 (프로덕션에선 사용 안 함)

### 배포 후
- [ ] Health check 성공
- [ ] API 테스트 성공
- [ ] CORS 설정 확인
- [ ] Vercel 환경 변수 설정
- [ ] Next.js 재배포
- [ ] 브라우저에서 실제 테스트

### 보안
- [ ] API 키 강력하게 설정
- [ ] 환경 변수로만 관리 (코드에 하드코딩 금지)
- [ ] CORS origins 제한 (프로덕션에선 `["*"]` 대신 실제 도메인)
- [ ] Rate Limiting 설정 (FastAPI middleware)

---

## 🎓 **추천 순서**

### 학생 프로젝트 / 포트폴리오:
1. **Google Cloud Run** (무료 할당량 크고, 이력서에 좋음)
2. Railway (가장 쉬움)
3. Render (무료 플랜)

### 실제 서비스:
1. **Google Cloud Run** (스케일링 좋음)
2. AWS Lambda + API Gateway (AWS 생태계)
3. Azure Container Apps (Microsoft 생태계)

---

## 💡 **다음 단계**

1. **지금 바로**: Railway로 배포 (5분 소요)
2. **이번 주**: Google Cloud Run 시도 (학습 목적)
3. **나중에**: CI/CD 설정 (자동 배포)

---

## 📞 **도움이 필요하면**

1. Google Cloud 콘솔: https://console.cloud.google.com
2. Railway 대시보드: https://railway.app
3. 문서: 이 파일 참조
4. 질문: 언제든지 물어보세요!

---

**추천: 우선 Railway로 빠르게 배포하고, 나중에 Google Cloud Run으로 마이그레이션하세요!** 🚀

