"""
FastAPI ML Service for AI Spending Coach
Provides endpoints for generating spending insights using ML models
"""

from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import os

from models.clustering import SpendingClusterer
from models.trend_detection import TrendDetector
from models.overspending_risk import OverspendingRiskPredictor
from pipeline.data_loader import TransactionDataLoader
from pipeline.preprocessor import DataPreprocessor
from pipeline.feature_engineer import FeatureEngineer

app = FastAPI(
    title="AI Spending Coach ML Service",
    description="Machine Learning API for spending analysis and insights",
    version="1.0.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "https://*.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load environment variables
ML_API_SECRET_KEY = os.getenv("ML_API_SECRET_KEY", "dev-secret-key")


# Request/Response Models
class Transaction(BaseModel):
    date: str
    amount: float
    category: str
    description: str
    payment_method: Optional[str] = None
    merchant: Optional[str] = None


class InsightRequest(BaseModel):
    user_id: str
    transactions: List[Transaction]
    current_month_budget: Optional[Dict[str, float]] = None


class InsightResponse(BaseModel):
    type: str
    severity: str
    title: str
    description: str
    suggested_action: Optional[str] = None
    potential_savings: Optional[float] = None
    category: Optional[str] = None


class PredictionResponse(BaseModel):
    insights: List[InsightResponse]
    spending_persona: Optional[str] = None
    trend_analysis: Optional[Dict[str, Any]] = None


# Authentication dependency
async def verify_api_key(x_api_key: str = Header(...)):
    if x_api_key != ML_API_SECRET_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")
    return True


# Initialize ML components (lazy loading in production)
data_loader = TransactionDataLoader()
preprocessor = DataPreprocessor()
feature_engineer = FeatureEngineer()
clusterer = SpendingClusterer()
trend_detector = TrendDetector()
risk_predictor = OverspendingRiskPredictor()


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "AI Spending Coach ML Service",
        "version": "1.0.0",
        "status": "operational",
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "models_loaded": {
            "clusterer": clusterer.is_trained(),
            "trend_detector": True,
            "risk_predictor": risk_predictor.is_trained(),
        },
    }


@app.post("/predict/insights", response_model=PredictionResponse)
async def generate_insights(
    request: InsightRequest,
    authenticated: bool = Depends(verify_api_key),
):
    """
    Generate AI insights based on user spending data
    
    This endpoint analyzes spending patterns and returns:
    - Spending persona (cluster)
    - Trend analysis (month-over-month changes)
    - Specific insights (overspending warnings, savings opportunities)
    """
    try:
        # Convert transactions to DataFrame
        transactions_data = [t.model_dump() for t in request.transactions]
        df = data_loader.load_from_dict(transactions_data)

        if df.empty or len(df) < 5:
            # Not enough data for meaningful analysis
            return PredictionResponse(
                insights=[
                    InsightResponse(
                        type="info",
                        severity="info",
                        title="데이터 수집 중",
                        description="아직 충분한 데이터가 없습니다. 지출 내역을 더 추가해주세요.",
                        suggested_action="최소 5개 이상의 거래 내역을 입력하면 AI 분석이 시작됩니다.",
                    )
                ],
                spending_persona="신규 사용자",
                trend_analysis=None,
            )

        # Preprocess data
        df = preprocessor.clean(df)
        df = preprocessor.validate(df)

        # Feature engineering
        monthly_features = feature_engineer.create_monthly_features(df)
        category_features = feature_engineer.aggregate_by_category(df)

        # Generate insights list
        insights: List[InsightResponse] = []

        # 1. Spending Persona (Clustering)
        persona = "균형잡힌 소비자"
        if clusterer.is_trained() and len(monthly_features) > 0:
            cluster_label = clusterer.predict(monthly_features.iloc[-1:])
            persona = clusterer.get_persona_name(cluster_label[0])

        # 2. Trend Detection
        trend_insights = trend_detector.detect_trends(df, category_features)
        insights.extend(trend_insights)

        # 3. Overspending Risk
        if request.current_month_budget:
            risk_insights = risk_predictor.predict_overspending(
                df, category_features, request.current_month_budget
            )
            insights.extend(risk_insights)

        # 4. Category Analysis
        category_insights = _analyze_categories(category_features, request.current_month_budget)
        insights.extend(category_insights)

        # 5. Savings Opportunities
        savings_insights = _find_savings_opportunities(df, category_features)
        insights.extend(savings_insights)

        # Calculate trend analysis
        trend_analysis = _calculate_trend_analysis(monthly_features, category_features)

        return PredictionResponse(
            insights=insights[:10],  # Limit to top 10 insights
            spending_persona=persona,
            trend_analysis=trend_analysis,
        )

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to generate insights: {str(e)}"
        )


def _analyze_categories(
    category_features: Any, budgets: Optional[Dict[str, float]]
) -> List[InsightResponse]:
    """Analyze spending by category"""
    insights = []

    if budgets:
        for category, spent in category_features["total_amount"].items():
            budget = budgets.get(category, 0)
            if budget > 0:
                percentage = (spent / budget) * 100
                if percentage >= 90:
                    insights.append(
                        InsightResponse(
                            type="category_warning",
                            severity="warning" if percentage < 100 else "critical",
                            title=f"{category} 예산 초과 위험",
                            description=f"{category} 카테고리 지출이 예산의 {percentage:.0f}%에 도달했습니다.",
                            suggested_action="남은 기간 동안 해당 카테고리 지출을 줄여보세요.",
                            category=category,
                        )
                    )

    return insights


def _find_savings_opportunities(df: Any, category_features: Any) -> List[InsightResponse]:
    """Find potential savings opportunities"""
    insights = []

    # Example: Frequent small transactions that add up
    food_transactions = df[df["category"] == "food"]
    if len(food_transactions) > 0:
        avg_food = food_transactions["amount"].mean()
        if avg_food < 10000:  # Many small purchases
            total_saved = avg_food * len(food_transactions) * 0.2  # Potential 20% savings
            insights.append(
                InsightResponse(
                    type="savings_opportunity",
                    severity="info",
                    title="소액 지출 누적 감지",
                    description=f"작은 금액의 식비 지출이 {len(food_transactions)}건 발생했습니다.",
                    suggested_action="커피나 간식을 집에서 준비하면 비용을 절약할 수 있어요.",
                    potential_savings=total_saved,
                    category="food",
                )
            )

    return insights


def _calculate_trend_analysis(monthly_features: Any, category_features: Any) -> Dict[str, Any]:
    """Calculate overall trend analysis"""
    if len(monthly_features) < 2:
        return {
            "month_over_month_change": 0,
            "category_trends": {},
        }

    # Month-over-month change
    current_month_total = monthly_features.iloc[-1]["total_amount"]
    previous_month_total = monthly_features.iloc[-2]["total_amount"]
    mom_change = (
        ((current_month_total - previous_month_total) / previous_month_total) * 100
        if previous_month_total > 0
        else 0
    )

    return {
        "month_over_month_change": round(mom_change, 2),
        "category_trends": {},  # Could add more detailed category trends here
    }


@app.post("/train")
async def train_models(authenticated: bool = Depends(verify_api_key)):
    """
    Retrain ML models with latest data
    (In production, this would be called periodically or triggered by data updates)
    """
    try:
        # This would typically load data from a database or data warehouse
        # For now, just return success
        return {
            "status": "success",
            "message": "Models training initiated",
            "timestamp": datetime.now().isoformat(),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Training failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)

