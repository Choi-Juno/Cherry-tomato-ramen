"""
Trend Analysis Model
Detects spending trends and patterns over time
"""

import numpy as np
from typing import Dict, List, Tuple
from scipy import stats


class TrendAnalyzer:
    """Analyze spending trends over time"""
    
    def __init__(self):
        """Initialize trend analyzer"""
        self.trend_threshold = 0.1  # 10% change threshold
        
    def analyze_trend(
        self, 
        values: List[float],
        periods: List[str] = None
    ) -> Dict:
        """
        Analyze trend in a time series of values
        
        Args:
            values: List of values (e.g., monthly spending)
            periods: List of period labels (optional)
        
        Returns:
            Dict with trend analysis
        """
        if not values or len(values) < 2:
            return self._get_no_data_result()
        
        # Convert to numpy array
        values_arr = np.array(values)
        
        # Remove zeros for percentage calculations
        non_zero_values = values_arr[values_arr > 0]
        
        if len(non_zero_values) < 2:
            return self._get_no_data_result()
        
        # Calculate linear regression
        x = np.arange(len(values))
        slope, intercept, r_value, p_value, std_err = stats.linregress(x, values_arr)
        
        # Determine trend direction
        avg_value = np.mean(non_zero_values)
        percent_change = (slope / avg_value) * 100 if avg_value > 0 else 0
        
        # Classify trend
        if abs(percent_change) < self.trend_threshold:
            trend_type = "stable"
            trend_label = "안정적"
            emoji = "➡️"
        elif percent_change > 0:
            trend_type = "increasing"
            trend_label = "증가"
            emoji = "📈"
        else:
            trend_type = "decreasing"
            trend_label = "감소"
            emoji = "📉"
        
        # Calculate month-over-month changes
        mom_changes = []
        for i in range(1, len(values)):
            if values[i-1] > 0:
                change_pct = ((values[i] - values[i-1]) / values[i-1]) * 100
                mom_changes.append(change_pct)
        
        # Statistical significance
        is_significant = p_value < 0.05 if p_value is not None else False
        
        return {
            "trend_type": trend_type,
            "trend_label": trend_label,
            "emoji": emoji,
            "slope": float(slope),
            "percent_change": float(percent_change),
            "r_squared": float(r_value ** 2) if r_value else 0,
            "is_significant": is_significant,
            "average": float(avg_value),
            "current": float(values[-1]),
            "previous": float(values[-2]) if len(values) >= 2 else 0,
            "mom_change": mom_changes[-1] if mom_changes else 0,
            "volatility": float(np.std(values_arr)) if len(values_arr) > 1 else 0
        }
    
    def analyze_category_trends(
        self,
        category_data: Dict[str, List[float]]
    ) -> Dict[str, Dict]:
        """
        Analyze trends for multiple categories
        
        Args:
            category_data: Dict mapping category name to list of values
        
        Returns:
            Dict mapping category name to trend analysis
        """
        results = {}
        
        for category, values in category_data.items():
            results[category] = self.analyze_trend(values)
        
        return results
    
    def detect_anomalies(
        self,
        values: List[float],
        threshold: float = 2.0
    ) -> List[int]:
        """
        Detect anomalous spending (outliers)
        
        Args:
            values: List of spending values
            threshold: Number of standard deviations for anomaly
        
        Returns:
            List of indices where anomalies were detected
        """
        if len(values) < 3:
            return []
        
        values_arr = np.array(values)
        mean = np.mean(values_arr)
        std = np.std(values_arr)
        
        if std == 0:
            return []
        
        # Z-score method
        z_scores = np.abs((values_arr - mean) / std)
        anomaly_indices = np.where(z_scores > threshold)[0].tolist()
        
        return anomaly_indices
    
    def compare_to_average(
        self,
        current_value: float,
        historical_values: List[float]
    ) -> Dict:
        """
        Compare current spending to historical average
        
        Args:
            current_value: Current period spending
            historical_values: List of historical spending values
        
        Returns:
            Dict with comparison results
        """
        if not historical_values:
            return {
                "comparison": "no_data",
                "message": "비교할 데이터가 없습니다"
            }
        
        avg = np.mean(historical_values)
        std = np.std(historical_values)
        
        if avg == 0:
            return {
                "comparison": "no_data",
                "message": "평균 지출이 0입니다"
            }
        
        diff_pct = ((current_value - avg) / avg) * 100
        
        # Categorize
        if abs(diff_pct) < 10:
            comparison = "similar"
            message = f"평균과 비슷합니다 ({diff_pct:+.1f}%)"
            emoji = "👍"
        elif diff_pct > 0:
            if diff_pct > 30:
                comparison = "much_higher"
                message = f"평균보다 매우 높습니다 (+{diff_pct:.1f}%)"
                emoji = "⚠️"
            else:
                comparison = "higher"
                message = f"평균보다 높습니다 (+{diff_pct:.1f}%)"
                emoji = "⬆️"
        else:
            if diff_pct < -30:
                comparison = "much_lower"
                message = f"평균보다 매우 낮습니다 ({diff_pct:.1f}%)"
                emoji = "🎉"
            else:
                comparison = "lower"
                message = f"평균보다 낮습니다 ({diff_pct:.1f}%)"
                emoji = "⬇️"
        
        # Z-score for statistical significance
        z_score = (current_value - avg) / std if std > 0 else 0
        is_anomaly = abs(z_score) > 2
        
        return {
            "comparison": comparison,
            "message": message,
            "emoji": emoji,
            "difference_amount": float(current_value - avg),
            "difference_percent": float(diff_pct),
            "average": float(avg),
            "current": float(current_value),
            "z_score": float(z_score),
            "is_anomaly": is_anomaly
        }
    
    def predict_next_month(
        self,
        values: List[float],
        confidence: float = 0.95
    ) -> Dict:
        """
        Simple prediction for next month's spending
        
        Args:
            values: Historical spending values
            confidence: Confidence level for prediction interval
        
        Returns:
            Dict with prediction
        """
        if len(values) < 2:
            return {
                "prediction": 0,
                "confidence_interval": (0, 0),
                "method": "insufficient_data"
            }
        
        # Linear regression for trend
        x = np.arange(len(values))
        slope, intercept, r_value, p_value, std_err = stats.linregress(x, values)
        
        # Predict next value
        next_x = len(values)
        prediction = slope * next_x + intercept
        
        # Calculate confidence interval
        residuals = np.array(values) - (slope * x + intercept)
        residual_std = np.std(residuals)
        margin = residual_std * 1.96  # 95% confidence
        
        lower_bound = max(0, prediction - margin)
        upper_bound = prediction + margin
        
        return {
            "prediction": float(max(0, prediction)),
            "confidence_interval": (float(lower_bound), float(upper_bound)),
            "method": "linear_regression",
            "r_squared": float(r_value ** 2) if r_value else 0
        }
    
    def _get_no_data_result(self) -> Dict:
        """Return default result for no data"""
        return {
            "trend_type": "unknown",
            "trend_label": "데이터 부족",
            "emoji": "❓",
            "slope": 0,
            "percent_change": 0,
            "r_squared": 0,
            "is_significant": False,
            "average": 0,
            "current": 0,
            "previous": 0,
            "mom_change": 0,
            "volatility": 0
        }


# Singleton instance
_trend_analyzer = None

def get_trend_analyzer() -> TrendAnalyzer:
    """Get or create trend analyzer singleton instance"""
    global _trend_analyzer
    if _trend_analyzer is None:
        _trend_analyzer = TrendAnalyzer()
    return _trend_analyzer

