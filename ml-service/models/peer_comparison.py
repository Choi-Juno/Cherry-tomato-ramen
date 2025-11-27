"""
Peer Comparison Message Generator

Compares user spending with age-based cohort averages.
Uses real data from student_spending.csv dataset.
"""

from dataclasses import dataclass, asdict
from typing import Optional, Dict
from datetime import datetime
import pandas as pd
import uuid
import json
import os


@dataclass
class PeerComparisonMessage:
    id: str
    age_group: str
    user_spending: float
    cohort_average: float
    difference_amount: float
    difference_percent: float
    comparison_type: str  # 'above', 'below', 'similar'
    top_excess_category: str | None
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

# USD to KRW conversion rate (approximate)
USD_TO_KRW = 1300

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


def load_cohort_stats_from_file() -> Dict[str, Dict]:
    """
    Load cohort statistics from the generated JSON file.
    Falls back to default data if file not found.
    """
    json_path = os.path.join(
        os.path.dirname(__file__), "..", "data", "cohort_stats.json"
    )

    if os.path.exists(json_path):
        with open(json_path, "r") as f:
            data = json.load(f)
            raw_stats = data.get("cohort_stats", {})

            # Data is already in KRW, just restructure for our needs
            converted_stats = {}
            for age_group, stats in raw_stats.items():
                converted_stats[age_group] = {
                    "avg_spending": stats["avg_spending"],
                    "median_spending": stats["median_spending"],
                    "user_count": stats["user_count"],
                    "category_averages": stats.get("category_averages", {}),
                }
            return converted_stats

    # Fallback to default mock data
    return get_mock_cohort_stats()


def get_mock_cohort_stats() -> Dict[str, Dict]:
    """
    Get mock cohort statistics for demonstration.
    Based on student_spending.csv dataset analysis, converted to KRW.
    """
    return {
        "10s": {
            "avg_spending": 2326000,  # ~1789 USD * 1300
            "median_spending": 2307000,
            "user_count": 232,
            "category_averages": {
                "food": 319000,
                "transport": 164000,
                "entertainment": 106000,
                "education": 222000,
                "health": 150000,
                "shopping": 321000,
                "other": 139000,
                "utilities": 905000,
            },
        },
        "20s": {
            "avg_spending": 2336000,  # ~1797 USD * 1300
            "median_spending": 2329000,
            "user_count": 768,
            "category_averages": {
                "food": 331000,
                "transport": 161000,
                "entertainment": 112000,
                "education": 229000,
                "health": 148000,
                "shopping": 308000,
                "other": 142000,
                "utilities": 905000,
            },
        },
        "30s": {
            "avg_spending": 2800000,
            "median_spending": 2600000,
            "user_count": 120,
            "category_averages": {
                "food": 400000,
                "transport": 200000,
                "entertainment": 150000,
                "education": 180000,
                "health": 200000,
                "shopping": 350000,
                "other": 170000,
                "utilities": 1150000,
            },
        },
    }


# Load cohort stats at module level
_COHORT_STATS = None


def get_cohort_stats() -> Dict[str, Dict]:
    """Get cohort statistics, loading from file if not already loaded."""
    global _COHORT_STATS
    if _COHORT_STATS is None:
        _COHORT_STATS = load_cohort_stats_from_file()
    return _COHORT_STATS


def generate_peer_comparison_message(
    user_id: str,
    user_birth_year: int,
    user_transactions: pd.DataFrame,
    cohort_stats: Dict[str, Dict] | None = None,
    period: str | None = None,
) -> PeerComparisonMessage:
    """
    Generate a peer comparison message for a user.

    Args:
        user_id: User identifier
        user_birth_year: User's birth year
        user_transactions: User's transactions for the period
        cohort_stats: Pre-computed cohort statistics (uses real data if None)
        period: Target period in 'YYYY-MM' format

    Returns:
        PeerComparisonMessage with comparison data
    """
    if period is None:
        period = datetime.now().strftime("%Y-%m")

    if cohort_stats is None:
        cohort_stats = get_cohort_stats()

    age_group = get_age_group(user_birth_year)

    # Calculate user spending
    if user_transactions.empty:
        user_spending = 0
    else:
        user_spending = float(user_transactions["amount"].sum())

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
    if (
        comparison_type == "above"
        and "category_averages" in cohort
        and not user_transactions.empty
    ):
        user_by_category = user_transactions.groupby("category")["amount"].sum()
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
        top_excess_category=top_excess_category,
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
        generated_at=datetime.now().isoformat(),
    )


def _generate_comparison_message(
    age_group: str,
    user_spending: float,
    cohort_average: float,
    comparison_type: str,
    top_excess_category: str | None,
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
    user_id: str, age_group: str, user_spending: float, period: str
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
        generated_at=datetime.now().isoformat(),
    )
