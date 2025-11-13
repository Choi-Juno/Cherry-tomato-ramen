"""
Data Loader Module
Handles loading and initial processing of spending data
"""

import pandas as pd
import os
from typing import Dict, List
from datetime import datetime, timedelta
import random


class DataLoader:
    """Load and prepare spending data for ML models"""
    
    def __init__(self, data_path: str = "data/student_spending.csv"):
        """
        Initialize DataLoader
        
        Args:
            data_path: Path to the CSV data file
        """
        self.data_path = data_path
        self.df = None
        
    def load_dataset(self) -> pd.DataFrame:
        """
        Load the student spending dataset
        
        Returns:
            DataFrame with student spending data
        """
        if not os.path.exists(self.data_path):
            raise FileNotFoundError(f"Dataset not found at {self.data_path}")
        
        # Load CSV
        self.df = pd.read_csv(self.data_path)
        
        # Drop unnamed index column if exists
        if 'Unnamed: 0' in self.df.columns:
            self.df = self.df.drop('Unnamed: 0', axis=1)
        
        print(f"✅ Loaded {len(self.df)} student spending records")
        print(f"📊 Columns: {list(self.df.columns)}")
        
        return self.df
    
    def convert_user_transactions_to_features(
        self, 
        transactions: List[Dict]
    ) -> pd.DataFrame:
        """
        Convert user transaction history to feature format
        matching the training dataset
        
        Args:
            transactions: List of transaction dicts with
                         {date, amount, category, description, etc.}
        
        Returns:
            DataFrame with aggregated features similar to training data
        """
        if not transactions:
            # Return default/empty features
            return self._get_default_features()
        
        # Convert to DataFrame
        trans_df = pd.DataFrame(transactions)
        
        # Map our categories to dataset categories
        category_mapping = {
            'food': 'food',
            'transport': 'transportation',
            'shopping': 'miscellaneous',  # Could be books_supplies or misc
            'entertainment': 'entertainment',
            'education': 'books_supplies',
            'health': 'health_wellness',
            'utilities': 'miscellaneous',
            'other': 'miscellaneous'
        }
        
        # Calculate total spending by category
        features = {}
        
        # Initialize all categories with 0
        for col in ['food', 'transportation', 'books_supplies', 'entertainment',
                    'personal_care', 'technology', 'health_wellness', 'miscellaneous']:
            features[col] = 0
        
        # Aggregate spending by category
        for _, trans in trans_df.iterrows():
            category = trans.get('category', 'other')
            mapped_category = category_mapping.get(category, 'miscellaneous')
            features[mapped_category] = features.get(mapped_category, 0) + trans['amount']
        
        # Add synthetic/estimated fields
        # These would ideally come from user profile
        features['age'] = 22  # Default student age
        features['monthly_income'] = trans_df['amount'].sum()  # Total as proxy income
        features['financial_aid'] = 0  # Not available
        features['tuition'] = 0  # Not available
        features['housing'] = 0  # Not available
        
        # Create DataFrame
        feature_df = pd.DataFrame([features])
        
        return feature_df
    
    def _get_default_features(self) -> pd.DataFrame:
        """
        Get default features for users with no transaction history
        
        Returns:
            DataFrame with default/zero features
        """
        default = {
            'age': 22,
            'monthly_income': 0,
            'financial_aid': 0,
            'tuition': 0,
            'housing': 0,
            'food': 0,
            'transportation': 0,
            'books_supplies': 0,
            'entertainment': 0,
            'personal_care': 0,
            'technology': 0,
            'health_wellness': 0,
            'miscellaneous': 0
        }
        
        return pd.DataFrame([default])
    
    def get_category_totals(self, transactions: List[Dict]) -> Dict[str, float]:
        """
        Get total spending by category
        
        Args:
            transactions: List of transaction dicts
        
        Returns:
            Dict mapping category to total amount
        """
        category_totals = {}
        
        for trans in transactions:
            category = trans.get('category', 'other')
            amount = trans.get('amount', 0)
            category_totals[category] = category_totals.get(category, 0) + amount
        
        return category_totals
    
    def get_monthly_trend(self, transactions: List[Dict], months: int = 3) -> List[float]:
        """
        Get spending trend over the last N months
        
        Args:
            transactions: List of transaction dicts
            months: Number of months to analyze
        
        Returns:
            List of monthly total amounts
        """
        trans_df = pd.DataFrame(transactions)
        
        if trans_df.empty or 'date' not in trans_df.columns:
            return [0] * months
        
        # Convert date to datetime
        trans_df['date'] = pd.to_datetime(trans_df['date'])
        
        # Get current date and calculate month boundaries
        now = datetime.now()
        monthly_totals = []
        
        for i in range(months - 1, -1, -1):  # Go backwards from current month
            # Calculate start and end of month
            month_start = (now - timedelta(days=30 * i)).replace(day=1)
            if i == 0:
                month_end = now
            else:
                month_end = (now - timedelta(days=30 * (i - 1))).replace(day=1)
            
            # Filter transactions for this month
            month_trans = trans_df[
                (trans_df['date'] >= month_start) & 
                (trans_df['date'] < month_end)
            ]
            
            # Sum amounts
            total = month_trans['amount'].sum() if not month_trans.empty else 0
            monthly_totals.append(float(total))
        
        return monthly_totals


# Singleton instance
_data_loader = None

def get_data_loader() -> DataLoader:
    """Get or create DataLoader singleton instance"""
    global _data_loader
    if _data_loader is None:
        _data_loader = DataLoader()
    return _data_loader
