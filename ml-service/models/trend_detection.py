"""
Trend Detection Model
Detects significant changes in spending patterns
"""

import pandas as pd
import numpy as np
from typing import List


class TrendDetector:
    """
    Detect spending trends and anomalies
    
    Uses statistical methods to identify:
    - Month-over-month increases/decreases
    - Category-specific trends
    - Sudden spikes in spending
    """

    def __init__(self):
        # Thresholds for trend detection
        self.increase_threshold = 15.0  # % increase to flag
        self.decrease_threshold = -10.0  # % decrease to celebrate
        self.spike_threshold = 2.0  # Standard deviations for spike detection

    def detect_trends(
        self, df: pd.DataFrame, category_features: pd.DataFrame
    ) -> List[dict]:
        """
        Detect spending trends from transaction data
        
        Args:
            df: Raw transaction DataFrame
            category_features: Aggregated category features
            
        Returns:
            List of insight dictionaries
        """
        insights = []

        # Convert date to datetime if not already
        df = df.copy()
        df["date"] = pd.to_datetime(df["date"])

        # Get current and previous month data
        current_month = df["date"].max().to_period("M")
        previous_month = current_month - 1

        current_data = df[df["date"].dt.to_period("M") == current_month]
        previous_data = df[df["date"].dt.to_period("M") == previous_month]

        if len(previous_data) == 0:
            return insights

        # Overall trend
        current_total = current_data["amount"].sum()
        previous_total = previous_data["amount"].sum()

        if previous_total > 0:
            overall_change = ((current_total - previous_total) / previous_total) * 100

            if overall_change > self.increase_threshold:
                insights.append(
                    {
                        "type": "trend_increase",
                        "severity": "warning",
                        "title": f"총 지출이 {overall_change:.1f}% 증가했어요",
                        "description": f"지난달 대비 {abs(current_total - previous_total):,.0f}원 더 지출했습니다.",
                        "suggested_action": "어떤 카테고리에서 지출이 늘었는지 확인해보세요.",
                    }
                )
            elif overall_change < self.decrease_threshold:
                insights.append(
                    {
                        "type": "trend_decrease",
                        "severity": "info",
                        "title": f"지출이 {abs(overall_change):.1f}% 감소했어요! 👏",
                        "description": f"지난달 대비 {abs(current_total - previous_total):,.0f}원 절약했습니다.",
                        "suggested_action": "이번 달처럼 계속 유지해보세요!",
                    }
                )

        # Category-specific trends
        for category in df["category"].unique():
            current_cat = current_data[current_data["category"] == category][
                "amount"
            ].sum()
            previous_cat = previous_data[previous_data["category"] == category][
                "amount"
            ].sum()

            if previous_cat > 0:
                cat_change = ((current_cat - previous_cat) / previous_cat) * 100

                if cat_change > self.increase_threshold:
                    insights.append(
                        {
                            "type": "trend_increase",
                            "severity": "warning",
                            "title": f"{category} 지출이 증가하고 있어요",
                            "description": f"지난달 대비 {cat_change:.1f}% 증가했습니다.",
                            "suggested_action": f"{category} 카테고리 지출을 줄여보세요.",
                            "category": category,
                        }
                    )
                elif cat_change < self.decrease_threshold:
                    insights.append(
                        {
                            "type": "trend_decrease",
                            "severity": "info",
                            "title": f"{category} 지출이 감소했어요!",
                            "description": f"지난달 대비 {abs(cat_change):.1f}% 감소했습니다. 잘하고 계세요!",
                            "category": category,
                        }
                    )

        return insights

    def detect_spikes(self, df: pd.DataFrame) -> List[dict]:
        """
        Detect sudden spikes in daily spending
        
        Returns:
            List of spike insights
        """
        insights = []
        df = df.copy()
        df["date"] = pd.to_datetime(df["date"])

        # Daily aggregation
        daily_spending = df.groupby(df["date"].dt.date)["amount"].sum()

        if len(daily_spending) < 7:
            return insights

        mean_spending = daily_spending.mean()
        std_spending = daily_spending.std()

        # Find days with spending > mean + threshold*std
        spike_threshold = mean_spending + (self.spike_threshold * std_spending)
        spike_days = daily_spending[daily_spending > spike_threshold]

        if len(spike_days) > 0:
            for date, amount in spike_days.tail(3).items():  # Last 3 spikes
                insights.append(
                    {
                        "type": "spending_spike",
                        "severity": "warning",
                        "title": f"{date}에 지출이 급증했어요",
                        "description": f"평소보다 {amount - mean_spending:,.0f}원 더 지출했습니다.",
                        "suggested_action": "이런 급격한 지출을 줄이면 예산을 지킬 수 있어요.",
                    }
                )

        return insights

