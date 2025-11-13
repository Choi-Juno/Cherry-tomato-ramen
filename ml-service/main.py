"""
FastAPI ML Service
Main application for AI-powered spending insights
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional, Any
import sys
import os
import numpy as np

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from pipeline.data_loader import get_data_loader
from pipeline.preprocessor import get_preprocessor
from models.clustering import get_cluster_model
from models.trend import get_trend_analyzer
from models.overspending import get_overspending_predictor

# Initialize FastAPI app
app = FastAPI(
    title="AI Spending Coach API",
    description="ML-powered spending insights for university students",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Helper function to convert numpy types to Python native types
def convert_numpy_types(obj: Any) -> Any:
    """Convert numpy types to Python native types for JSON serialization"""
    if isinstance(obj, np.integer):
        return int(obj)
    elif isinstance(obj, np.floating):
        return float(obj)
    elif isinstance(obj, np.bool_):
        return bool(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, dict):
        return {key: convert_numpy_types(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [convert_numpy_types(item) for item in obj]
    return obj

# Pydantic models for request/response
class Transaction(BaseModel):
    date: str
    amount: float
    category: str
    description: str
    merchant: Optional[str] = None

class InsightRequest(BaseModel):
    user_id: str
    transactions: List[Transaction]
    current_month_budget: Dict[str, float]

class InsightResponse(BaseModel):
    user_id: str
    insights: List[Dict]
    persona: Optional[Dict] = None
    trends: Optional[Dict] = None
    overspending_risks: Optional[Dict] = None

# Global variables for models
data_loader = None
preprocessor = None
cluster_model = None
trend_analyzer = None
overspending_predictor = None


@app.on_event("startup")
async def startup_event():
    """Initialize models on startup"""
    global data_loader, preprocessor, cluster_model, trend_analyzer, overspending_predictor
    
    print("🚀 Starting ML Service...")
    
    # Initialize components
    data_loader = get_data_loader()
    preprocessor = get_preprocessor()
    trend_analyzer = get_trend_analyzer()
    overspending_predictor = get_overspending_predictor()
    
    try:
        # Load or train models
        print("📊 Loading dataset...")
        df = data_loader.load_dataset()
        
        # Engineer features
        print("🔧 Engineering features...")
        df_eng = preprocessor.engineer_features(df)
        
        # Prepare features for clustering
        print("🤖 Training clustering model...")
        X_cluster = preprocessor.prepare_for_clustering(df_eng)
        
        # Train clustering model
        cluster_model = get_cluster_model()
        cluster_model.fit(X_cluster)
        
        # Save models
        cluster_model.save()
        
        print("✅ ML Service ready!")
        
    except Exception as e:
        print(f"❌ Error during startup: {e}")
        raise


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "AI Spending Coach",
        "status": "running",
        "version": "1.0.0"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "models_loaded": cluster_model is not None and cluster_model.is_fitted
    }


@app.post("/predict/insights", response_model=InsightResponse)
async def generate_insights(request: InsightRequest):
    """
    Generate AI-powered spending insights
    
    Args:
        request: User transactions and budget data
    
    Returns:
        AI insights, persona, trends, and risk assessment
    """
    try:
        # Convert transactions to dict (Pydantic V2 uses model_dump)
        transactions = [t.model_dump() for t in request.transactions]
        
        if not transactions:
            raise HTTPException(
                status_code=400,
                detail="No transactions provided"
            )
        
        # Convert transactions to features
        user_features_df = data_loader.convert_user_transactions_to_features(transactions)
        user_features_eng = preprocessor.engineer_features(user_features_df)
        
        # Get category totals
        category_totals = data_loader.get_category_totals(transactions)
        
        # Get monthly trend
        monthly_trend = data_loader.get_monthly_trend(transactions, months=3)
        
        # Generate insights list
        insights = []
        
        # 1. Spending Persona Analysis
        persona_result = None
        if cluster_model and cluster_model.is_fitted:
            X_user = preprocessor.prepare_for_clustering(user_features_eng)
            persona_result = cluster_model.analyze_user_persona(X_user[0])
            
            insights.append({
                "type": "spending_persona",
                "severity": "info",
                "title": f"당신의 소비 패턴: {persona_result['persona_name']}",
                "description": persona_result['description'],
                "suggested_action": f"강점: {', '.join(persona_result['strengths'])}",
                "potential_savings": 0,
                "category": None
            })
        
        # 2. Trend Analysis
        trend_results = {}
        if monthly_trend:
            overall_trend = trend_analyzer.analyze_trend(monthly_trend)
            trend_results['overall'] = overall_trend
            
            if overall_trend['trend_type'] == 'increasing':
                insights.append({
                    "type": "trend_increase",
                    "severity": "warning",
                    "title": f"지출이 {overall_trend['emoji']} 증가하고 있어요",
                    "description": f"최근 3개월간 지출이 {abs(overall_trend['percent_change']):.1f}% 증가했습니다.",
                    "suggested_action": "지출 패턴을 점검하고 불필요한 소비를 줄여보세요",
                    "potential_savings": None,
                    "category": None
                })
            elif overall_trend['trend_type'] == 'decreasing':
                insights.append({
                    "type": "trend_decrease",
                    "severity": "info",
                    "title": f"지출이 {overall_trend['emoji']} 감소했어요! 👏",
                    "description": f"최근 3개월간 지출이 {abs(overall_trend['percent_change']):.1f}% 감소했습니다. 잘하고 계세요!",
                    "suggested_action": "현재의 좋은 습관을 유지하세요",
                    "potential_savings": None,
                    "category": None
                })
        
        # 3. Overspending Risk Analysis
        overspending_result = None
        if request.current_month_budget:
            from datetime import datetime
            days_in_month = 30
            today = datetime.now().day
            days_remaining = days_in_month - today
            
            overspending_result = overspending_predictor.predict_overspending_risk(
                current_spending=category_totals,
                budget=request.current_month_budget,
                days_remaining=days_remaining
            )
            
            # Add high-risk categories as insights
            for category in overspending_result.get('high_risk_categories', []):
                risk_detail = overspending_result['category_risks'][category]
                
                # Map internal category names to Korean
                category_labels = {
                    'food': '식비',
                    'transport': '교통비',
                    'shopping': '쇼핑',
                    'entertainment': '문화/여가',
                    'education': '교육',
                    'health': '의료/건강'
                }
                
                category_kr = category_labels.get(category, category)
                
                insights.append({
                    "type": "overspending",
                    "severity": "warning" if risk_detail['risk_level'] == 'high' else "critical",
                    "title": f"{category_kr} 예산 초과 위험",
                    "description": f"현재 {risk_detail['spent_percentage']:.0f}% 사용 중입니다. {', '.join(risk_detail['risk_factors'])}",
                    "suggested_action": f"남은 기간 동안 {category_kr} 지출을 {risk_detail['remaining']:.0f}원 이하로 유지하세요",
                    "potential_savings": risk_detail.get('projected_over', 0),
                    "category": category
                })
        
        # 4. Category-specific insights
        for category, amount in category_totals.items():
            if category in request.current_month_budget:
                budget_amount = request.current_month_budget[category]
                pct_used = (amount / budget_amount * 100) if budget_amount > 0 else 0
                
                category_labels = {
                    'food': '식비',
                    'transport': '교통비',
                    'shopping': '쇼핑',
                    'entertainment': '문화/여가',
                    'education': '교육',
                    'health': '의료/건강'
                }
                
                category_kr = category_labels.get(category, category)
                
                if pct_used >= 90:
                    insights.append({
                        "type": "category_warning",
                        "severity": "warning",
                        "title": f"{category_kr} 예산이 곧 소진됩니다",
                        "description": f"이번 달 {category_kr} 예산의 {pct_used:.0f}%를 사용했습니다.",
                        "suggested_action": f"남은 기간 동안 {category_kr} 지출을 최소화하세요",
                        "potential_savings": None,
                        "category": category
                    })
        
        # 5. Savings opportunities
        if overspending_result:
            recommendations = overspending_predictor.generate_savings_recommendations(
                current_spending=category_totals,
                budget=request.current_month_budget
            )
            
            for rec in recommendations[:2]:  # Top 2 opportunities
                category_labels = {
                    'food': '식비',
                    'transport': '교통비',
                    'shopping': '쇼핑',
                    'entertainment': '문화/여가',
                    'education': '교육',
                    'health': '의료/건강'
                }
                
                category_kr = category_labels.get(rec['category'], rec['category'])
                
                insights.append({
                    "type": "savings_opportunity",
                    "severity": "info",
                    "title": f"{category_kr} 절약 기회",
                    "description": f"{category_kr}에서 예산을 {rec['overspend_amount']:.0f}원 초과했습니다.",
                    "suggested_action": rec['tips'][0] if rec['tips'] else "지출을 줄여보세요",
                    "potential_savings": rec['savings_potential'],
                    "category": rec['category']
                })
        
        # Sort insights by severity
        severity_order = {'critical': 0, 'warning': 1, 'info': 2}
        insights.sort(key=lambda x: severity_order.get(x['severity'], 3))
        
        # Convert all numpy types to Python native types for JSON serialization
        insights = convert_numpy_types(insights)
        persona_result = convert_numpy_types(persona_result)
        trend_results = convert_numpy_types(trend_results)
        overspending_result = convert_numpy_types(overspending_result)
        
        return InsightResponse(
            user_id=request.user_id,
            insights=insights,
            persona=persona_result,
            trends=trend_results,
            overspending_risks=overspending_result
        )
        
    except Exception as e:
        print(f"Error generating insights: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
