# 🍅 AI 소비 코치 - Cherry Tomato Ramen

> 대학생을 위한 AI 기반 스마트 가계부 & 소비 습관 개선 플랫폼

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109-green)](https://fastapi.tiangolo.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-brightgreen)](https://supabase.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v3-38B2AC)](https://tailwindcss.com/)

**AI가 분석하고 코칭하는, 당신만의 소비 습관 트레이너** 🎯

---

## 📋 목차 (Table of Contents)

- [소개 (About)](#-소개-about)
- [주요 기능 (Features)](#-주요-기능-features)
- [기술 스택 (Tech Stack)](#-기술-스택-tech-stack)
- [아키텍처 (Architecture)](#-아키텍처-architecture)
- [시작하기 (Getting Started)](#-시작하기-getting-started)
- [문서 (Documentation)](#-문서-documentation)
- [프로젝트 구조 (Project Structure)](#-프로젝트-구조-project-structure)

---

## 📖 소개 (About)

**AI 소비 코치**는 대학생과 사회초년생의 건강한 금융 습관 형성을 돕는 AI 기반 소비 코칭 플랫폼입니다. 단순히 지출을 기록하는 것을 넘어, AI가 소비 패턴을 분석하고 구체적인 행동 변화를 제안합니다.

### 🎯 핵심 목표

- 💰 월평균 불필요 지출 **15% 절감**
- 📈 6개월 내 입력 지속률 **50% 이상**
- 🔄 1개월 리텐션 **20% 이상**

### 🚀 차별점 (What Makes Us Different?)

| 기존 가계부 앱 | AI 소비 코치 |
|--------------|-------------|
| 단순 기록 중심 | **AI 행동 변화 코칭** |
| 수동적 입력 | **능동적 인사이트 제공** |
| "얼마 썼는지" 확인 | **"어떻게 줄일지" 제안** |

---

## ✨ 주요 기능 (Features)

### 🎨 **핵심 기능 (Core Features)**

#### 1. 🤖 맞춤형 AI 코칭 (New!)
- **행동 변화 제안**: "지난달보다 배달비가 18% 늘었어요. 이번 주 배달을 2회로 줄여보세요."와 같이 구체적인 행동 가이드를 제공합니다.
- **또래 비교 (Peer Comparison)**: "20대 평균보다 식비를 15% 더 쓰고 있어요." 등 연령대별 평균 지출과 비교하여 내 위치를 알려줍니다.
- **챌린지 추천**: 개인화된 절약 챌린지를 제안하고 달성을 독려합니다.

#### 2. 📊 스마트 대시보드
- **직관적인 차트**: 주간/월간 소비 추이, 카테고리별 지출 분석을 시각적으로 제공합니다.
- **소비 트렌드**: 지출이 늘고 있는지 줄고 있는지 트렌드를 한눈에 파악할 수 있습니다.

#### 3. 💳 간편 지출 입력 & 관리
- **초간편 입력**: FAB 버튼으로 언제 어디서나 빠르게 지출을 기록할 수 있습니다.
- **소프트 삭제**: 실수로 지운 내역도 데이터베이스에는 안전하게 보관됩니다.

#### 4. 🧠 AI 인사이트 (ML-Powered)
- **소비 페르소나 분석**: 내 소비 패턴을 분석하여 '식비 중심', '쇼핑 애호가' 등 페르소나를 부여합니다.
- **예산 초과 위험 예측**: 현재 속도로 돈을 쓰면 월말에 예산이 얼마나 초과될지 미리 경고해줍니다.

#### 5. 💰 예산 관리
- 카테고리별 예산을 설정하고 실시간 진행률을 확인할 수 있습니다.

---

## 🛠 기술 스택 (Tech Stack)

### Frontend
- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS, Shadcn/ui (Radix UI)
- **State Management**: React Hooks (Custom Hooks), Context API
- **Visualization**: Recharts

### Backend
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **API**: Next.js API Routes (BFF pattern)

### AI/ML Service
- **Framework**: FastAPI (Python 3.11+)
- **Libraries**: pandas, scikit-learn, numpy
- **Communication**: REST API (Frontend ↔ FastAPI)

---

## 🏗 아키텍처 (Architecture)

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                          │
│                      Next.js App                             │
└───────────────┬─────────────────────────────────────────────┘
                │
    ┌───────────┴───────────┐
    │                       │
    ▼                       ▼
┌─────────┐          ┌──────────────┐
│Supabase │          │ FastAPI ML   │
│PostgreSQL│◄────────┤  Service     │
│+ Auth   │          │ (Python)     │
└─────────┘          └──────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  ML Models   │
                    │ (Clustering) │
                    └──────────────┘
```

---

## 🚀 시작하기 (Getting Started)

### 필수 요구사항 (Prerequisites)

- Node.js 18+
- Python 3.11+
- Supabase 계정

### 1. 저장소 클론 (Clone Repository)

```bash
git clone https://github.com/yourusername/cherry_tomato_ramen.git
cd cherry_tomato_ramen
```

### 2. 의존성 설치 (Install Dependencies)

```bash
# Frontend
npm install

# ML Service
cd ml-service
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cd ..
```

### 3. 환경 변수 설정 (Environment Variables)

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 입력하세요:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# ML Service
NEXT_PUBLIC_ML_API_URL=http://localhost:8000
ML_SERVICE_URL=http://localhost:8000
```

### 4. 개발 서버 실행 (Run Development Servers)

두 개의 터미널을 열어 각각 실행해야 합니다.

**Terminal 1 - Frontend (Next.js):**
```bash
npm run dev
```

**Terminal 2 - ML Service (FastAPI):**
```bash
cd ml-service
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 5. 브라우저 접속

[http://localhost:3000](http://localhost:3000)으로 접속하여 앱을 확인하세요.

---

## 📂 프로젝트 구조 (Project Structure)

```
cherry_tomato_ramen/
├── app/                      # Next.js App Router 페이지 및 API
│   ├── api/                  # Backend API Routes
│   ├── dashboard/            # 대시보드 페이지
│   └── ...
├── components/               # React 컴포넌트
│   ├── coaching/             # AI 코칭 관련 컴포넌트
│   ├── dashboard/            # 대시보드 차트 및 위젯
│   └── ui/                   # 공통 UI 컴포넌트 (Shadcn)
├── lib/                      # 유틸리티 및 훅
│   ├── hooks/                # Custom React Hooks (useCoaching 등)
│   ├── supabase/             # Supabase 클라이언트 설정
│   └── ...
├── ml-service/               # Python FastAPI ML 서비스
│   ├── models/               # ML 모델 로직 (coaching.py, peer_comparison.py 등)
│   ├── scripts/              # 데이터 생성 및 학습 스크립트
│   └── main.py               # FastAPI 진입점
├── supabase/                 # DB 마이그레이션 및 시드 데이터
└── types/                    # TypeScript 타입 정의
```

---

## 📚 문서 (Documentation)

- [**ARCHITECTURE.md**](./ARCHITECTURE.md) - 시스템 아키텍처 상세
- [**DEPLOYMENT.md**](./DEPLOYMENT.md) - 배포 가이드
- [**ML_INTEGRATION_GUIDE.md**](./ML_INTEGRATION_GUIDE.md) - ML 서비스 연동 가이드

---

<div align="center">

**Made with ❤️ for university students**

</div>
