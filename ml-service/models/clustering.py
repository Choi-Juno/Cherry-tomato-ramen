"""
Spending Persona Clustering Model
Uses KMeans to identify spending patterns and personas
"""

import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
import joblib
import os


class SpendingClusterer:
    """
    Cluster users into spending personas based on their spending patterns
    
    Personas:
    - 0: Balanced Spender (균형잡힌 소비자)
    - 1: Food Focused (식비 중심)
    - 2: Shopping Enthusiast (쇼핑 애호가)
    - 3: Minimalist (미니멀리스트)
    """

    def __init__(self, n_clusters=4, model_path="trained_models/kmeans.joblib"):
        self.n_clusters = n_clusters
        self.model_path = model_path
        self.model = None
        self.scaler = StandardScaler()
        self._trained = False

        # Try to load existing model
        self._load_model()

    def train(self, X: np.ndarray):
        """
        Train KMeans clustering model
        
        Args:
            X: Feature matrix (n_samples, n_features)
               Expected features: category spending ratios + avg/std transaction
        """
        # Standardize features
        X_scaled = self.scaler.fit_transform(X)

        # Train KMeans
        self.model = KMeans(
            n_clusters=self.n_clusters, random_state=42, n_init=10, max_iter=300
        )
        self.model.fit(X_scaled)

        self._trained = True

        # Save model
        self.save_model()

        return self

    def predict(self, X: np.ndarray) -> np.ndarray:
        """
        Predict cluster for new data
        
        Returns:
            Array of cluster labels
        """
        if not self.is_trained():
            # If model not trained, return default cluster
            return np.zeros(len(X), dtype=int)

        X_scaled = self.scaler.transform(X)
        return self.model.predict(X_scaled)

    def get_persona_name(self, cluster_label: int) -> str:
        """Get human-readable persona name for cluster"""
        personas = {
            0: "균형잡힌 소비자 🎯",
            1: "식비 중심 🍽️",
            2: "쇼핑 애호가 🛍️",
            3: "절약형 소비자 💰",
        }
        return personas.get(cluster_label, "분석 중")

    def get_persona_description(self, cluster_label: int) -> str:
        """Get detailed description for persona"""
        descriptions = {
            0: "다양한 카테고리에 균형있게 지출하는 건강한 소비 패턴을 보이고 있습니다.",
            1: "식비 지출이 다른 카테고리보다 높습니다. 배달/외식 빈도를 줄이면 절약할 수 있어요.",
            2: "쇼핑 지출 비중이 높습니다. 충동 구매를 줄이고 필요한 것만 구매해보세요.",
            3: "전반적으로 소비를 잘 절제하고 있습니다. 계속 유지하세요!",
        }
        return descriptions.get(cluster_label, "")

    def save_model(self):
        """Save trained model to disk"""
        if not self.is_trained():
            return

        os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
        joblib.dump(
            {"model": self.model, "scaler": self.scaler, "n_clusters": self.n_clusters},
            self.model_path,
        )

    def _load_model(self):
        """Load trained model from disk"""
        if os.path.exists(self.model_path):
            try:
                data = joblib.load(self.model_path)
                self.model = data["model"]
                self.scaler = data["scaler"]
                self.n_clusters = data.get("n_clusters", 4)
                self._trained = True
            except Exception as e:
                print(f"Failed to load model: {e}")
                self._trained = False

    def is_trained(self) -> bool:
        """Check if model is trained"""
        return self._trained and self.model is not None

