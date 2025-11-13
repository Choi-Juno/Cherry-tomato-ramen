"""
Clustering Model
KMeans clustering to identify spending personas
"""

import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from typing import Dict, List, Tuple
import joblib
import os


class SpendingClusterModel:
    """KMeans clustering model for spending pattern analysis"""
    
    # Spending persona definitions
    PERSONAS = {
        0: {
            "name": "균형잡힌 소비자",
            "icon": "⚖️",
            "description": "다양한 카테고리에 고르게 지출하며, 계획적인 소비 패턴을 보입니다.",
            "strengths": ["균형잡힌 지출", "계획적 소비"],
            "tips": ["현재의 균형을 유지하세요", "저축 목표를 설정해보세요"]
        },
        1: {
            "name": "식생활 중심형",
            "icon": "🍽️",
            "description": "식비 지출이 높은 편입니다. 외식이나 배달을 자주 이용하는 경향이 있습니다.",
            "strengths": ["음식 문화 향유"],
            "tips": ["주 2회 직접 요리해보기", "배달 음식 줄이기", "식비 예산 설정"]
        },
        2: {
            "name": "절약형 소비자",
            "icon": "💰",
            "description": "전반적으로 소비가 적고 저축 성향이 강합니다.",
            "strengths": ["높은 저축률", "계획적 소비"],
            "tips": ["가끔은 자신을 위한 소비도 좋아요", "장기 투자 고려하기"]
        },
        3: {
            "name": "문화생활 애호가",
            "icon": "🎬",
            "description": "여가와 문화 활동에 적극적으로 투자합니다.",
            "strengths": ["삶의 질 추구", "경험 중시"],
            "tips": ["무료 문화 행사 활용하기", "구독 서비스 정리하기"]
        },
        4: {
            "name": "기술 투자형",
            "icon": "💻",
            "description": "기술 및 교육에 투자를 아끼지 않습니다.",
            "strengths": ["자기계발", "미래 투자"],
            "tips": ["무료 온라인 강의 활용", "중고 기기 고려하기"]
        }
    }
    
    def __init__(self, n_clusters: int = 5):
        """
        Initialize clustering model
        
        Args:
            n_clusters: Number of clusters (spending personas)
        """
        self.n_clusters = n_clusters
        self.model = KMeans(
            n_clusters=n_clusters,
            random_state=42,
            n_init=10
        )
        self.is_fitted = False
        self.cluster_centers = None
        
    def fit(self, X: np.ndarray) -> 'SpendingClusterModel':
        """
        Fit the clustering model
        
        Args:
            X: Feature matrix (samples × features)
        
        Returns:
            Self for chaining
        """
        self.model.fit(X)
        self.cluster_centers = self.model.cluster_centers_
        self.is_fitted = True
        
        print(f"✅ KMeans model fitted with {self.n_clusters} clusters")
        return self
    
    def predict(self, X: np.ndarray) -> np.ndarray:
        """
        Predict cluster labels
        
        Args:
            X: Feature matrix
        
        Returns:
            Array of cluster labels
        """
        if not self.is_fitted:
            raise ValueError("Model must be fitted before prediction")
        
        return self.model.predict(X)
    
    def get_persona(self, cluster_id: int) -> Dict:
        """
        Get persona information for a cluster
        
        Args:
            cluster_id: Cluster ID (0 to n_clusters-1)
        
        Returns:
            Dict with persona info
        """
        # Use modulo to handle cases where cluster_id >= len(PERSONAS)
        persona_id = cluster_id % len(self.PERSONAS)
        return self.PERSONAS[persona_id]
    
    def analyze_user_persona(
        self, 
        user_features: np.ndarray,
        feature_names: List[str] = None
    ) -> Dict:
        """
        Analyze user's spending persona
        
        Args:
            user_features: User's feature vector
            feature_names: Names of features
        
        Returns:
            Dict with persona analysis
        """
        if not self.is_fitted:
            raise ValueError("Model must be fitted before analysis")
        
        # Predict cluster
        cluster_id = self.predict(user_features.reshape(1, -1))[0]
        
        # Get persona info
        persona = self.get_persona(cluster_id)
        
        # Calculate distance to cluster center (how typical the user is)
        distance = np.linalg.norm(
            user_features - self.cluster_centers[cluster_id]
        )
        
        # Normalize distance to 0-100 scale (lower is more typical)
        max_distance = np.max([
            np.linalg.norm(center) 
            for center in self.cluster_centers
        ])
        typicality_score = max(0, 100 - (distance / max_distance) * 100)
        
        return {
            "cluster_id": int(cluster_id),
            "persona_name": persona["name"],
            "persona_icon": persona["icon"],
            "description": persona["description"],
            "strengths": persona["strengths"],
            "tips": persona["tips"],
            "typicality_score": float(typicality_score),
            "is_typical": typicality_score > 60
        }
    
    def get_cluster_statistics(self, X: np.ndarray) -> Dict:
        """
        Get statistics about all clusters
        
        Args:
            X: Feature matrix
        
        Returns:
            Dict with cluster statistics
        """
        if not self.is_fitted:
            raise ValueError("Model must be fitted before analysis")
        
        labels = self.predict(X)
        
        stats = {}
        for i in range(self.n_clusters):
            cluster_mask = labels == i
            cluster_size = np.sum(cluster_mask)
            cluster_pct = (cluster_size / len(labels)) * 100
            
            stats[i] = {
                "size": int(cluster_size),
                "percentage": float(cluster_pct),
                "persona": self.get_persona(i)["name"]
            }
        
        return stats
    
    def save(self, path: str = "saved_models/clustering_model.joblib"):
        """
        Save model to disk
        
        Args:
            path: Path to save file
        """
        os.makedirs(os.path.dirname(path), exist_ok=True)
        joblib.dump({
            'model': self.model,
            'n_clusters': self.n_clusters,
            'is_fitted': self.is_fitted,
            'cluster_centers': self.cluster_centers
        }, path)
        print(f"✅ Clustering model saved to {path}")
    
    @classmethod
    def load(cls, path: str = "saved_models/clustering_model.joblib") -> 'SpendingClusterModel':
        """
        Load model from disk
        
        Args:
            path: Path to saved file
        
        Returns:
            Loaded model instance
        """
        if not os.path.exists(path):
            raise FileNotFoundError(f"Model not found at {path}")
        
        data = joblib.load(path)
        model_instance = cls(n_clusters=data['n_clusters'])
        model_instance.model = data['model']
        model_instance.is_fitted = data['is_fitted']
        model_instance.cluster_centers = data['cluster_centers']
        
        print(f"✅ Clustering model loaded from {path}")
        return model_instance


# Singleton instance
_cluster_model = None

def get_cluster_model() -> SpendingClusterModel:
    """Get or create clustering model singleton instance"""
    global _cluster_model
    if _cluster_model is None:
        _cluster_model = SpendingClusterModel()
    return _cluster_model
