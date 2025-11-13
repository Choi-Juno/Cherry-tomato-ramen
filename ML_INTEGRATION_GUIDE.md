# 🤖 ML 서비스 연동 가이드

## ✅ 완료된 작업

### 1. **Dashboard 페이지** (`app/dashboard/page.tsx`)
- ✅ 목 데이터 (`MOCK_INSIGHTS`) 제거
- ✅ ML API 클라이언트 연동
- ✅ 실시간 AI 인사이트 표시
- ✅ 로딩/에러 상태 UI 추가

### 2. **Insights 페이지** (`app/dashboard/insights/page.tsx`)
- ✅ 목 데이터 제거
- ✅ ML API 클라이언트 연동
- ✅ 탭별 필터링 (전체/절약 기회/주의 필요)
- ✅ 로딩/에러 상태 UI 추가

### 3. **환경 설정**
- ✅ ML API 클라이언트 (`lib/ml/client.ts`) 준비 완료
- ✅ ML 서비스 실행 중 (http://localhost:8000) ✅ Healthy

---

## 🔧 환경 변수 설정

### `.env.local` 파일에 다음 변수 추가:

```env
# ML Service Configuration
NEXT_PUBLIC_ML_API_URL=http://localhost:8000
ML_API_SECRET_KEY=dev-secret-key
```

> **참고**: 
> - `NEXT_PUBLIC_ML_API_URL`: 클라이언트에서 접근 가능한 ML 서비스 URL
> - `ML_API_SECRET_KEY`: ML 서비스 인증 키 (프로덕션에서는 강력한 키 사용)

---

## 🚀 ML 서비스 실행 방법

### 1. ML 서비스 시작

```bash
cd ml-service
source venv/bin/activate
python main.py
```

또는

```bash
cd ml-service
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000
```

### 2. ML 서비스 상태 확인

```bash
curl http://localhost:8000/health
```

**예상 응답**:
```json
{
  "status": "healthy",
  "models_loaded": true
}
```

### 3. Next.js 개발 서버 실행

```bash
npm run dev
```

---

## 📊 AI 인사이트 동작 방식

### 1. **데이터 흐름**

```
사용자 거래 내역 (Supabase)
        ↓
Zustand Store (transactions-store)
        ↓
Dashboard/Insights 페이지
        ↓
ML API 호출 (mlApiClient.generateInsights)
        ↓
FastAPI ML 서비스 (Python)
        ↓
AI 분석 (KMeans, Trend, Overspending)
        ↓
인사이트 반환 & UI 표시
```

### 2. **분석 항목**

- 🎯 **소비 페르소나**: 균형잡힌 소비자, 식생활 중심형, 절약형 등
- 📈 **트렌드 분석**: 최근 3개월 소비 증감 추세
- ⚠️ **과소비 위험 예측**: 카테고리별 예산 초과 가능성
- 💡 **절약 기회 발견**: AI가 추천하는 절약 방법

---

## 🧪 테스트 방법

### 1. **거래 내역 추가**

1. Dashboard 우측 하단 **+ 버튼** 클릭
2. 지출 정보 입력 (금액, 카테고리, 내용 등)
3. **저장하기** 클릭

### 2. **AI 인사이트 확인**

- **Dashboard 홈**: AI 인사이트 섹션에 최대 3개 표시
- **Insights 페이지**: 전체 인사이트 및 탭별 필터링

### 3. **예상 결과**

#### ✅ 거래 내역이 **있을 때**:
```
🤖 AI가 당신의 소비 패턴을 분석하고 있습니다...
↓
💡 AI 인사이트 표시
- 식비 지출이 증가하고 있어요
- 교통비 절약 기회
- 당신의 소비 패턴: 균형잡힌 소비자 🎯
```

#### ⚠️ 거래 내역이 **없을 때**:
```
💡 지출 내역을 추가하면 AI가 인사이트를 제공합니다
```

#### ❌ ML 서비스가 **실행되지 않았을 때**:
```
⚠️ AI 인사이트를 불러올 수 없습니다. 잠시 후 다시 시도해주세요.
```

---

## 🐛 문제 해결

### 1. "AI 인사이트를 불러올 수 없습니다" 에러

**원인**:
- ML 서비스가 실행되지 않음
- 환경 변수가 설정되지 않음
- 네트워크 연결 문제

**해결 방법**:
```bash
# 1. ML 서비스 상태 확인
curl http://localhost:8000/health

# 2. ML 서비스가 실행되지 않았다면 시작
cd ml-service
source venv/bin/activate
python main.py

# 3. .env.local 파일 확인
# NEXT_PUBLIC_ML_API_URL=http://localhost:8000
# ML_API_SECRET_KEY=dev-secret-key

# 4. Next.js 재시작
npm run dev
```

### 2. "User not authenticated" 에러

**원인**: 로그인하지 않음

**해결 방법**:
1. 로그아웃 후 다시 로그인
2. 테스트 계정 사용:
   - Email: `test@example.com`
   - Password: `test123456`

### 3. CORS 에러

**원인**: ML 서비스와 Next.js 간 CORS 설정 문제

**해결 방법**:
`ml-service/main.py`에 CORS 설정 추가:
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 📝 다음 단계

### 프로덕션 배포 준비:

1. **환경 변수 설정**:
   ```env
   NEXT_PUBLIC_ML_API_URL=https://your-ml-service.run.app
   ML_API_SECRET_KEY=your-strong-secret-key
   ```

2. **ML 서비스 배포** (Google Cloud Run):
   ```bash
   cd ml-service
   gcloud run deploy ai-spending-coach-ml \
     --source . \
     --region asia-northeast3 \
     --set-env-vars ML_API_SECRET_KEY=your-strong-secret-key
   ```

3. **Next.js 배포** (Vercel):
   - Vercel Dashboard에서 환경 변수 설정
   - `NEXT_PUBLIC_ML_API_URL`, `ML_API_SECRET_KEY` 추가
   - 자동 배포

---

## 🎉 결과

- ✅ **목 데이터 완전 제거**
- ✅ **실시간 AI 인사이트 제공**
- ✅ **ML 서비스 완전 연동**
- ✅ **사용자 경험 개선** (로딩/에러 상태 표시)

**이제 프로젝트에 목 데이터가 없습니다!** 🚀

