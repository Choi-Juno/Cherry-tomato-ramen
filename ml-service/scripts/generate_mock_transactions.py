"""
Generate Mock User Transactions

Generates 2 months of realistic transaction data based on cohort statistics.
"""

import json
import random
from datetime import datetime, timedelta
import os

# Path to cohort stats
STATS_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "cohort_stats.json")
OUTPUT_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "supabase", "seed_avg_user_transactions.sql")

# Merchant names by category
MERCHANTS = {
    "food": ["학생식당", "김밥천국", "맥도날드", "스타벅스", "이디야", "서브웨이", "CU", "GS25", "맘스터치", "교촌치킨", "엽기떡볶이"],
    "transport": ["지하철", "버스", "택시", "카카오T", "따릉이", "KTX"],
    "shopping": ["쿠팡", "무신사", "올리브영", "다이소", "네이버페이", "지그재그", "에이블리"],
    "entertainment": ["CGV", "롯데시네마", "넷플릭스", "유튜브", "멜론", "PC방", "코인노래방", "스팀"],
    "education": ["교보문고", "알라딘", "프린트카페", "인프런", "토익접수"],
    "health": ["약국", "올리브영", "병원", "헬스장"],
    "utilities": ["관리비", "월세", "전기요금", "가스요금", "수도요금", "SKT", "KT", "LG U+"],
    "other": ["이체", "기타", "다이소"]
}

# Transaction frequency per month (estimated based on average spending / avg transaction amount)
# This adds some realism to the transaction count
FREQ_CONFIG = {
    "food": {"min_price": 4500, "max_price": 25000, "weight": 0.4},
    "transport": {"min_price": 1250, "max_price": 15000, "weight": 0.3},
    "shopping": {"min_price": 5000, "max_price": 100000, "weight": 0.1},
    "entertainment": {"min_price": 5000, "max_price": 50000, "weight": 0.1},
    "education": {"min_price": 10000, "max_price": 50000, "weight": 0.05},
    "health": {"min_price": 3000, "max_price": 50000, "weight": 0.05},
    "utilities": {"min_price": 30000, "max_price": 150000, "weight": 0.01},  # fewer but larger
    "other": {"min_price": 1000, "max_price": 30000, "weight": 0.05}
}

def get_time_slot(hour):
    if 5 <= hour < 12:
        return "morning"
    elif 12 <= hour < 17:
        return "afternoon"
    elif 17 <= hour < 22:
        return "evening"
    else:
        return "late_night"

def generate_transactions(user_id="test-user-avg", months=2):
    # Load cohort stats
    if not os.path.exists(STATS_PATH):
        print("Cohort stats not found. Please run generate_cohort_stats.py first.")
        return

    with open(STATS_PATH, "r") as f:
        data = json.load(f)
        # Use 20s stats as base
        stats = data["cohort_stats"]["20s"]["category_averages"]

    transactions = []
    end_date = datetime(2025, 11, 30)
    start_date = datetime(2025, 10, 1)
    
    total_days = (end_date - start_date).days + 1
    
    print(f"Generating transactions for {user_id} from {start_date.date()} to {end_date.date()}")
    
    # Generate transactions for each category to match monthly average
    for category, monthly_avg in stats.items():
        if category not in FREQ_CONFIG:
            continue
            
        config = FREQ_CONFIG[category]
        target_total = monthly_avg * months
        current_total = 0
        
        # Utilities are usually fixed monthly payments
        if category == "utilities":
            for m in range(months):
                # Pay around 25th of each month
                pay_date = start_date + timedelta(days=25 + (m * 30))
                if pay_date > end_date:
                    pay_date = end_date
                
                amount = int(monthly_avg) # One big payment or split
                merchant = random.choice(MERCHANTS[category])
                
                transactions.append({
                    "date": pay_date.strftime("%Y-%m-%d"),
                    "amount": amount,
                    "category": category,
                    "merchant": merchant,
                    "payment_method": "transfer",  # Typically utilities are paid via transfer
                    "time_slot": "morning",
                    "description": f"{merchant} 결제"
                })
            continue

        # Generate random transactions until target amount is reached
        while current_total < target_total:
            # Random date
            days_offset = random.randint(0, total_days - 1)
            tx_date = start_date + timedelta(days=days_offset)
            
            # Random time based on category preference
            if category == "food":
                hour = random.choices([8, 12, 13, 18, 19, 20, 23], weights=[1, 4, 4, 3, 3, 2, 1])[0]
            elif category == "transport":
                hour = random.choices([8, 9, 18, 19, 14, 22], weights=[3, 3, 3, 3, 1, 1])[0]
            elif category == "entertainment":
                hour = random.randint(18, 23)
            else:
                hour = random.randint(9, 21)
                
            # Random amount
            amount = random.randint(config["min_price"], config["max_price"])
            # Round to nearest 100
            amount = round(amount / 100) * 100
            
            if current_total + amount > target_total * 1.1: # Allow 10% variance
                break
                
            current_total += amount
            
            merchant = random.choice(MERCHANTS.get(category, ["상점"]))
            payment_method = random.choices(["card", "transfer", "cash"], weights=[0.8, 0.1, 0.1])[0]
            
            transactions.append({
                "date": tx_date.strftime("%Y-%m-%d"),
                "amount": amount,
                "category": category,
                "merchant": merchant,
                "payment_method": payment_method,
                "time_slot": get_time_slot(hour),
                "description": f"{merchant} 결제"
            })
    
    # Sort by date
    transactions.sort(key=lambda x: x["date"])
    
    return transactions

def generate_sql(transactions, user_id):
    sql = [
        "-- ⚠️ [AI 코칭 데이터 시딩 가이드] --------------------------------------------",
        "-- 이 SQL은 'student_spending.csv' 데이터셋의 20대 평균 소비 패턴(월 약 230만원)을",
        "-- 기반으로 생성된 2개월치(10월, 11월) 가상 지출 내역입니다.",
        "--",
        "-- [사용 방법]",
        "-- 1. 이 파일의 내용을 복사하세요.",
        "-- 2. VS Code나 텍스트 에디터에서 '찾기 및 바꾸기'를 실행하세요.",
        f"--    - 찾을 내용: {user_id}",
        "--    - 바꿀 내용: (본인의 실제 Supabase User UUID)",
        "-- 3. '모두 바꾸기'를 한 후, Supabase SQL Editor에서 실행하세요.",
        "-- -----------------------------------------------------------------------------",
        "",
        f"DELETE FROM transactions WHERE user_id = '{user_id}';",
        ""
    ]
    
    for t in transactions:
        sql.append(
            f"INSERT INTO transactions (user_id, amount, category, payment_method, date, description, merchant, time_slot) "
            f"VALUES ('{user_id}', {t['amount']}, '{t['category']}', '{t['payment_method']}', '{t['date']}', '{t['description']}', '{t['merchant']}', '{t['time_slot']}');"
        )
        
    return "\n".join(sql)

def main():
    user_id = "00000000-0000-0000-0000-000000000000" # Test User ID
    transactions = generate_transactions(user_id)
    
    if not transactions:
        return
        
    print(f"Generated {len(transactions)} transactions.")
    
    total_amount = sum(t['amount'] for t in transactions)
    print(f"Total amount: {total_amount:,.0f} KRW")
    
    sql_content = generate_sql(transactions, user_id)
    
    with open(OUTPUT_PATH, "w") as f:
        f.write(sql_content)
        
    print(f"✅ SQL seed file generated at: {OUTPUT_PATH}")

if __name__ == "__main__":
    main()

