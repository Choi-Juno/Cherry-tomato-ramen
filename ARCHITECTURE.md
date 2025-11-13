# 🏗️ Architecture Document: AI Spending Coach

## 📐 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                             │
│                     Next.js 16 (Vercel)                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ App Router Pages                                      │   │
│  │ • /dashboard      - Main spending overview           │   │
│  │ • /transactions   - Transaction list & filters       │   │
│  │ • /insights       - AI insights & recommendations     │   │
│  │ • /budget         - Budget setting per category      │   │
│  │ • /settings       - User preferences & data export   │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Client Components                                     │   │
│  │ • ExpenseInputModal  - FAB-triggered expense entry   │   │
│  │ • SpendingChart      - Month/week trend charts       │   │
│  │ • CategoryAnalysis   - Category breakdown pie/bar    │   │
│  │ • AIInsightCard      - Individual insight display    │   │
│  │ • RecentTransactions - Latest 5-10 transactions      │   │
│  │ • BudgetProgress     - Category budget bars          │   │
│  └──────────────────────────────────────────────────────┘   │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    │ Supabase JS Client
                    ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE LAYER                            │
│                  Supabase (PostgreSQL)                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Tables:                                               │   │
│  │ • users          - Auth & profile                    │   │
│  │ • transactions   - All expense records               │   │
│  │ • categories     - Expense categories                │   │
│  │ • budgets        - Monthly budgets per category      │   │
│  │ • ai_insights    - Generated insights from ML        │   │
│  │ • challenges     - Optional: Saving challenges       │   │
│  └──────────────────────────────────────────────────────┘   │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    │ REST API Call (from Next.js API Route)
                    ▼
┌─────────────────────────────────────────────────────────────┐
│                    ML MICROSERVICE                           │
│             FastAPI + Python (Cloud Run/AWS)                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Data Pipeline (pandas)                                │   │
│  │ • Load CSV/JSON user spending data                    │   │
│  │ • Clean & validate                                    │   │
│  │ • Feature engineering (monthly aggregates, trends)   │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ ML Models (scikit-learn)                              │   │
│  │ • KMeans Clustering    - Spending personas           │   │
│  │ • Trend Detection      - Month-over-month changes    │   │
│  │ • Overspending Risk    - Logistic regression         │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ FastAPI Endpoints                                     │   │
│  │ • POST /predict/insights  - Generate insights        │   │
│  │ • POST /train             - Retrain models           │   │
│  │ • GET  /health            - Health check             │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 📂 Next.js Folder Structure

```
cherry_tomato_ramen/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── signup/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx              # Shared layout with nav
│   │   ├── dashboard/
│   │   │   └── page.tsx            # Main dashboard
│   │   ├── transactions/
│   │   │   └── page.tsx            # Transaction list
│   │   ├── insights/
│   │   │   └── page.tsx            # AI insights page
│   │   ├── budget/
│   │   │   └── page.tsx            # Budget settings
│   │   └── settings/
│   │       └── page.tsx            # User settings
│   ├── api/
│   │   ├── transactions/
│   │   │   └── route.ts            # CRUD for transactions
│   │   ├── insights/
│   │   │   └── route.ts            # Fetch AI insights
│   │   └── ml/
│   │       └── proxy/
│   │           └── route.ts        # Proxy to FastAPI
│   ├── layout.tsx                  # Root layout
│   ├── page.tsx                    # Landing page
│   └── globals.css
│
├── components/
│   ├── dashboard/
│   │   ├── DashboardHeader.tsx
│   │   ├── SpendingSummary.tsx
│   │   ├── SpendingChart.tsx       # Chart component
│   │   └── QuickStats.tsx
│   ├── transactions/
│   │   ├── TransactionList.tsx
│   │   ├── TransactionCard.tsx
│   │   ├── TransactionFilters.tsx
│   │   └── ExpenseInputModal.tsx   # FAB modal
│   ├── insights/
│   │   ├── AIInsightCard.tsx       # Individual insight
│   │   ├── InsightList.tsx
│   │   └── CategoryAnalysis.tsx    # Category breakdown
│   ├── budget/
│   │   ├── BudgetForm.tsx
│   │   ├── BudgetProgress.tsx
│   │   └── CategoryBudgetCard.tsx
│   ├── settings/
│   │   ├── ProfileSettings.tsx
│   │   ├── DataExport.tsx
│   │   └── NotificationSettings.tsx
│   ├── shared/
│   │   ├── Navigation.tsx          # Top/side nav
│   │   ├── FAB.tsx                 # Floating Action Button
│   │   └── LoadingSpinner.tsx
│   └── ui/                         # shadcn/ui primitives
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       ├── select.tsx
│       ├── badge.tsx
│       ├── progress.tsx
│       ├── skeleton.tsx
│       ├── tooltip.tsx
│       ├── popover.tsx
│       └── ...
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts               # Supabase client
│   │   ├── server.ts               # Server-side Supabase
│   │   └── types.ts                # Database types
│   ├── ml/
│   │   └── client.ts               # FastAPI client
│   ├── utils/
│   │   ├── format.ts               # Date/currency formatters
│   │   ├── calculations.ts         # Budget/spending calcs
│   │   └── validation.ts           # Input validation
│   └── hooks/
│       ├── useTransactions.ts
│       ├── useInsights.ts
│       ├── useBudget.ts
│       └── useUser.ts
│
├── types/
│   ├── transaction.ts
│   ├── insight.ts
│   ├── budget.ts
│   └── user.ts
│
├── ml-service/                     # Python FastAPI Service
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── main.py                     # FastAPI app
│   ├── models/
│   │   ├── clustering.py           # KMeans
│   │   ├── trend_detection.py      # Trend analysis
│   │   └── overspending_risk.py    # Risk prediction
│   ├── pipeline/
│   │   ├── data_loader.py          # CSV/JSON loader
│   │   ├── feature_engineer.py     # Feature creation
│   │   └── preprocessor.py         # Data cleaning
│   ├── utils/
│   │   └── model_persistence.py    # joblib save/load
│   └── trained_models/
│       ├── kmeans.joblib
│       ├── trend_model.joblib
│       └── risk_model.joblib
│
├── supabase/
│   ├── migrations/
│   │   ├── 001_initial_schema.sql
│   │   └── 002_ai_insights.sql
│   └── seed.sql
│
├── public/
│   ├── icons/
│   └── images/
│
├── .env.local.example
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## 🎨 Component Hierarchy

### Dashboard Page Structure
```
DashboardPage (Server Component)
├── DashboardHeader
├── SpendingSummary (Server)
│   ├── MonthlyTotal
│   ├── BudgetRemaining
│   └── TopCategory
├── SpendingChart (Client)
│   └── Recharts Line/Bar Chart
├── CategoryAnalysis (Client)
│   └── Recharts Pie Chart
├── AIInsights (Server)
│   └── AIInsightCard[] (Client)
└── RecentTransactions (Server)
    └── TransactionCard[] (Client)
```

### Expense Input Flow
```
FAB (Fixed bottom-right)
└── onClick → Dialog
    └── ExpenseInputModal (Client)
        ├── AmountInput
        ├── CategorySelect
        ├── DescriptionInput
        ├── DatePicker
        └── SubmitButton
```

## 🔄 Data Flow

### 1. User Adds Expense
```
User clicks FAB
→ ExpenseInputModal opens
→ User enters data
→ Submit → POST /api/transactions
→ Supabase insert
→ Revalidate dashboard
→ Close modal + show success toast
```

### 2. AI Insights Generation
```
Scheduled job (daily) OR manual trigger
→ Next.js API Route /api/insights/generate
→ Fetch user transactions from Supabase
→ POST to FastAPI /predict/insights
→ FastAPI processes with ML models
→ Return insights JSON
→ Store in ai_insights table
→ Display on dashboard
```

### 3. Budget Tracking
```
User sets budget in /budget
→ Save to budgets table
→ Dashboard calculates:
  - Total spent per category (current month)
  - Remaining budget
  - Progress percentage
→ Show warning if >80% spent
```

## 🎨 Design System

### Color Palette
```typescript
// Tailwind classes
primary: 'violet-600'      // Main actions
secondary: 'slate-700'     // Text
success: 'emerald-500'     // Savings
warning: 'amber-500'       // Budget warnings
danger: 'red-500'          // Overspending
background: 'white'        // Main bg
surface: 'slate-50'        // Cards
```

### Typography
```typescript
// Geist Sans (already in layout.tsx)
Heading 1: text-3xl font-bold
Heading 2: text-2xl font-semibold
Heading 3: text-xl font-semibold
Body: text-base
Small: text-sm
Tiny: text-xs
```

### Spacing System
Based on Tailwind's default 4px scale:
- xs: 2 (8px)
- sm: 3 (12px)
- md: 4 (16px)
- lg: 6 (24px)
- xl: 8 (32px)

## 📱 Responsive Breakpoints
```
Mobile:  < 640px  (sm)
Tablet:  640-1024px
Desktop: > 1024px (lg)
```

## 🔐 Authentication Flow
```
Landing Page
├── Login → Supabase Auth
├── Signup → Supabase Auth
└── OAuth (Google, optional)

Protected Routes:
- All /dashboard routes wrapped in middleware
- Redirect to /login if unauthenticated
```

## 🧩 Key Technologies

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js 16 App Router | Server/Client Components, Routing |
| UI | TailwindCSS + shadcn/ui | Consistent design system |
| Database | Supabase | PostgreSQL + Auth + Real-time |
| Charts | Recharts | Responsive React charts |
| Forms | React Hook Form + Zod | Validation & type safety |
| State | React Server Components | Server-first data fetching |
| ML Service | FastAPI + Python | Microservice for predictions |
| ML Libraries | pandas, scikit-learn | Data processing & modeling |
| Deployment | Vercel + Cloud Run | Frontend + ML service |

## 🚀 Performance Optimizations

1. **Server Components by Default**
   - Dashboard data fetched on server
   - Reduces client JS bundle

2. **Parallel Data Fetching**
   - Fetch transactions, budgets, insights concurrently
   - Use React Suspense boundaries

3. **Client Components Only When Needed**
   - Charts (interactivity)
   - Forms (user input)
   - Modals (state management)

4. **Image Optimization**
   - Use Next.js Image component
   - WebP format for icons

5. **Code Splitting**
   - Route-based automatic splitting
   - Dynamic imports for heavy components

## 🔄 State Management Strategy

### Server State (Preferred)
- Use Server Components for data fetching
- Pass props down to Client Components
- Revalidate with Next.js cache tags

### Client State (Minimal)
- Form state: React Hook Form
- Modal state: Local useState
- Filter state: URL search params
- No global state library needed initially

## 📊 Analytics Events

Track key user actions:
- `expense_added`
- `budget_set`
- `insight_viewed`
- `challenge_started`
- `data_exported`

Use Vercel Analytics or Posthog (optional).

---

This architecture prioritizes:
✅ **Simplicity** - Minimal abstractions
✅ **Performance** - Server-first rendering
✅ **Scalability** - Microservice ML layer
✅ **Maintainability** - Clear separation of concerns
✅ **Type Safety** - TypeScript throughout

