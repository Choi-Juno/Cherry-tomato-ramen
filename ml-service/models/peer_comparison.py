"""
Peer Comparison Message Generator

Compares user spending with age-based cohort averages.
"""

from dataclasses import dataclass, asdict
from typing import Optional, Dict
from datetime import datetime
import pandas as pd
import uuid


@dataclass
class PeerComparisonMessage:
    id: str
    age_group: str
    user_spending: float
    cohort_average: float
    difference_amount: float
    difference_percent: float
    comparison_type: str  # 'above', 'below', 'similar'
    top_excess_category: Optional[str]
    message: str
    cohort_size: int
    period: str
    generated_at: str

    def to_dict(self) -> Dict:
        return asdict(self)


# Minimum cohort size for privacy
MIN_COHORT_SIZE = 10

# Similarity threshold (within 5% is considered similar)
SIMILARITY_THRESHOLD = 5

# Category labels for Korean UI
CATEGORY_LABELS = {
    "food": "식비",
    "delivery": "배달",
    "cafe": "카페",
    "transport": "교통비",
    "shopping": "쇼핑",
    "entertainment": "문화/여가",
    "education": "교육",
    "health": "의료/건강",
    "utilities": "공과금",
    "other": "기타",
}


def get_age_group(birth_year: int) -> str:
    """Determine age group from birth year."""
    current_year = datetime.now().year
    age = current_year - birth_year
    
    if age < 20:
        return "10s"
    elif age < 30:
        return "20s"
    elif age < 40:
        return "30s"
    elif age < 50:
        return "40s"
    else:
        return "50s+"


def format_currency(amount: float) -> str:
    """Format amount as Korean currency string."""
    return f"{int(amount):,}원"


def get_mock_cohort_stats() -> Dict[str, Dict]:
    """
    Get mock cohort statistics for demonstration.
    In production, this would query the database.
    """
    return {
        "20s": {
            "avg_spending": 850000,
            "median_spending": 780000,
            "user_count": 150,
            "category_averages": {
                "food": 250000,
                "delivery": 120000,
                "cafe": 80000,
                "transport": 100000,
                "shopping": 150000,
                "entertainment": 100000,
                "other": 50000
            }
        },
        "30s": {
            "avg_spending": 1200000,
            "median_spending": 1100000,
            "user_count": 120,
            "category_averages": {
                "food": 300000,
                "delivery": 100000,
                "cafe": 60000,
                "transport": 150000,
                "shopping": 200000,
                "entertainment": 150000,
                "utilities": 100000,
                "other": 140000
            }
        },
        "10s": {
            "avg_spending": 350000,
            "median_spending": 300000,
            "user_count": 80,
            "category_averages": {
                "food": 100000,
                "cafe": 50000,
                "entertainment": 80000,
                "shopping": 70000,
                "other": 50000
            }
        },
        "40s": {
            "avg_spending": 1500000,
            "median_spending": 1400000,
            "user_count": 60,
            "category_averages": {
                "food": 350000,
                "transport": 200000,
                "shopping": 250000,
                "utilities": 200000,
                "education": 300000,
                "other": 200000
            }
        }
    }


def generate_peer_comparison_message(
    user_id: str,
    user_birth_year: int,
    user_transactions: pd.DataFrame,
    cohort_stats: Optional[Dict[str, Dict]] = None,
    period: Optional[str] = None
) -> PeerComparisonMessage:
    """
    Generate a peer comparison message for a user.
    
    Args:
        user_id: User identifier
        user_birth_year: User's birth year
        user_transactions: User's transactions for the period
        cohort_stats: Pre-computed cohort statistics (uses mock if None)
        period: Target period in 'YYYY-MM' format
    
    Returns:
        PeerComparisonMessage with comparison data
    """
    if period is None:
        period = datetime.now().strftime("%Y-%m")
    
    if cohort_stats is None:
        cohort_stats = get_mock_cohort_stats()
    
    age_group = get_age_group(user_birth_year)
    
    # Calculate user spending
    if user_transactions.empty:
        user_spending = 0
    else:
        user_spending = float(user_transactions['amount'].sum())
    
    # Check if cohort data is available
    if age_group not in cohort_stats:
        return _create_no_data_message(user_id, age_group, user_spending, period)
    
    cohort = cohort_stats[age_group]
    
    # Check minimum cohort size for privacy
    if cohort["user_count"] < MIN_COHORT_SIZE:
        return _create_no_data_message(user_id, age_group, user_spending, period)
    
    cohort_average = cohort["avg_spending"]
    difference_amount = user_spending - cohort_average
    
    if cohort_average > 0:
        difference_percent = (difference_amount / cohort_average) * 100
    else:
        difference_percent = 0
    
    # Determine comparison type
    if abs(difference_percent) <= SIMILARITY_THRESHOLD:
        comparison_type = "similar"
    elif difference_percent > 0:
        comparison_type = "above"
    else:
        comparison_type = "below"
    
    # Find top excess category if spending is above average
    top_excess_category = None
    if comparison_type == "above" and "category_averages" in cohort and not user_transactions.empty:
        user_by_category = user_transactions.groupby('category')['amount'].sum()
        max_excess = 0
        for category in user_by_category.index:
            user_amt = user_by_category[category]
            cohort_cat_avg = cohort["category_averages"].get(category, 0)
            excess = user_amt - cohort_cat_avg
            if excess > max_excess:
                max_excess = excess
                top_excess_category = category
    
    # Generate message
    message = _generate_comparison_message(
        age_group=age_group,
        user_spending=user_spending,
        cohort_average=cohort_average,
        comparison_type=comparison_type,
        top_excess_category=top_excess_category
    )
    
    return PeerComparisonMessage(
        id=str(uuid.uuid4()),
        age_group=age_group,
        user_spending=user_spending,
        cohort_average=cohort_average,
        difference_amount=difference_amount,
        difference_percent=difference_percent,
        comparison_type=comparison_type,
        top_excess_category=top_excess_category,
        message=message,
        cohort_size=cohort["user_count"],
        period=period,
        generated_at=datetime.now().isoformat()
    )


def _generate_comparison_message(
    age_group: str,
    user_spending: float,
    cohort_average: float,
    comparison_type: str,
    top_excess_category: Optional[str]
) -> str:
    """Generate natural language comparison message."""
    # Convert age group to Korean label
    age_label = age_group.replace("s", "").replace("+", "") + "대"
    
    if comparison_type == "similar":
        return (
            f"{age_label} 사용자들의 평균 지출은 {format_currency(cohort_average)}이에요. "
            f"회원님도 비슷한 수준이네요! 잘 관리하고 계세요. 👍"
        )
    elif comparison_type == "below":
        diff = cohort_average - user_spending
        return (
            f"{age_label} 사용자들의 평균 지출은 {format_currency(cohort_average)}이에요. "
            f"회원님은 {format_currency(user_spending)}으로, "
            f"평균보다 {format_currency(diff)} 적게 지출하고 있어요. 훌륭해요! 🎉"
        )
    else:  # above
        diff = user_spending - cohort_average
        category_hint = ""
        if top_excess_category:
            cat_label = CATEGORY_LABELS.get(top_excess_category, top_excess_category)
            category_hint = f" 특히 {cat_label} 지출을 조금 줄여보는 건 어떨까요?"
        
        return (
            f"{age_label} 사용자들의 평균 지출은 {format_currency(cohort_average)}이에요. "
            f"회원님은 {format_currency(user_spending)}으로, "
            f"평균보다 {format_currency(diff)} 더 지출하고 있어요.{category_hint}"
        )


def _create_no_data_message(
    user_id: str,
    age_group: str,
    user_spending: float,
    period: str
) -> PeerComparisonMessage:
    """Create a message when cohort data is unavailable."""
    age_label = age_group.replace("s", "").replace("+", "") + "대"
    
    return PeerComparisonMessage(
        id=str(uuid.uuid4()),
        age_group=age_group,
        user_spending=user_spending,
        cohort_average=0,
        difference_amount=0,
        difference_percent=0,
        comparison_type="similar",
        top_excess_category=None,
        message=f"아직 {age_label} 사용자 데이터가 충분하지 않아요. 곧 비교 정보를 제공해 드릴게요!",
        cohort_size=0,
        period=period,
        generated_at=datetime.now().isoformat()
    )

