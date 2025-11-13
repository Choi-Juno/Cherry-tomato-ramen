"""
Overspending Risk Model
Predicts likelihood of overspending based on current patterns
"""

import numpy as np
from typing import Dict, List


class OverspendingPredictor:
    """Predict overspending risk"""
    
    def __init__(self):
        """Initialize predictor"""
        pass
    
    def predict_overspending_risk(
        self,
        current_spending: Dict[str, float],
        budget: Dict[str, float],
        historical_avg: Dict[str, float] = None,
        days_remaining: int = 15
    ) -> Dict:
        """
        Predict risk of overspending in each category
        
        Args:
            current_spending: Current month spending by category
            budget: Budget by category
            historical_avg: Historical average spending (optional)
            days_remaining: Days remaining in the month
        
        Returns:
            Dict with risk assessment
        """
        risks = {}
        overall_risk_score = 0
        high_risk_categories = []
        
        for category, budget_amount in budget.items():
            spent = current_spending.get(category, 0)
            
            # Calculate metrics
            spent_pct = (spent / budget_amount * 100) if budget_amount > 0 else 0
            remaining = max(0, budget_amount - spent)
            
            # Project spending to end of month
            if days_remaining > 0:
                days_in_month = 30
                days_elapsed = days_in_month - days_remaining
                if days_elapsed > 0:
                    daily_rate = spent / days_elapsed
                    projected_total = daily_rate * days_in_month
                    projected_over = max(0, projected_total - budget_amount)
                else:
                    projected_total = 0
                    projected_over = 0
            else:
                projected_total = spent
                projected_over = max(0, spent - budget_amount)
            
            # Calculate risk score (0-100)
            risk_score = 0
            risk_factors = []
            
            # Factor 1: Current spending percentage
            if spent_pct >= 100:
                risk_score += 50
                risk_factors.append("이미 예산 초과")
            elif spent_pct >= 90:
                risk_score += 40
                risk_factors.append("예산 90% 초과")
            elif spent_pct >= 80:
                risk_score += 30
                risk_factors.append("예산 80% 초과")
            elif spent_pct >= 70:
                risk_score += 20
                risk_factors.append("예산 70% 초과")
            
            # Factor 2: Projected overspending
            if projected_over > 0:
                over_pct = (projected_over / budget_amount * 100) if budget_amount > 0 else 0
                if over_pct > 20:
                    risk_score += 30
                    risk_factors.append(f"예상 초과: {over_pct:.0f}%")
                elif over_pct > 10:
                    risk_score += 20
                    risk_factors.append(f"예상 초과: {over_pct:.0f}%")
                else:
                    risk_score += 10
                    risk_factors.append(f"초과 우려")
            
            # Factor 3: Historical comparison
            if historical_avg and category in historical_avg:
                hist_avg = historical_avg[category]
                if hist_avg > 0:
                    vs_hist = (spent / hist_avg - 1) * 100
                    if vs_hist > 50:
                        risk_score += 20
                        risk_factors.append(f"평균 대비 +{vs_hist:.0f}%")
                    elif vs_hist > 25:
                        risk_score += 10
                        risk_factors.append(f"평균 대비 +{vs_hist:.0f}%")
            
            # Cap at 100
            risk_score = min(100, risk_score)
            
            # Determine risk level
            if risk_score >= 70:
                risk_level = "high"
                risk_label = "높음"
                emoji = "🚨"
                high_risk_categories.append(category)
            elif risk_score >= 40:
                risk_level = "medium"
                risk_label = "보통"
                emoji = "⚠️"
            else:
                risk_level = "low"
                risk_label = "낮음"
                emoji = "✅"
            
            risks[category] = {
                "risk_score": float(risk_score),
                "risk_level": risk_level,
                "risk_label": risk_label,
                "emoji": emoji,
                "spent": float(spent),
                "budget": float(budget_amount),
                "remaining": float(remaining),
                "spent_percentage": float(spent_pct),
                "projected_total": float(projected_total),
                "projected_over": float(projected_over),
                "risk_factors": risk_factors
            }
            
            # Add to overall risk
            overall_risk_score += risk_score / len(budget)
        
        # Determine overall risk level
        if overall_risk_score >= 50:
            overall_level = "high"
            overall_label = "높은 위험"
            overall_emoji = "🚨"
            overall_message = "예산 관리에 주의가 필요합니다"
        elif overall_risk_score >= 30:
            overall_level = "medium"
            overall_label = "보통 위험"
            overall_emoji = "⚠️"
            overall_message = "몇몇 카테고리 지출을 점검하세요"
        else:
            overall_level = "low"
            overall_label = "낮은 위험"
            overall_emoji = "✅"
            overall_message = "잘 관리하고 있습니다"
        
        return {
            "overall_risk_score": float(overall_risk_score),
            "overall_risk_level": overall_level,
            "overall_risk_label": overall_label,
            "overall_emoji": overall_emoji,
            "overall_message": overall_message,
            "high_risk_categories": high_risk_categories,
            "category_risks": risks,
            "days_remaining": days_remaining
        }
    
    def generate_savings_recommendations(
        self,
        current_spending: Dict[str, float],
        budget: Dict[str, float]
    ) -> List[Dict]:
        """
        Generate recommendations for reducing spending
        
        Args:
            current_spending: Current spending by category
            budget: Budget by category
        
        Returns:
            List of recommendation dicts
        """
        recommendations = []
        
        # Identify overspending categories
        for category, budget_amount in budget.items():
            spent = current_spending.get(category, 0)
            overspend = spent - budget_amount
            
            if overspend > 0:
                savings_potential = overspend * 0.3  # Assume can save 30%
                
                # Category-specific tips
                tips = self._get_category_tips(category)
                
                recommendations.append({
                    "category": category,
                    "overspend_amount": float(overspend),
                    "savings_potential": float(savings_potential),
                    "tips": tips
                })
        
        # Sort by overspend amount
        recommendations.sort(key=lambda x: x['overspend_amount'], reverse=True)
        
        return recommendations
    
    def _get_category_tips(self, category: str) -> List[str]:
        """Get saving tips for a category"""
        tips_map = {
            "food": [
                "주 2회 직접 요리하기",
                "배달 음식 줄이기",
                "장보기 전 식단 계획하기",
                "할인 쿠폰 활용하기"
            ],
            "transport": [
                "대중교통 이용하기",
                "카풀 앱 사용하기",
                "자전거/도보 이용하기",
                "교통카드 할인 혜택 확인하기"
            ],
            "shopping": [
                "충동 구매 자제하기",
                "24시간 대기 후 구매하기",
                "중고 거래 고려하기",
                "할인 기간 활용하기"
            ],
            "entertainment": [
                "무료 문화 행사 찾기",
                "구독 서비스 정리하기",
                "도서관 이용하기",
                "공원/무료 공간 활용하기"
            ],
            "education": [
                "무료 온라인 강의 활용",
                "도서관 자료 활용",
                "스터디 그룹 만들기",
                "중고 교재 구매하기"
            ]
        }
        
        return tips_map.get(category, ["지출 줄이기", "예산 준수하기"])


# Singleton instance
_overspending_predictor = None

def get_overspending_predictor() -> OverspendingPredictor:
    """Get or create overspending predictor singleton instance"""
    global _overspending_predictor
    if _overspending_predictor is None:
        _overspending_predictor = OverspendingPredictor()
    return _overspending_predictor

