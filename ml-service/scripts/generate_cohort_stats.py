"""
Generate Cohort Statistics from Student Spending Dataset

This script analyzes the student_spending.csv dataset and generates
cohort statistics for the AI coaching peer comparison feature.
"""

import pandas as pd
import numpy as np
from datetime import datetime
import json
import os

# Path to the dataset
DATASET_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "student_spending.csv")


def load_and_analyze_dataset(filepath: str = None) -> dict:
    """
    Load the student spending dataset and compute cohort statistics.
    
    Returns:
        Dictionary containing cohort statistics by age group
    """
    if filepath is None:
        filepath = DATASET_PATH
    
    # Load dataset
    df = pd.read_csv(filepath)
    
    print(f"Loaded {len(df)} records from dataset")
    print(f"Age range: {df['age'].min()} - {df['age'].max()}")
    print(f"Columns: {list(df.columns)}")
    
    # Define spending categories mapping
    # Dataset columns to our app categories
    CATEGORY_MAPPING = {
        "food": "food",
        "transportation": "transport",
        "entertainment": "entertainment",
        "books_supplies": "education",
        "health_wellness": "health",
        "personal_care": "shopping",
        "technology": "shopping",
        "miscellaneous": "other",
        "housing": "utilities",
    }
    
    # Spending columns in the dataset
    SPENDING_COLUMNS = [
        "food", "transportation", "books_supplies", "entertainment",
        "personal_care", "technology", "health_wellness", "miscellaneous", "housing"
    ]
    
    # Calculate total monthly spending per student
    df["total_spending"] = df[SPENDING_COLUMNS].sum(axis=1)
    
    # Define age groups
    def get_age_group(age):
        if age < 20:
            return "10s"
        elif age < 30:
            return "20s"
        elif age < 40:
            return "30s"
        else:
            return "40s+"
    
    df["age_group"] = df["age"].apply(get_age_group)
    
    # Compute cohort statistics
    cohort_stats = {}
    
    for age_group in df["age_group"].unique():
        group_df = df[df["age_group"] == age_group]
        
        # Total spending stats
        total_stats = {
            "avg_spending": float(group_df["total_spending"].mean()),
            "median_spending": float(group_df["total_spending"].median()),
            "std_spending": float(group_df["total_spending"].std()),
            "min_spending": float(group_df["total_spending"].min()),
            "max_spending": float(group_df["total_spending"].max()),
            "user_count": len(group_df),
        }
        
        # Category averages (mapped to our app categories)
        category_averages = {}
        for dataset_col, app_category in CATEGORY_MAPPING.items():
            if dataset_col in group_df.columns:
                if app_category not in category_averages:
                    category_averages[app_category] = 0
                category_averages[app_category] += float(group_df[dataset_col].mean())
        
        # Round category averages
        category_averages = {k: round(v, 2) for k, v in category_averages.items()}
        
        # Additional insights
        income_stats = {
            "avg_income": float(group_df["monthly_income"].mean()),
            "avg_financial_aid": float(group_df["financial_aid"].mean()),
        }
        
        # Year in school distribution
        year_distribution = group_df["year_in_school"].value_counts().to_dict()
        
        # Major distribution
        major_distribution = group_df["major"].value_counts().to_dict()
        
        # Payment method distribution
        payment_distribution = group_df["preferred_payment_method"].value_counts().to_dict()
        
        cohort_stats[age_group] = {
            **total_stats,
            "category_averages": category_averages,
            "income_stats": income_stats,
            "year_distribution": year_distribution,
            "major_distribution": major_distribution,
            "payment_distribution": payment_distribution,
        }
    
    return cohort_stats


def generate_coaching_patterns(df: pd.DataFrame) -> list:
    """
    Analyze spending patterns to generate coaching insights.
    
    Returns:
        List of common spending patterns and coaching suggestions
    """
    SPENDING_COLUMNS = [
        "food", "transportation", "books_supplies", "entertainment",
        "personal_care", "technology", "health_wellness", "miscellaneous"
    ]
    
    patterns = []
    
    # 1. High entertainment spenders
    entertainment_threshold = df["entertainment"].quantile(0.75)
    high_entertainment = df[df["entertainment"] > entertainment_threshold]
    patterns.append({
        "pattern_name": "high_entertainment",
        "description": "Entertainment spending in top 25%",
        "affected_users_pct": len(high_entertainment) / len(df) * 100,
        "avg_entertainment_spending": float(high_entertainment["entertainment"].mean()),
        "coaching_message": {
            "title": "문화/여가 지출이 또래보다 높아요",
            "body": "또래 평균보다 문화/여가 지출이 많습니다. 무료 대안을 찾아보는 건 어떨까요?",
            "suggested_challenge": {
                "type": "limit_amount",
                "target": int(df["entertainment"].median()),
                "period": "month",
                "category": "entertainment"
            }
        }
    })
    
    # 2. High food spenders
    food_threshold = df["food"].quantile(0.75)
    high_food = df[df["food"] > food_threshold]
    patterns.append({
        "pattern_name": "high_food",
        "description": "Food spending in top 25%",
        "affected_users_pct": len(high_food) / len(df) * 100,
        "avg_food_spending": float(high_food["food"].mean()),
        "coaching_message": {
            "title": "식비 지출이 또래보다 높아요",
            "body": "또래 평균보다 식비 지출이 많습니다. 집밥이나 도시락을 활용해보세요!",
            "suggested_challenge": {
                "type": "limit_count",
                "target": 3,
                "period": "week",
                "category": "food"
            }
        }
    })
    
    # 3. Low savers (high total spending relative to income)
    df["spending_ratio"] = df[SPENDING_COLUMNS].sum(axis=1) / df["monthly_income"]
    high_ratio = df[df["spending_ratio"] > df["spending_ratio"].quantile(0.75)]
    patterns.append({
        "pattern_name": "low_saver",
        "description": "Spending more than 75% of income",
        "affected_users_pct": len(high_ratio) / len(df) * 100,
        "avg_spending_ratio": float(high_ratio["spending_ratio"].mean()),
        "coaching_message": {
            "title": "수입 대비 지출 비율이 높아요",
            "body": "수입의 대부분을 지출하고 있어요. 저축 목표를 세워보는 건 어떨까요?",
            "suggested_challenge": {
                "type": "limit_amount",
                "target": int(df["monthly_income"].median() * 0.7),
                "period": "month",
                "category": "total"
            }
        }
    })
    
    # 4. Technology heavy spenders
    tech_threshold = df["technology"].quantile(0.75)
    high_tech = df[df["technology"] > tech_threshold]
    patterns.append({
        "pattern_name": "high_technology",
        "description": "Technology spending in top 25%",
        "affected_users_pct": len(high_tech) / len(df) * 100,
        "avg_tech_spending": float(high_tech["technology"].mean()),
        "coaching_message": {
            "title": "기술/전자기기 지출이 높아요",
            "body": "기술 관련 지출이 많습니다. 정말 필요한 구매인지 다시 생각해보세요!",
            "suggested_challenge": {
                "type": "skip_days",
                "target": 7,
                "period": "month",
                "category": "shopping"
            }
        }
    })
    
    return patterns


def generate_sql_seed_data(cohort_stats: dict, period: str = None) -> str:
    """
    Generate SQL INSERT statements for cohort_stats table.
    
    Args:
        cohort_stats: Dictionary of cohort statistics
        period: Period string (YYYY-MM), defaults to current month
    
    Returns:
        SQL INSERT statements as string
    """
    if period is None:
        period = datetime.now().strftime("%Y-%m")
    
    sql_statements = []
    sql_statements.append("-- Cohort Statistics Seed Data")
    sql_statements.append(f"-- Generated from student_spending.csv on {datetime.now().isoformat()}")
    sql_statements.append("")
    sql_statements.append("-- Clear existing data for this period")
    sql_statements.append(f"DELETE FROM cohort_stats WHERE period = '{period}';")
    sql_statements.append("")
    sql_statements.append("-- Insert cohort statistics")
    
    for age_group, stats in cohort_stats.items():
        # Total spending entry
        sql_statements.append(f"""
INSERT INTO cohort_stats (age_group, period, category, avg_spending, user_count)
VALUES ('{age_group}', '{period}', NULL, {stats['avg_spending']:.2f}, {stats['user_count']});""")
        
        # Category-specific entries
        for category, avg in stats["category_averages"].items():
            sql_statements.append(f"""
INSERT INTO cohort_stats (age_group, period, category, avg_spending, user_count)
VALUES ('{age_group}', '{period}', '{category}', {avg:.2f}, {stats['user_count']});""")
    
    return "\n".join(sql_statements)


def print_cohort_summary(cohort_stats: dict):
    """Print a human-readable summary of cohort statistics."""
    print("\n" + "=" * 60)
    print("COHORT STATISTICS SUMMARY")
    print("=" * 60)
    
    for age_group, stats in sorted(cohort_stats.items()):
        print(f"\n📊 {age_group} Age Group ({stats['user_count']} users)")
        print("-" * 40)
        print(f"  Average Monthly Spending: ₩{stats['avg_spending']:,.0f}")
        print(f"  Median Monthly Spending:  ₩{stats['median_spending']:,.0f}")
        print(f"  Spending Range: ₩{stats['min_spending']:,.0f} - ₩{stats['max_spending']:,.0f}")
        print(f"  Average Income: ₩{stats['income_stats']['avg_income']:,.0f}")
        print(f"  Average Financial Aid: ₩{stats['income_stats']['avg_financial_aid']:,.0f}")
        
        print("\n  Category Breakdown:")
        for category, avg in sorted(stats["category_averages"].items(), key=lambda x: -x[1]):
            print(f"    - {category}: ₩{avg:,.0f}")


def main():
    """Main function to generate and save cohort statistics."""
    print("🚀 Generating Cohort Statistics from Student Spending Dataset")
    print("-" * 60)
    
    # Check if dataset exists, if not, copy from Downloads
    if not os.path.exists(DATASET_PATH):
        print(f"Dataset not found at {DATASET_PATH}")
        # Try alternative paths
        alt_paths = [
            "/Users/junochoi/Downloads/student_spending (1).csv",
            os.path.join(os.path.dirname(__file__), "..", "..", "student_spending (1).csv"),
        ]
        for alt_path in alt_paths:
            if os.path.exists(alt_path):
                print(f"Found dataset at {alt_path}")
                # Copy to expected location
                import shutil
                os.makedirs(os.path.dirname(DATASET_PATH), exist_ok=True)
                shutil.copy(alt_path, DATASET_PATH)
                print(f"Copied to {DATASET_PATH}")
                break
        else:
            print("Could not find dataset. Please place student_spending.csv in ml-service/data/")
            return
    
    # Load and analyze
    cohort_stats = load_and_analyze_dataset()
    
    # Print summary
    print_cohort_summary(cohort_stats)
    
    # Load full dataset for pattern analysis
    df = pd.read_csv(DATASET_PATH)
    patterns = generate_coaching_patterns(df)
    
    print("\n" + "=" * 60)
    print("COMMON SPENDING PATTERNS")
    print("=" * 60)
    for pattern in patterns:
        print(f"\n📌 {pattern['pattern_name']}")
        print(f"   {pattern['description']}")
        print(f"   Affects: {pattern['affected_users_pct']:.1f}% of users")
    
    # Generate SQL seed data
    sql_data = generate_sql_seed_data(cohort_stats)
    
    # Save SQL to file
    sql_path = os.path.join(os.path.dirname(__file__), "..", "..", "supabase", "seed_cohort_stats.sql")
    with open(sql_path, "w") as f:
        f.write(sql_data)
    print(f"\n✅ SQL seed data saved to: {sql_path}")
    
    # Save cohort stats as JSON for Python usage
    json_path = os.path.join(os.path.dirname(__file__), "..", "data", "cohort_stats.json")
    os.makedirs(os.path.dirname(json_path), exist_ok=True)
    with open(json_path, "w") as f:
        json.dump({
            "generated_at": datetime.now().isoformat(),
            "cohort_stats": cohort_stats,
            "patterns": patterns
        }, f, indent=2, ensure_ascii=False)
    print(f"✅ JSON cohort data saved to: {json_path}")
    
    # Save patterns as coaching templates
    patterns_path = os.path.join(os.path.dirname(__file__), "..", "data", "coaching_patterns.json")
    with open(patterns_path, "w") as f:
        json.dump(patterns, f, indent=2, ensure_ascii=False)
    print(f"✅ Coaching patterns saved to: {patterns_path}")
    
    print("\n🎉 Cohort statistics generation complete!")
    
    return cohort_stats, patterns


if __name__ == "__main__":
    main()

