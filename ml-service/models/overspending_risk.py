"""
Overspending Risk Prediction Model
Predicts likelihood of exceeding budget based on current spending patterns
"""

import pandas as pd
import numpy as np
from typing import Dict, List
from sklearn.linear_model import LogisticRegression
import joblib
import os


class OverspendingRiskPredictor:
    """
    Predict overspending risk for each category
    
    Uses simple rules and (optionally) logistic regression
    """

    def __init__(self, model_path="trained_models/risk_model.joblib"):
        self.model_path = model_path
        self.model = None
        self._trained = False

        # Try to load existing model
        self._load_model()

    def predict_overspending(
        self,
        df: pd.DataFrame,
        category_features: pd.DataFrame,
        budgets: Dict[str, float],
    ) -> List[dict]:
        """
        Predict overspending risk based on current month spending
        
        Args:
            df: Transaction DataFrame
            category_features: Category aggregation
            budgets: Budget dict {category: amount}
            
        Returns:
            List of risk insights
        """
        insights = []

        df = df.copy()
        df["date"] = pd.to_datetime(df["date"])

        # Get current month data
        current_month = df["date"].max().to_period("M")
        current_data = df[df["date"].dt.to_period("M") == current_month]

        # Days elapsed and remaining in current month
        days_in_month = current_month.days_in_month
        current_day = df["date"].max().day
        days_remaining = days_in_month - current_day

        if days_remaining <= 0:
            return insights

        # Analyze each category with a budget
        for category, budget in budgets.items():
            if budget == 0:
                continue

            cat_spent = current_data[current_data["category"] == category][
                "amount"
            ].sum()
            remaining = budget - cat_spent
            percentage_used = (cat_spent / budget) * 100

            # Calculate daily burn rate
            daily_rate = cat_spent / current_day
            projected_total = daily_rate * days_in_month

            # Risk assessment
            if percentage_used >= 90:
                insights.append(
                    {
                        "type": "category_warning",
                        "severity": "critical",
                        "title": f"{category} 예산 초과 위험!",
                        "description": f"이미 예산의 {percentage_used:.0f}%를 사용했습니다. 남은 예산: {remaining:,.0f}원",
                        "suggested_action": f"이번 달 남은 {days_remaining}일 동안 {category} 지출을 최소화하세요.",
                        "category": category,
                    }
                )
            elif projected_total > budget:
                overspend_amount = projected_total - budget
                insights.append(
                    {
                        "type": "overspending",
                        "severity": "warning",
                        "title": f"{category} 예산 초과 예상",
                        "description": f"현재 속도로 지출하면 예산을 {overspend_amount:,.0f}원 초과할 것으로 예상됩니다.",
                        "suggested_action": f"일일 {category} 지출을 {daily_rate * 0.7:,.0f}원 이하로 줄이세요.",
                        "category": category,
                    }
                )
            elif percentage_used >= 70:
                insights.append(
                    {
                        "type": "category_warning",
                        "severity": "warning",
                        "title": f"{category} 예산의 {percentage_used:.0f}% 사용",
                        "description": f"남은 예산: {remaining:,.0f}원",
                        "suggested_action": "이번 달 남은 기간 동안 지출에 주의하세요.",
                        "category": category,
                    }
                )

        return insights

    def train(self, X: np.ndarray, y: np.ndarray):
        """
        Train logistic regression model for overspending prediction
        
        Args:
            X: Feature matrix
            y: Binary labels (0: within budget, 1: exceeded budget)
        """
        self.model = LogisticRegression(random_state=42)
        self.model.fit(X, y)
        self._trained = True
        self.save_model()
        return self

    def save_model(self):
        """Save trained model"""
        if not self.is_trained():
            return

        os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
        joblib.dump(self.model, self.model_path)

    def _load_model(self):
        """Load trained model"""
        if os.path.exists(self.model_path):
            try:
                self.model = joblib.load(self.model_path)
                self._trained = True
            except Exception as e:
                print(f"Failed to load risk model: {e}")
                self._trained = False

    def is_trained(self) -> bool:
        """Check if model is trained"""
        return self._trained and self.model is not None

