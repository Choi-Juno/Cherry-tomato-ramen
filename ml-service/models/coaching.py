"""
AI Coaching Message Generator

Generates personalized coaching messages based on user spending patterns.
"""

from dataclasses import dataclass, asdict
from typing import Optional, Dict, List
from datetime import datetime
import pandas as pd
import uuid
from enum import Enum


class PatternType(str, Enum):
    SPENDING_INCREASE = "spending_increase"
    TIME_PATTERN = "time_pattern"
    POSITIVE_REINFORCEMENT = "positive_reinforcement"


class ChallengePeriod(str, Enum):
    DAY = "day"
    WEEK = "week"
    MONTH = "month"


@dataclass
class SuggestedChallenge:
    type: str  # 'limit_count', 'limit_amount', 'skip_days'
    target: int
    period: str
    category: str
    description: str


@dataclass
class CoachingMessage:
    id: str
    title: str
    body: str
    category: str
    pattern_type: str
    suggested_challenge: Optional[Dict]
    severity: str  # 'info', 'warning', 'success'
    generated_at: str

    def to_dict(self) -> Dict:
        return asdict(self)


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

TIME_SLOT_LABELS = {
    "morning": "아침",
    "afternoon": "오후",
    "evening": "저녁",
    "late_night": "심야",
}

# Thresholds
SIGNIFICANT_INCREASE_THRESHOLD = 15  # 15% increase triggers a warning
MIN_AMOUNT_THRESHOLD = 10000  # Minimum amount to consider


def get_time_slot(hour: int) -> str:
    """Determine time slot from hour of day."""
    if 6 <= hour < 12:
        return "morning"
    elif 12 <= hour < 18:
        return "afternoon"
    elif 18 <= hour < 22:
        return "evening"
    else:
        return "late_night"


def analyze_spending_patterns(
    transactions: pd.DataFrame,
    lookback_months: int = 2
) -> Dict:
    """
    Analyze spending patterns from transaction data.
    
    Args:
        transactions: DataFrame with columns [date, amount, category, time_slot]
        lookback_months: Number of months to analyze
    
    Returns:
        Dictionary containing pattern analysis results
    """
    if transactions.empty:
        return {"has_data": False}
    
    transactions = transactions.copy()
    transactions['date'] = pd.to_datetime(transactions['date'])
    transactions['month'] = transactions['date'].dt.to_period('M')
    
    # Get current and previous month
    current_month = pd.Period(datetime.now(), freq='M')
    prev_month = current_month - 1
    
    current_data = transactions[transactions['month'] == current_month]
    prev_data = transactions[transactions['month'] == prev_month]
    
    # Category spending analysis
    current_by_category = current_data.groupby('category')['amount'].sum()
    prev_by_category = prev_data.groupby('category')['amount'].sum()
    
    # Calculate month-over-month changes
    category_changes = {}
    for category in current_by_category.index:
        current_amt = current_by_category.get(category, 0)
        prev_amt = prev_by_category.get(category, 0) if category in prev_by_category.index else 0
        
        if prev_amt > 0:
            pct_change = ((current_amt - prev_amt) / prev_amt) * 100
        else:
            pct_change = 100 if current_amt > 0 else 0
        
        category_changes[category] = {
            "current": float(current_amt),
            "previous": float(prev_amt),
            "change_amount": float(current_amt - prev_amt),
            "change_percent": float(pct_change)
        }
    
    # Time slot analysis for current month
    time_slot_by_category = {}
    if 'time_slot' in current_data.columns:
        for category in current_by_category.index:
            cat_data = current_data[current_data['category'] == category]
            if not cat_data.empty and 'time_slot' in cat_data.columns:
                cat_data_with_slots = cat_data[cat_data['time_slot'].notna()]
                if not cat_data_with_slots.empty:
                    slot_totals = cat_data_with_slots.groupby('time_slot')['amount'].sum()
                    dominant_slot = slot_totals.idxmax() if not slot_totals.empty else None
                    time_slot_by_category[category] = {
                        "slots": slot_totals.to_dict(),
                        "dominant": dominant_slot
                    }
    
    return {
        "has_data": True,
        "current_month": str(current_month),
        "category_changes": category_changes,
        "time_patterns": time_slot_by_category,
        "total_current": float(current_data['amount'].sum()),
        "total_previous": float(prev_data['amount'].sum()),
    }


def generate_coaching_message(
    transactions: pd.DataFrame,
    user_id: str
) -> CoachingMessage:
    """
    Generate a personalized coaching message based on spending patterns.
    
    Args:
        transactions: User's transaction history
        user_id: User identifier for message ID generation
    
    Returns:
        CoachingMessage with personalized advice
    """
    patterns = analyze_spending_patterns(transactions)
    
    # Default positive message if no data
    if not patterns.get("has_data"):
        return CoachingMessage(
            id=str(uuid.uuid4()),
            title="소비 데이터를 수집 중이에요",
            body="거래 내역이 쌓이면 맞춤형 코칭을 제공해 드릴게요. 지출을 기록해 주세요!",
            category="general",
            pattern_type=PatternType.POSITIVE_REINFORCEMENT.value,
            suggested_challenge=None,
            severity="info",
            generated_at=datetime.now().isoformat()
        )
    
    # Find significant increases (>15%)
    significant_increases = []
    
    for category, data in patterns["category_changes"].items():
        if (data["change_percent"] > SIGNIFICANT_INCREASE_THRESHOLD and 
            data["current"] > MIN_AMOUNT_THRESHOLD):
            significant_increases.append({
                "category": category,
                **data,
                "time_pattern": patterns["time_patterns"].get(category)
            })
    
    # Sort by change amount (biggest impact first)
    significant_increases.sort(key=lambda x: x["change_amount"], reverse=True)
    
    # Generate message based on findings
    if significant_increases:
        top_increase = significant_increases[0]
        category = top_increase["category"]
        category_label = CATEGORY_LABELS.get(category, category)
        pct = round(top_increase["change_percent"])
        
        # Build title
        title = f"{category_label} 지출이 지난달보다 {pct}% 증가했어요"
        
        # Build body with time pattern if available
        time_pattern = top_increase.get("time_pattern")
        if time_pattern and time_pattern.get("dominant"):
            dominant_slot = time_pattern["dominant"]
            slot_label = TIME_SLOT_LABELS.get(dominant_slot, dominant_slot)
            body = f"패턴을 분석해보니, {slot_label} 시간대 {category_label} 지출이 많아요. "
        else:
            body = f"지난달 대비 {category_label}에 더 많이 지출하고 계세요. "
        
        # Add challenge suggestion
        challenge = _generate_challenge(category, top_increase)
        if challenge:
            body += challenge.description
        
        return CoachingMessage(
            id=str(uuid.uuid4()),
            title=title,
            body=body,
            category=category,
            pattern_type=PatternType.SPENDING_INCREASE.value,
            suggested_challenge=asdict(challenge) if challenge else None,
            severity="warning",
            generated_at=datetime.now().isoformat()
        )
    
    # No significant increases - positive reinforcement
    total_change = patterns["total_current"] - patterns["total_previous"]
    if patterns["total_previous"] > 0:
        total_pct = (total_change / patterns["total_previous"]) * 100
    else:
        total_pct = 0
    
    if total_pct <= 0:
        title = "잘하고 있어요! 👏"
        body = "이번 달 지출이 안정적이에요. 현재 소비 습관을 유지해 보세요."
        severity = "success"
    else:
        title = "전체적으로 지출이 조금 늘었어요"
        body = f"지난달 대비 {round(total_pct)}% 증가했지만, 큰 문제는 아니에요. 조금만 신경 써보세요."
        severity = "info"
    
    return CoachingMessage(
        id=str(uuid.uuid4()),
        title=title,
        body=body,
        category="general",
        pattern_type=PatternType.POSITIVE_REINFORCEMENT.value,
        suggested_challenge=None,
        severity=severity,
        generated_at=datetime.now().isoformat()
    )


def _generate_challenge(category: str, pattern_data: Dict) -> Optional[SuggestedChallenge]:
    """Generate a specific challenge based on category and pattern."""
    category_label = CATEGORY_LABELS.get(category, category)
    
    # Category-specific challenge templates
    challenges = {
        "delivery": SuggestedChallenge(
            type="limit_count",
            target=2,
            period=ChallengePeriod.WEEK.value,
            category=category,
            description="이번 주 챌린지: 배달 주문을 2회 이하로 줄여보세요!"
        ),
        "cafe": SuggestedChallenge(
            type="skip_days",
            target=1,
            period=ChallengePeriod.WEEK.value,
            category=category,
            description="이번 주 챌린지: 일주일에 카페 방문 1회 줄여보는 건 어떨까요?"
        ),
        "food": SuggestedChallenge(
            type="limit_amount",
            target=50000,
            period=ChallengePeriod.WEEK.value,
            category=category,
            description="이번 주 챌린지: 외식비를 5만원 이하로 제한해 보세요!"
        ),
        "shopping": SuggestedChallenge(
            type="limit_amount",
            target=50000,
            period=ChallengePeriod.WEEK.value,
            category=category,
            description="이번 주 챌린지: 쇼핑 지출을 5만원 이하로 제한해 보세요!"
        ),
        "entertainment": SuggestedChallenge(
            type="limit_count",
            target=1,
            period=ChallengePeriod.WEEK.value,
            category=category,
            description="이번 주 챌린지: 유료 콘텐츠/구독을 1회로 제한해 보세요!"
        ),
    }
    
    if category in challenges:
        return challenges[category]
    
    # Generic challenge for other categories
    target_amount = int(pattern_data["current"] * 0.8)  # 20% reduction target
    return SuggestedChallenge(
        type="limit_amount",
        target=target_amount,
        period=ChallengePeriod.WEEK.value,
        category=category,
        description=f"이번 주 챌린지: {category_label} 지출을 20% 줄여보세요!"
    )

