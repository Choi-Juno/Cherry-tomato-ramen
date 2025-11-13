"""
Preprocessor Module
Handles data cleaning, feature engineering, and transformation
"""

import pandas as pd
import numpy as np
from typing import List, Dict, Tuple
from sklearn.preprocessing import StandardScaler
import joblib
import os


class SpendingPreprocessor:
    """Preprocess and engineer features from spending data"""
    
    def __init__(self):
        """Initialize preprocessor"""
        self.scaler = StandardScaler()
        self.feature_columns = None
        self.is_fitted = False
        
    def fit(self, df: pd.DataFrame) -> 'SpendingPreprocessor':
        """
        Fit the preprocessor on training data
        
        Args:
            df: Training DataFrame
        
        Returns:
            Self for chaining
        """
        # Select numeric columns for scaling
        numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        
        # Exclude ID-like columns
        exclude_cols = []
        numeric_cols = [col for col in numeric_cols if col not in exclude_cols]
        
        self.feature_columns = numeric_cols
        
        # Fit scaler on numeric features
        if numeric_cols:
            self.scaler.fit(df[numeric_cols])
            self.is_fitted = True
        
        return self
    
    def transform(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Transform data using fitted preprocessor
        
        Args:
            df: DataFrame to transform
        
        Returns:
            Transformed DataFrame
        """
        if not self.is_fitted:
            raise ValueError("Preprocessor must be fitted before transform")
        
        df_transformed = df.copy()
        
        # Scale numeric features
        if self.feature_columns:
            df_transformed[self.feature_columns] = self.scaler.transform(
                df[self.feature_columns]
            )
        
        return df_transformed
    
    def fit_transform(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Fit and transform in one step
        
        Args:
            df: DataFrame to fit and transform
        
        Returns:
            Transformed DataFrame
        """
        return self.fit(df).transform(df)
    
    def engineer_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Create additional engineered features
        
        Args:
            df: Input DataFrame
        
        Returns:
            DataFrame with additional features
        """
        df_eng = df.copy()
        
        # Spending categories
        spending_cols = ['food', 'transportation', 'books_supplies', 
                        'entertainment', 'personal_care', 'technology',
                        'health_wellness', 'miscellaneous']
        
        # Ensure all columns exist
        for col in spending_cols:
            if col not in df_eng.columns:
                df_eng[col] = 0
        
        # Total spending
        df_eng['total_spending'] = df_eng[spending_cols].sum(axis=1)
        
        # Spending ratios (as percentage of total)
        for col in spending_cols:
            ratio_col = f'{col}_ratio'
            df_eng[ratio_col] = (
                df_eng[col] / (df_eng['total_spending'] + 1)  # +1 to avoid division by zero
            ) * 100
        
        # Discretionary vs necessary spending
        discretionary = ['entertainment', 'shopping', 'miscellaneous']
        necessary = ['food', 'transportation', 'books_supplies', 'health_wellness']
        
        df_eng['discretionary_spending'] = df_eng[
            [col for col in discretionary if col in df_eng.columns]
        ].sum(axis=1)
        
        df_eng['necessary_spending'] = df_eng[
            [col for col in necessary if col in df_eng.columns]
        ].sum(axis=1)
        
        # Financial health indicators
        if 'monthly_income' in df_eng.columns and 'total_spending' in df_eng.columns:
            df_eng['savings_potential'] = (
                df_eng['monthly_income'] - df_eng['total_spending']
            )
            df_eng['spending_ratio'] = (
                df_eng['total_spending'] / (df_eng['monthly_income'] + 1)
            ) * 100
        
        # High spending flags
        for col in spending_cols:
            if col in df_eng.columns:
                mean_val = df_eng[col].mean()
                std_val = df_eng[col].std()
                df_eng[f'{col}_high'] = (
                    df_eng[col] > mean_val + std_val
                ).astype(int)
        
        return df_eng
    
    def prepare_for_clustering(self, df: pd.DataFrame) -> np.ndarray:
        """
        Prepare features specifically for clustering
        
        Args:
            df: Input DataFrame
        
        Returns:
            Numpy array of features for clustering
        """
        # Use spending ratios for clustering (more meaningful than absolute values)
        ratio_cols = [col for col in df.columns if col.endswith('_ratio')]
        
        if ratio_cols:
            return df[ratio_cols].values
        else:
            # Fallback to spending columns
            spending_cols = ['food', 'transportation', 'books_supplies', 
                           'entertainment', 'personal_care', 'technology',
                           'health_wellness', 'miscellaneous']
            available_cols = [col for col in spending_cols if col in df.columns]
            return df[available_cols].values
    
    def prepare_for_prediction(
        self, 
        df: pd.DataFrame,
        budget: Dict[str, float]
    ) -> pd.DataFrame:
        """
        Prepare features for overspending prediction
        
        Args:
            df: User spending DataFrame
            budget: Dict of category budgets
        
        Returns:
            DataFrame with prediction features
        """
        df_pred = df.copy()
        
        # Add budget comparison features
        for category, budget_amount in budget.items():
            if category in df_pred.columns:
                # Amount over budget
                df_pred[f'{category}_over_budget'] = np.maximum(
                    0, 
                    df_pred[category] - budget_amount
                )
                
                # Percentage of budget used
                df_pred[f'{category}_budget_pct'] = (
                    df_pred[category] / (budget_amount + 1)
                ) * 100
        
        return df_pred
    
    def save(self, path: str = "saved_models/preprocessor.joblib"):
        """
        Save preprocessor to disk
        
        Args:
            path: Path to save file
        """
        os.makedirs(os.path.dirname(path), exist_ok=True)
        joblib.dump({
            'scaler': self.scaler,
            'feature_columns': self.feature_columns,
            'is_fitted': self.is_fitted
        }, path)
        print(f"✅ Preprocessor saved to {path}")
    
    @classmethod
    def load(cls, path: str = "saved_models/preprocessor.joblib") -> 'SpendingPreprocessor':
        """
        Load preprocessor from disk
        
        Args:
            path: Path to saved file
        
        Returns:
            Loaded preprocessor instance
        """
        if not os.path.exists(path):
            raise FileNotFoundError(f"Preprocessor not found at {path}")
        
        data = joblib.load(path)
        preprocessor = cls()
        preprocessor.scaler = data['scaler']
        preprocessor.feature_columns = data['feature_columns']
        preprocessor.is_fitted = data['is_fitted']
        
        print(f"✅ Preprocessor loaded from {path}")
        return preprocessor


# Singleton instance
_preprocessor = None

def get_preprocessor() -> SpendingPreprocessor:
    """Get or create preprocessor singleton instance"""
    global _preprocessor
    if _preprocessor is None:
        _preprocessor = SpendingPreprocessor()
    return _preprocessor
