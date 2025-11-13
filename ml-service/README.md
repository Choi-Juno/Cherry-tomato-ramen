# 🤖 AI Spending Coach - ML Service

Python FastAPI 기반의 머신러닝 마이크로서비스입니다.

## 📦 기능

- **KMeans 클러스터링**: 5가지 소비 패턴 분석
- **추세 분석**: 지출 증가/감소 감지
- **과소비 위험 예측**: 예산 초과 위험도 계산
- **절약 기회 추천**: AI 기반 절약 팁

## 🚀 빠른 시작

### 1. 가상환경 생성 및 의존성 설치

```bash
cd ml-service

# 가상환경 생성
python3 -m venv venv

# 가상환경 활성화 (Mac/Linux)
source venv/bin/activate

# Windows
# venv\Scripts\activate

# 의존성 설치
pip install -r requirements.txt
```

### 2. 서비스 실행

```bash
# 방법 1: Python으로 직접 실행
python main.py

# 방법 2: uvicorn으로 실행 (개발 모드)
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 3. 서비스 확인

브라우저에서 다음 URL을 열어보세요:

- **Health Check**: http://localhost:8000/health
- **API 문서 (Swagger UI)**: http://localhost:8000/docs
- **API 문서 (ReDoc)**: http://localhost:8000/redoc

## 📖 API 사용법

### POST /predict/insights

AI 인사이트 생성 엔드포인트입니다.

**Request Body:**

```json
{
  "user_id": "user-123",
  "transactions": [
    {
      "date": "2024-11-01",
      "amount": 15000,
      "category": "food",
      "description": "점심 식사",
      "merchant": "스타벅스"
    }
  ],
  "current_month_budget": {
    "food": 300000,
    "transport": 100000,
    "shopping": 150000
  }
}
```

**Response:**

```json
{
  "user_id": "user-123",
  "insights": [
    {
      "type": "spending_persona",
      "severity": "info",
      "title": "당신의 소비 패턴: 균형잡힌 소비자",
      "description": "...",
      "suggested_action": "...",
      "potential_savings": 0,
      "category": null
    }
  ],
  "persona": {
    "persona_name": "균형잡힌 소비자",
    "description": "...",
    "tips": ["..."]
  },
  "trends": {...},
  "overspending_risks": {...}
}
```

## 🧪 테스트

### Swagger UI에서 테스트 (추천)

1. http://localhost:8000/docs 접속
2. `POST /predict/insights` 확장
3. "Try it out" 클릭
4. Request body 입력
5. "Execute" 클릭

### curl로 테스트

```bash
curl -X POST "http://localhost:8000/predict/insights" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test-user",
    "transactions": [
      {
        "date": "2024-11-01",
        "amount": 15000,
        "category": "food",
        "description": "점심"
      }
    ],
    "current_month_budget": {
      "food": 300000
    }
  }'
```

## 📁 프로젝트 구조

```
ml-service/
├── main.py                   # FastAPI 메인 앱
├── requirements.txt          # Python 의존성
├── Dockerfile               # Docker 설정
├── data/
│   └── student_spending.csv # 학생 지출 데이터셋 (1000개)
├── pipeline/
│   ├── data_loader.py       # 데이터 로딩
│   └── preprocessor.py      # 전처리 & 피처 엔지니어링
├── models/
│   ├── clustering.py        # KMeans 소비 패턴 분석
│   ├── trend.py            # 추세 분석
│   └── overspending.py     # 과소비 예측
└── saved_models/            # 학습된 모델 (자동 생성)
```

## 🐳 Docker 실행

```bash
# 이미지 빌드
docker build -t ml-service:latest .

# 컨테이너 실행
docker run -p 8000:8000 ml-service:latest
```

## 🔗 Next.js 연동

Next.js 프로젝트의 `.env.local`에 다음을 추가:

```env
NEXT_PUBLIC_ML_API_URL=http://localhost:8000
```

코드에서 사용:

```typescript
import { mlApiClient } from "@/lib/ml/client";

const insights = await mlApiClient.generateInsights({
  user_id: userId,
  transactions: userTransactions,
  current_month_budget: monthlyBudget
});
```

## 🤖 ML 모델 정보

### 1. 소비 패턴 분석 (KMeans Clustering)

5가지 페르소나:
- ⚖️ **균형잡힌 소비자**: 다양한 카테고리에 고르게 지출
- 🍽️ **식생활 중심형**: 식비 지출이 높음
- 💰 **절약형 소비자**: 전반적으로 소비가 적음
- 🎬 **문화생활 애호가**: 여가/문화 활동에 투자
- 💻 **기술 투자형**: 기술 및 교육에 투자

### 2. 추세 분석 (Trend Detection)

- 선형 회귀 기반 추세 감지
- 월별 변화율 계산
- 통계적 유의성 검증 (p-value < 0.05)
- Z-score 기반 이상치 감지

### 3. 과소비 위험 예측 (Risk Assessment)

위험도 점수 계산 요소:
- 현재 예산 사용률
- 월말 예상 초과 금액
- 과거 평균 대비 변화

## 📊 데이터셋

- **출처**: student_spending.csv
- **샘플 수**: 1,000개
- **특성**: 17개 (나이, 성별, 학년, 전공, 소득, 지출 카테고리 등)

## 🛠 기술 스택

- **Framework**: FastAPI 0.115.6
- **ML**: scikit-learn 1.5.2, scipy 1.14.1
- **Data**: pandas 2.2.3, numpy 1.26.4
- **Server**: uvicorn 0.34.0
- **Python**: 3.13

## ⚠️ 문제 해결

### 포트 8000이 이미 사용 중

```bash
# 다른 포트로 실행
uvicorn main:app --port 8001

# 또는 사용 중인 프로세스 종료 (Mac)
lsof -ti:8000 | xargs kill -9
```

### 의존성 설치 에러

```bash
# pip 업그레이드
pip install --upgrade pip

# 가상환경 재생성
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 데이터셋 경로 에러

`data/student_spending.csv` 파일이 존재하는지 확인하세요.

## 📝 개발 로드맵

- [x] KMeans 클러스터링
- [x] 추세 분석
- [x] 과소비 위험 예측
- [x] FastAPI REST API
- [x] Docker 컨테이너화
- [ ] 모델 재학습 API
- [ ] 실시간 스트리밍 예측
- [ ] A/B 테스트 기능
- [ ] 모델 성능 모니터링

## 📄 라이선스

MIT License
