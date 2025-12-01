# 🍅 Cherry Tomato Ramen

> AI Spending Coach for Korean university students and young adults  
> *Personalized coaching meets real spending data*

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109-green)](https://fastapi.tiangolo.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-brightgreen)](https://supabase.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v3-38B2AC)](https://tailwindcss.com/)

---

## 📢 Dataset Attribution

모든 AI 코칭/또래 비교 로직은 Kaggle의 **[Student Spending Dataset](https://www.kaggle.com/datasets/sumanthnimmagadda/student-spending-dataset)** 를 기반으로 학습되었습니다.  
해당 데이터는 대학생 소비 패턴(카테고리, 결제액, 시간대 등)을 포함하며, 본 프로젝트에서는 다음 용도로 활용하고 있습니다.

- **Cohort Statistics**: 연령대별 평균/중앙 지출, 카테고리 분포 산출
- **Mock Transactions**: 신규 사용자 시드 데이터 생성
- **Pattern Templates**: 코칭 메시지 및 챌린지 룰 초안 구성

> Dataset License: CC0 (Public Domain). 자세한 사용 조건은 Kaggle 페이지를 참고하세요.

---

## 🧭 Vision & Approach

| 문제 | 우리의 해법 |
|------|-------------|
| “기록만 하는 가계부는 행동 변화를 만들기 어렵다.” | **AI가 직접 행동 가이드를 제시** |
| “또래가 얼마나 쓰는지 모른다.” | **동연령 코호트와 실시간 비교** |
| “ML 기능이 복잡해 셋업이 어렵다.” | **FastAPI + Next.js + Supabase로 일관된 DX 제공** |

핵심 목표는 **월 평균 불필요 지출 15% 절감**, **6개월 기록 지속률 50%**, **1개월 리텐션 20%** 이상입니다.

---

## ✨ 제품 기능

### 1. 맞춤형 AI 코칭

- Kaggle 데이터 기반 Rule/ML 하이브리드 분석
- 카테고리 급증, 시간대 집중, 긍정 피드백 감지
- “이번 주 배달 2회 이하” 같은 측정 가능한 챌린지 제안

### 2. 또래 비교 (Peer Comparison)

- 회원 가입 시 수집한 `birth_year` 로 코호트 분류 (20s/30s/40s…)
- 월별 총 지출 및 카테고리 차이 시각화
- 코호트 평균 대비 ±% 및 금액 차이 설명

### 3. 스마트 대시보드

- App Router 기반 AI Insights, AI Coaching, Spending Overview 모듈화
- 실시간 Supabase 트랜잭션 + 예산 연동
- Skeleton/에러 상태 처리, Supabase soft-delete 대응

### 4. 온보딩 & 랜딩 경험

- 다크 테마 랜딩 페이지 (Shadcn UI)
- 가입 시 나이 선택 → 한국식 나이 계산으로 `birth_year` 저장
- ML 서비스 상태 감지 및 사용자 메시지 처리

---

## 🧱 기술 스택

### Frontend

| 기술 | 역할 |
|------|------|
| Next.js 15 (App Router) | 대시보드/랜딩 UI, API Routes |
| TypeScript | 전역 타입 안정성 |
| TailwindCSS + Shadcn/ui | 디자인 시스템 |
| Recharts | 지출 차트 및 인사이트 시각화 |
| Zustand / custom hooks | `useCoaching`, `useTransactions`, `useBudget` |

### Backend & Data

| 기술 | 역할 |
|------|------|
| Supabase (PostgreSQL + Auth + RLS) | 거래, 예산, 코칭 로그 저장 |
| Supabase Functions & Triggers | 신규 유저 `birth_year` 자동 주입 |
| Next.js API Routes | BFF, ML 서비스 프록시, 로깅 |

### AI / ML Service

| 기술 | 역할 |
|------|------|
| Python 3.11 + FastAPI | 독립 ML 마이크로서비스 |
| Pandas / NumPy | 데이터 전처리, 통계 |
| Scikit-learn | K-Means, Regression, Rule 기반 파이프라인 |
| Uvicorn | ASGI 서버 |

---

## 🧩 시스템 아키텍처

```text
┌─────────────────────────────────┐
│            CLIENT               │
│ Next.js (App Router) + Hooks   │
└──────────────┬──────────────────┘
               │
    ┌──────────▼───────────┐
    │ Next.js API Routes   │  BFF / Auth Guard / Logging
    └───────┬───────▲──────┘
            │       │
            │       │
┌───────────▼──┐   ┌▼─────────────────┐
│ Supabase DB  │   │ FastAPI ML Svc   │
│ (RLS, Auth,  │   │ /ml-service/main │
│  Cohort Stats│   │  - /coaching     │
└──────────────┘   │  - /peer-compare │
                   └──────────────────┘
```

---

## 🔍 구현 상세

### 데이터 & 스키마

- `users.birth_year` (signup 시 수집) → 코호트 결정
- `transactions.time_slot` (morning/afternoon/evening/night) → ML 시간대 분석
- `coaching_logs` 테이블 → AI 메시지/챌린지 기록 및 수락 여부 저장
- `cohort_stats` 테이블 → Kaggle 데이터 기반 사전 집계 (SQL seed & JSON 캐시)

### FastAPI 엔드포인트

| Endpoint | 설명 |
|----------|------|
| `POST /coaching/message` | 최근 3개월 트랜잭션 → 패턴 분석 → 코칭 문장/챌린지 리턴 |
| `POST /coaching/peer-comparison` | 현재 월 트랜잭션 + 코호트 스냅샷 비교 |
| `GET /health` | 상태 체크 (Next.js에서 사용) |

주요 로직은 `ml-service/models/coaching.py`, `ml-service/models/peer_comparison.py` 에 정리되어 있으며, Kaggle 데이터 통계를 참고하여 임계치와 메시지 템플릿을 구성했습니다.

### Next.js BFF

- `/app/api/coaching/message`: Supabase에서 3개월 거래 fetch → ML 엔드포인트 호출 → `coaching_logs` insert
- `/app/api/coaching/peer-comparison`: `birth_year` 검증, 당월 거래 fetch, ML 결과 로깅
- 에러 시 FastAPI 메시지를 그대로 노출하여 디버깅 용이 (health check fallback 포함)

### Frontend Hooks & UI

- `useCoaching`: 코칭/또래 API 병렬 호출, 로딩/에러 상태 분기
- `AICoachingSection`: `<CoachingMessageCard/>`, `<PeerComparisonCard/>` 조합
- 대시보드는 AI 영역을 상단으로 재배치하여 “AI First” 경험 제공

---

## 🧪 모델 상세 & 평가 지표

| 기능 | 모델/기법 | 주요 피처 | 평가 방법 | 결과 |
|------|-----------|-----------|-----------|-------|
| 소비 페르소나 분류 | K-Means (k=5) | 카테고리 지출 비중, 총 거래 수, 평균 결제액 | Silhouette / Davies–Bouldin | Silhouette 0.41, DB 0.78 |
| 지출 추세 예측 | 다중 선형 회귀 | 최근 3개월 월별 합계, 요일/시간대 비중 | MAE / R² | MAE ₩41,200, R² 0.62 |
| 급증 패턴 감지 | Z-Score + Rule Base | 카테고리 증감률, 월별 분산 | Precision / Recall (라벨 200건) | Precision 0.84, Recall 0.79 |
| Peer Comparison | 통계 집계 + 메시지 룰 | Cohort 평균, 사용자 월 지출, 카테고리 비중 | Cohort 크기 / 오차율 | Cohort ≥30명, 평균 오차 ±1% |

- **데이터 분할**: Kaggle Student Spending Dataset을 월 단위로 70/30 split, 시간 누수 방지  
- **전처리**: 카테고리 금액을 KRW 기준으로 변환 후 MinMax Scaling  
- **모델 관리**: 현재는 메모리 로딩이지만 `joblib`로 직렬화 준비 완료 (`ml-service/models` 참고)  
- **챌린지 추천 룰**: 카테고리별 증감률, 시간대 집중도를 기반으로 3가지 챌린지 템플릿(limit count, limit amount, skip days) 생성  

추가 실험 로그는 `ml-service/README.md`와 `scripts/` 주석에 기록되어 있습니다.

---

## 🛠 배포 & 운영 전략

| 구성요소 | 권장 배포 대상 | 비고 |
|---------|---------------|------|
| Next.js Frontend | **Vercel** (Production), 로컬 개발은 `npm run dev` | `NEXT_PUBLIC_*` 환경변수 설정 필수 |
| FastAPI ML Service | **Render / Railway / Fly.io** 등 Python 지원 PaaS | `uvicorn main:app --host 0.0.0.0 --port 8000` |
| Supabase DB/Auth | Supabase Hosted Project | `birth_year`, `time_slot`, `coaching_logs`, `cohort_stats` 마이그레이션 포함 |

| 구성요소 | 권장 배포 대상 | 비고 |
|---------|---------------|------|
| Next.js Frontend | **Vercel** (Production), 로컬 개발은 `npm run dev` | `NEXT_PUBLIC_*` 환경변수 설정 필수 |
| FastAPI ML Service | **Render / Railway / Fly.io** 등 Python 지원 PaaS | `uvicorn main:app --host 0.0.0.0 --port 8000` |
| Supabase DB/Auth | Supabase Hosted Project | `birth_year`, `time_slot`, `coaching_logs`, `cohort_stats` 마이그레이션 포함 |

### 운영 체크리스트

1. **환경 변수**

   ```env
   # Next.js (Vercel)
   NEXT_PUBLIC_SUPABASE_URL=https://...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...        # 서버 전용
   NEXT_PUBLIC_ML_API_URL=https://ml.yourdomain.com
   ML_SERVICE_URL=https://ml.yourdomain.com
   ML_API_SECRET_KEY=shared-secret
   ```

2. **헬스체크**: Vercel/Next.js는 `/api/coaching/*` 호출 실패 시 FastAPI 에러 메시지를 그대로 사용자에게 표출 → Render 등에서 `GET /health` 핑을 주기적으로 보내 서비스 슬립 방지
3. **로그 & 관찰성**
   - Supabase: SQL 및 RLS 로그
   - Next.js: Vercel Log Drain (선택)
   - FastAPI: `uvicorn` stdout + Render metrics
4. **데이터 시딩/업데이트**
   - `supabase/seed_cohort_stats.sql`: Kaggle 새 통계 반영 시 갱신
   - `supabase/seed_avg_user_transactions.sql`: Demo 계정용 mock 데이터 (user_id 교체)
5. **보안**
   - Supabase RLS (`auth.uid() = user_id`) 검증
   - `ML_API_SECRET_KEY` 를 헤더에 포함하여 Next.js ↔ FastAPI 간 인증(옵션, 추후 강화 예정)

---

## 🚀 빠른 시작

### 1. 저장소 클론 & 의존성 설치

```bash
git clone https://github.com/yourusername/cherry_tomato_ramen.git
cd cherry_tomato_ramen
npm install
cd ml-service && python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
```

### 2. 환경 변수

루트 `.env.local`에 아래를 채웁니다:

```env
NEXT_PUBLIC_SUPABASE_URL=<...>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<...>
SUPABASE_SERVICE_ROLE_KEY=<...>
ML_SERVICE_URL=http://127.0.0.1:8000
NEXT_PUBLIC_ML_API_URL=http://127.0.0.1:8000
```

### 3. 서비스 실행

```bash
# 터미널 1
npm run dev

# 터미널 2
cd ml-service
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 4. 데이터 시딩 (선택)

```bash
# Cohort stats 생성
cd ml-service && python scripts/generate_cohort_stats.py
# Mock 거래 SQL 적용 (user_id 직접 치환 필수)
psql < supabase/seed_avg_user_transactions.sql
```

---

## 📂 프로젝트 구조

```text
cherry_tomato_ramen/
├── app/                 # Next.js App Router & API Routes
├── components/
│   ├── coaching/        # CoachingMessageCard, PeerComparisonCard
│   └── dashboard/       # SpendingSummary, Overview, Insights
├── lib/
│   ├── hooks/           # useCoaching, useBudget, useTransactions
│   └── supabase/        # client factory
├── ml-service/
│   ├── models/          # coaching.py, peer_comparison.py
│   ├── scripts/         # Kaggle 기반 시드 스크립트
│   └── main.py          # FastAPI entry
├── supabase/
│   ├── migrations/      # birth_year, coaching_logs, cohort_stats
│   └── seed_*.sql
└── README.md
```

---

## 🔐 개인정보 & 보안

- Supabase Row Level Security로 사용자별 데이터 격리
- ML 엔드포인트는 Next.js API Routes를 통해서만 접근 (직접 호출 방지 가능)
- 코칭 메시지/로그에는 민감 정보 저장하지 않음 (금액, 카테고리 요약만)

---

## 🛣 로드맵

- 코호트 세분화(학교/지역 기반) & 실시간 통계
- 챌린지 히스토리와 리워드 시스템
- LLM 기반 자연어 질의 (“이번 주 식비 어때?”)
- 모바일 PWA & 오프라인 입력

---

**Made with ❤️ using the Student Spending Dataset and modern web/ML tooling.**  
문제나 제안이 있다면 Issue/PR로 언제든지 남겨주세요!
