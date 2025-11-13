"""
Feature Engineer for Transaction Data
Creates features for ML models
"""

import pandas as pd
import numpy as np
from typing import Dict, List


class FeatureEngineer:
    """Create features from transaction data"""

    def create_monthly_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Aggregate transactions by month and create features
        
        Returns:
            DataFrame with one row per month containing aggregated features
        """
        df = df.copy()

        # Ensure temporal features exist
        if "year_month" not in df.columns:
            df["year_month"] = pd.to_datetime(df["date"]).dt.to_period("M").astype(str)

        # Group by month
        monthly_stats = (
            df.groupby("year_month")
            .agg(
                {
                    "amount": ["sum", "mean", "std", "count", "min", "max"],
                    "category": lambda x: x.nunique(),  # Number of unique categories
                }
            )
            .reset_index()
        )

        # Flatten column names
        monthly_stats.columns = [
            "year_month",
            "total_amount",
            "avg_amount",
            "std_amount",
            "transaction_count",
            "min_amount",
            "max_amount",
            "unique_categories",
        ]

        # Fill NaN std with 0 (happens when only 1 transaction in month)
        monthly_stats["std_amount"] = monthly_stats["std_amount"].fillna(0)

        # Add derived features
        monthly_stats["avg_per_day"] = monthly_stats["total_amount"] / 30

        return monthly_stats

    def aggregate_by_category(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Aggregate spending by category
        
        Returns:
            DataFrame with spending totals per category
        """
        category_stats = (
            df.groupby("category")
            .agg(
                {
                    "amount": ["sum", "mean", "count"],
                }
            )
            .reset_index()
        )

        category_stats.columns = [
            "category",
            "total_amount",
            "avg_amount",
            "transaction_count",
        ]

        return category_stats

    def create_trend_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Create trend features for each category
        Compares recent period with previous period
        """
        df = df.copy()

        # Get current month and previous month
        df["date"] = pd.to_datetime(df["date"])
        current_month = df["date"].max().to_period("M")
        previous_month = current_month - 1

        # Filter data
        current_data = df[df["date"].dt.to_period("M") == current_month]
        previous_data = df[df["date"].dt.to_period("M") == previous_month]

        # Aggregate by category
        current_by_cat = current_data.groupby("category")["amount"].sum()
        previous_by_cat = previous_data.groupby("category")["amount"].sum()

        # Calculate changes
        trends = pd.DataFrame(
            {
                "category": current_by_cat.index,
                "current_amount": current_by_cat.values,
                "previous_amount": previous_by_cat.reindex(
                    current_by_cat.index, fill_value=0
                ).values,
            }
        )

        trends["change_amount"] = (
            trends["current_amount"] - trends["previous_amount"]
        )
        trends["change_percent"] = np.where(
            trends["previous_amount"] > 0,
            (trends["change_amount"] / trends["previous_amount"]) * 100,
            0,
        )

        return trends

    def create_spending_patterns(self, df: pd.DataFrame) -> Dict[str, any]:
        """
        Analyze spending patterns
        
        Returns:
            Dictionary with various pattern metrics
        """
        df = df.copy()
        df["date"] = pd.to_datetime(df["date"])

        patterns = {}

        # Weekend vs Weekday spending
        df["is_weekend"] = df["date"].dt.dayofweek.isin([5, 6])
        patterns["weekend_spending_ratio"] = (
            df[df["is_weekend"]]["amount"].sum() / df["amount"].sum()
            if len(df) > 0
            else 0
        )

        # Most active spending category
        category_totals = df.groupby("category")["amount"].sum()
        if len(category_totals) > 0:
            patterns["top_category"] = category_totals.idxmax()
            patterns["top_category_percentage"] = (
                category_totals.max() / df["amount"].sum()
            ) * 100

        # Spending frequency
        patterns["avg_transactions_per_day"] = len(df) / (
            (df["date"].max() - df["date"].min()).days + 1
        )

        # Average transaction size
        patterns["avg_transaction_size"] = df["amount"].mean()

        return patterns

    def create_user_vector(self, df: pd.DataFrame) -> np.ndarray:
        """
        Create a feature vector representing user's spending behavior
        Used for clustering
        
        Returns:
            Numpy array of features
        """
        if len(df) == 0:
            return np.zeros(10)

        # Category spending distribution (8 categories)
        categories = [
            "food",
            "transport",
            "shopping",
            "entertainment",
            "education",
            "health",
            "utilities",
            "other",
        ]
        total_spending = df["amount"].sum()

        category_ratios = []
        for cat in categories:
            cat_spending = df[df["category"] == cat]["amount"].sum()
            ratio = cat_spending / total_spending if total_spending > 0 else 0
            category_ratios.append(ratio)

        # Additional features
        avg_transaction = df["amount"].mean()
        std_transaction = df["amount"].std()

        # Combine features
        features = np.array(category_ratios + [avg_transaction, std_transaction])

        return features

