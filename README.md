# 🍅 AI 소비 코치 - Cherry Tomato Ramen

> 대학생을 위한 AI 기반 스마트 가계부 & 소비 습관 개선 플랫폼

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109-green)](https://fastapi.tiangolo.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-brightgreen)](https://supabase.com/)

**AI가 분석하고 코칭하는, 당신만의 소비 습관 트레이너** 🎯

---

## 📋 Table of Contents

- [About](#-about)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Deployment](#-deployment)
- [Documentation](#-documentation)
- [Contributing](#-contributing)
- [License](#-license)

---

## 📖 About

**AI 소비 코치**는 대학생과 사회초년생의 건강한 금융 습관 형성을 돕는 AI 기반 소비 코칭 플랫폼입니다.

### 🎯 핵심 목표

- 💰 월평균 불필요 지출 **15% 절감**
- 📈 6개월 내 입력 지속률 **50% 이상**
- 🔄 1개월 리텐션 **20% 이상**

### 🚀 What Makes Us Different?

| 기존 가계부 앱 | AI 소비 코치 |
|--------------|-------------|
| 단순 기록 중심 | AI 행동 변화 코칭 |
| 수동적 입력 | 능동적 인사이트 제공 |
| 3개월 내 이탈 70% | 습관 형성 중심 리텐션 |

---

## ✨ Features

### 🎨 **Core Features (MVP)**

#### 1. 간편 지출 입력
- FAB 버튼으로 **2탭 이내** 입력
- 최소한의 필드 (금액, 내용, 카테고리)
- 자동 날짜 입력

#### 2. 스마트 대시보드
- 📊 주간/월간 소비 추이 차트
- 🎯 카테고리별 지출 분석
- 💳 예산 대비 지출 현황
- 🔔 최근 거래 내역

#### 3. AI 인사이트 (FastAPI + ML)
- 🤖 **소비 페르소나 분석** (KMeans Clustering)
  - 균형잡힌 소비자 🎯
  - 식비 중심 🍽️
  - 쇼핑 애호가 🛍️
  - 절약형 소비자 💰
  
- 📈 **트렌드 감지**
  - 월간 지출 증감 분석
  - 카테고리별 변화 추이
  - 급증 패턴 탐지

- ⚠️ **예산 초과 위험 예측**
  - 실시간 소비 속도 계산
  - 월말 예상 지출 예측
  - 카테고리별 경고

- 💡 **절약 제안**
  - 개인화된 행동 제안
  - 구체적인 절약 금액 제시

#### 4. 예산 관리
- 카테고리별 예산 설정
- 진행률 시각화
- 초과 위험 알림

#### 5. 거래 내역 관리
- 검색 & 필터링
- 카테고리별 분류
- 수정 & 삭제

#### 6. 설정
- 알림 톤 선택 (코치형/친구형)
- 데이터 내보내기 (CSV/Excel)
- 프로필 관리

---

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS v4
- **UI Components**: Radix UI + shadcn/ui
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod
- **State**: React Server Components (Server-first)

### Backend
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **API**: Next.js API Routes
- **Real-time**: Supabase Realtime (optional)

### ML Service
- **Framework**: FastAPI
- **Language**: Python 3.11
- **ML Libraries**: 
  - pandas (data processing)
  - scikit-learn (ML models)
  - joblib (model persistence)
- **Models**:
  - KMeans (spending personas)
  - Statistical analysis (trend detection)
  - Rule-based (risk prediction)

### Infrastructure
- **Frontend Hosting**: Vercel
- **ML Service**: Google Cloud Run
- **Database**: Supabase Cloud
- **CI/CD**: GitHub Actions + Cloud Build

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                          │
│                      Next.js 16                              │
└───────────────┬─────────────────────────────────────────────┘
                │
    ┌───────────┴───────────┐
    │                       │
    ▼                       ▼
┌─────────┐          ┌──────────────┐
│Supabase │          │ FastAPI ML   │
│PostgreSQL│◄────────┤  Service     │
│+ Auth   │          │ (Cloud Run)  │
└─────────┘          └──────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  ML Models   │
                    │  (joblib)    │
                    └──────────────┘
```

### Data Flow

1. **User Input** → Next.js → Supabase (transactions)
2. **AI Analysis** → Next.js API → FastAPI → ML Models
3. **Insights** → FastAPI → Next.js API → Supabase (ai_insights)
4. **Dashboard** → Next.js Server Components → Supabase (fetch data)

For detailed architecture, see [`ARCHITECTURE.md`](./ARCHITECTURE.md)

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ & npm
- Python 3.11+
- Supabase account
- (Optional) Docker for ML service

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/cherry_tomato_ramen.git
cd cherry_tomato_ramen
```

### 2. Install Dependencies

```bash
# Frontend
npm install

# ML Service
cd ml-service
pip install -r requirements.txt
cd ..
```

### 3. Set Up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run the migration:
   - Copy `supabase/migrations/001_initial_schema.sql`
   - Paste in Supabase SQL Editor
   - Execute
3. (Optional) Run `supabase/seed.sql` for test data

### 4. Configure Environment Variables

Create `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# ML Service
NEXT_PUBLIC_ML_API_URL=http://localhost:8000
ML_API_SECRET_KEY=dev-secret-key
```

### 5. Run Development Servers

**Terminal 1 - Next.js:**
```bash
npm run dev
```

**Terminal 2 - ML Service:**
```bash
cd ml-service
uvicorn main:app --reload
```

### 6. Open Browser

Visit [http://localhost:3000](http://localhost:3000)

---

## 📦 Deployment

See [`DEPLOYMENT.md`](./DEPLOYMENT.md) for complete deployment guide.

### Quick Deploy

**Frontend (Vercel):**
```bash
vercel --prod
```

**ML Service (Cloud Run):**
```bash
cd ml-service
gcloud builds submit --config cloudbuild.yaml
```

---

## 📚 Documentation

- [**ARCHITECTURE.md**](./ARCHITECTURE.md) - System architecture & design
- [**DEPLOYMENT.md**](./DEPLOYMENT.md) - Deployment guide
- [**ml-service/README.md**](./ml-service/README.md) - ML service documentation

### Key Directories

```
cherry_tomato_ramen/
├── app/                      # Next.js pages (App Router)
│   ├── (dashboard)/          # Protected dashboard routes
│   ├── api/                  # API routes
│   └── layout.tsx            # Root layout
├── components/               # React components
│   ├── dashboard/            # Dashboard components
│   ├── transactions/         # Transaction components
│   ├── insights/             # AI insight components
│   ├── shared/               # Shared components
│   └── ui/                   # shadcn/ui primitives
├── lib/                      # Utilities & clients
│   ├── supabase/             # Supabase client
│   ├── ml/                   # ML API client
│   ├── hooks/                # React hooks
│   └── utils.ts              # Utilities
├── types/                    # TypeScript types
├── supabase/                 # Database migrations
├── ml-service/               # FastAPI ML service
│   ├── models/               # ML models
│   ├── pipeline/             # Data pipeline
│   ├── main.py               # FastAPI app
│   └── Dockerfile            # Container config
└── public/                   # Static assets
```

---

## 🎯 Roadmap

### ✅ Phase 1 (MVP) - Current
- [x] Next.js UI with all core pages
- [x] Supabase schema & migrations
- [x] FastAPI ML service
- [x] Basic AI insights
- [x] Deployment configurations

### 🚧 Phase 2 (Growth)
- [ ] User authentication & onboarding
- [ ] Real-time notifications
- [ ] Savings challenges & gamification
- [ ] Data export/import (CSV/Excel)
- [ ] Mobile responsive optimization
- [ ] Performance optimization

### 🔮 Phase 3 (Scale)
- [ ] Advanced ML models (LSTM for predictions)
- [ ] Social features (friend challenges)
- [ ] Financial institution integrations
- [ ] Premium subscription tier
- [ ] Multi-language support

---

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines.

### Development Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Follow the [Frontend Design Guidelines](./docs/frontend-guidelines.md)
- Use TypeScript strict mode
- Write meaningful commit messages
- Add tests for new features

---

## 👥 Team

- **Product**: Vision & UX design
- **Frontend**: Next.js & React development
- **Backend**: Supabase & API development
- **ML/AI**: Python & FastAPI development
- **DevOps**: Deployment & infrastructure

---

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Database & Auth
- [FastAPI](https://fastapi.tiangolo.com/) - ML API framework
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Recharts](https://recharts.org/) - Chart library

---

## 📞 Contact

- **Repository**: [github.com/yourusername/cherry_tomato_ramen](https://github.com/yourusername/cherry_tomato_ramen)
- **Issues**: [GitHub Issues](https://github.com/yourusername/cherry_tomato_ramen/issues)

---

<div align="center">

**Made with ❤️ for university students**

⭐ Star this repo if you find it helpful!

</div>
