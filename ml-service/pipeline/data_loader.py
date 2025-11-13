"""
Data Loader for Transaction Data
Handles loading data from various sources (CSV, JSON, dict)
"""

import pandas as pd
from typing import List, Dict, Any
from datetime import datetime


class TransactionDataLoader:
    """Load and prepare transaction data for ML pipeline"""

    def __init__(self):
        self.required_columns = ["date", "amount", "category", "description"]

    def load_from_csv(self, filepath: str) -> pd.DataFrame:
        """
        Load transaction data from CSV file
        
        Expected format:
        date, amount, category, description, payment_method, merchant
        """
        df = pd.read_csv(filepath)
        return self._validate_columns(df)

    def load_from_dict(self, data: List[Dict[str, Any]]) -> pd.DataFrame:
        """Load transaction data from list of dictionaries"""
        df = pd.DataFrame(data)
        return self._validate_columns(df)

    def load_from_json(self, filepath: str) -> pd.DataFrame:
        """Load transaction data from JSON file"""
        df = pd.read_json(filepath)
        return self._validate_columns(df)

    def _validate_columns(self, df: pd.DataFrame) -> pd.DataFrame:
        """Validate that required columns exist"""
        missing_cols = set(self.required_columns) - set(df.columns)
        if missing_cols:
            raise ValueError(f"Missing required columns: {missing_cols}")
        return df

    def merge_user_data(
        self, transactions: pd.DataFrame, budgets: Dict[str, float]
    ) -> pd.DataFrame:
        """Merge transaction data with budget information"""
        transactions["budget"] = transactions["category"].map(budgets)
        return transactions

