"""
Data Preprocessor for Transaction Data
Cleans and validates data before feature engineering
"""

import pandas as pd
import numpy as np
from datetime import datetime


class DataPreprocessor:
    """Clean and validate transaction data"""

    def clean(self, df: pd.DataFrame) -> pd.DataFrame:
        """Clean transaction data"""
        df = df.copy()

        # Convert date to datetime
        df["date"] = pd.to_datetime(df["date"], errors="coerce")

        # Remove rows with invalid dates
        df = df.dropna(subset=["date"])

        # Convert amount to numeric
        df["amount"] = pd.to_numeric(df["amount"], errors="coerce")

        # Remove zero or negative amounts
        df = df[df["amount"] > 0]

        # Standardize category names to lowercase
        df["category"] = df["category"].str.lower().str.strip()

        # Remove duplicates
        df = df.drop_duplicates()

        # Sort by date
        df = df.sort_values("date")

        return df

    def validate(self, df: pd.DataFrame) -> pd.DataFrame:
        """Validate data quality"""
        df = df.copy()

        # Define valid categories
        valid_categories = [
            "food",
            "transport",
            "shopping",
            "entertainment",
            "education",
            "health",
            "utilities",
            "other",
        ]

        # Filter only valid categories
        df = df[df["category"].isin(valid_categories)]

        # Remove outliers (transactions > 1,000,000 KRW might be errors)
        df = df[df["amount"] <= 1_000_000]

        return df

    def handle_missing_values(self, df: pd.DataFrame) -> pd.DataFrame:
        """Handle missing values in optional fields"""
        df = df.copy()

        # Fill missing merchant with 'Unknown'
        if "merchant" in df.columns:
            df["merchant"] = df["merchant"].fillna("Unknown")

        # Fill missing payment_method with 'other'
        if "payment_method" in df.columns:
            df["payment_method"] = df["payment_method"].fillna("other")

        return df

    def add_temporal_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Add temporal features for better analysis"""
        df = df.copy()

        df["year"] = df["date"].dt.year
        df["month"] = df["date"].dt.month
        df["day"] = df["date"].dt.day
        df["day_of_week"] = df["date"].dt.dayofweek
        df["week_of_year"] = df["date"].dt.isocalendar().week
        df["is_weekend"] = df["day_of_week"].isin([5, 6]).astype(int)

        # Create year-month string for grouping
        df["year_month"] = df["date"].dt.to_period("M").astype(str)

        return df

