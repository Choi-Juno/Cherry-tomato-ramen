# 🤖 AI Spending Coach - ML Service

FastAPI-based machine learning microservice for spending analysis and insights generation.

## 📋 Features

- **Spending Persona Classification**: KMeans clustering to identify user spending patterns
- **Trend Detection**: Statistical analysis to detect spending trends
- **Overspending Risk Prediction**: Forecasts budget overrun based on current spending
- **RESTful API**: FastAPI endpoints for predictions and health checks

## 🚀 Quick Start

### Local Development

1. **Install Dependencies**

```bash
cd ml-service
pip install -r requirements.txt
```

2. **Set Environment Variables**

Create a `.env` file:

```bash
ML_API_SECRET_KEY=your-secret-key
```

3. **Run the Server**

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

### Docker

```bash
# Build image
docker build -t spending-coach-ml .

# Run container
docker run -p 8000:8000 -e ML_API_SECRET_KEY=your-secret-key spending-coach-ml
```

## 📚 API Documentation

### Endpoints

#### `GET /`
Root endpoint - service information

#### `GET /health`
Health check endpoint

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00",
  "models_loaded": {
    "clusterer": true,
    "trend_detector": true,
    "risk_predictor": true
  }
}
```

#### `POST /predict/insights`
Generate AI insights from spending data

**Headers:**
- `X-API-Key`: Your API secret key

**Request Body:**
```json
{
  "user_id": "uuid",
  "transactions": [
    {
      "date": "2024-01-15",
      "amount": 15000,
      "category": "food",
      "description": "점심 식사"
    }
  ],
  "current_month_budget": {
    "food": 300000,
    "transport": 100000
  }
}
```

**Response:**
```json
{
  "insights": [
    {
      "type": "overspending",
      "severity": "warning",
      "title": "식비 지출이 증가하고 있어요",
      "description": "...",
      "suggested_action": "...",
      "potential_savings": 50000,
      "category": "food"
    }
  ],
  "spending_persona": "균형잡힌 소비자 🎯",
  "trend_analysis": {
    "month_over_month_change": 12.5,
    "category_trends": {}
  }
}
```

#### `POST /train`
Trigger model retraining (admin only)

**Headers:**
- `X-API-Key`: Your API secret key

## 🧪 Testing

```bash
# Install dev dependencies
pip install pytest httpx

# Run tests
pytest
```

### Manual Testing

```bash
# Health check
curl http://localhost:8000/health

# Generate insights
curl -X POST http://localhost:8000/predict/insights \
  -H "Content-Type: application/json" \
  -H "X-API-Key: dev-secret-key" \
  -d @test_request.json
```

## 📁 Project Structure

```
ml-service/
├── main.py                 # FastAPI application
├── requirements.txt        # Python dependencies
├── Dockerfile             # Container configuration
├── models/
│   ├── clustering.py      # KMeans spending persona model
│   ├── trend_detection.py # Trend analysis
│   └── overspending_risk.py # Risk prediction
├── pipeline/
│   ├── data_loader.py     # Data loading utilities
│   ├── preprocessor.py    # Data cleaning & validation
│   └── feature_engineer.py # Feature creation
└── trained_models/         # Persisted models (joblib)
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `ML_API_SECRET_KEY` | API authentication key | `dev-secret-key` |
| `PORT` | Server port | `8000` |

## 🎯 ML Models

### 1. Spending Persona (KMeans Clustering)

**Features:**
- Category spending ratios (8 categories)
- Average transaction amount
- Standard deviation of transactions

**Personas:**
- 균형잡힌 소비자 (Balanced Spender)
- 식비 중심 (Food Focused)
- 쇼핑 애호가 (Shopping Enthusiast)
- 절약형 소비자 (Minimalist)

### 2. Trend Detection

**Methods:**
- Month-over-month percentage change
- Category-specific trend analysis
- Spending spike detection

**Thresholds:**
- Increase warning: +15%
- Decrease celebration: -10%
- Spike: 2 standard deviations

### 3. Overspending Risk

**Approach:**
- Calculate daily burn rate
- Project end-of-month spending
- Compare against budget

**Risk Levels:**
- 🟢 Safe: < 70% of budget
- 🟡 Warning: 70-90% of budget
- 🔴 Critical: > 90% of budget

## 🚀 Deployment

### Google Cloud Run

```bash
# Build and push to GCR
gcloud builds submit --tag gcr.io/PROJECT_ID/spending-coach-ml

# Deploy
gcloud run deploy spending-coach-ml \
  --image gcr.io/PROJECT_ID/spending-coach-ml \
  --platform managed \
  --region asia-northeast3 \
  --allow-unauthenticated \
  --set-env-vars ML_API_SECRET_KEY=your-secret
```

### AWS Lambda (with Mangum)

```bash
pip install mangum
```

Wrap FastAPI app:
```python
from mangum import Mangum
handler = Mangum(app)
```

## 📊 Performance

- **Latency**: < 200ms (p95)
- **Throughput**: ~100 req/s per instance
- **Memory**: ~256MB base, ~512MB with models

## 🔐 Security

- API key authentication required
- CORS configuration for trusted origins
- No sensitive data stored in service
- Stateless design for horizontal scaling

## 📈 Monitoring

### Health Checks

Monitor `/health` endpoint for:
- Service availability
- Model loading status
- Response time

### Metrics to Track

- Request count & latency
- Error rate
- Model prediction accuracy
- Memory usage

## 🤝 Contributing

1. Add new models in `models/`
2. Update feature engineering in `pipeline/feature_engineer.py`
3. Add endpoints in `main.py`
4. Update tests

## 📝 License

MIT

