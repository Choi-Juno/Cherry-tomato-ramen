-- Cohort Statistics Seed Data
-- Generated from student_spending.csv (1000 university students)
-- Amounts converted from USD to KRW (rate: 1300)

-- Clear existing data for this period
DELETE FROM cohort_stats WHERE period = '2025-11';

-- =====================================================
-- 10대 (18-19세) - 232명의 학생 데이터 기반
-- =====================================================

-- 총 지출 평균 (1789 USD * 1300 = 2,326,000 KRW)
INSERT INTO cohort_stats (age_group, period, category, avg_spending, user_count)
VALUES ('10s', '2025-11', NULL, 2326000, 232);

-- 식비 (food) - 245.66 USD * 1300
INSERT INTO cohort_stats (age_group, period, category, avg_spending, user_count)
VALUES ('10s', '2025-11', 'food', 319358, 232);

-- 교통비 (transport) - 126.20 USD * 1300
INSERT INTO cohort_stats (age_group, period, category, avg_spending, user_count)
VALUES ('10s', '2025-11', 'transport', 164060, 232);

-- 문화/여가 (entertainment) - 81.32 USD * 1300
INSERT INTO cohort_stats (age_group, period, category, avg_spending, user_count)
VALUES ('10s', '2025-11', 'entertainment', 105716, 232);

-- 교육 (education) - 170.94 USD * 1300
INSERT INTO cohort_stats (age_group, period, category, avg_spending, user_count)
VALUES ('10s', '2025-11', 'education', 222222, 232);

-- 의료/건강 (health) - 115.22 USD * 1300
INSERT INTO cohort_stats (age_group, period, category, avg_spending, user_count)
VALUES ('10s', '2025-11', 'health', 149786, 232);

-- 쇼핑 (shopping) - 246.95 USD * 1300
INSERT INTO cohort_stats (age_group, period, category, avg_spending, user_count)
VALUES ('10s', '2025-11', 'shopping', 321035, 232);

-- 기타 (other) - 107.11 USD * 1300
INSERT INTO cohort_stats (age_group, period, category, avg_spending, user_count)
VALUES ('10s', '2025-11', 'other', 139243, 232);

-- 공과금/주거 (utilities) - 695.85 USD * 1300
INSERT INTO cohort_stats (age_group, period, category, avg_spending, user_count)
VALUES ('10s', '2025-11', 'utilities', 904605, 232);

-- =====================================================
-- 20대 (20-29세) - 768명의 학생 데이터 기반
-- =====================================================

-- 총 지출 평균 (1796.85 USD * 1300 = 2,335,905 KRW)
INSERT INTO cohort_stats (age_group, period, category, avg_spending, user_count)
VALUES ('20s', '2025-11', NULL, 2335905, 768);

-- 식비 (food) - 254.75 USD * 1300
INSERT INTO cohort_stats (age_group, period, category, avg_spending, user_count)
VALUES ('20s', '2025-11', 'food', 331175, 768);

-- 교통비 (transport) - 124.17 USD * 1300
INSERT INTO cohort_stats (age_group, period, category, avg_spending, user_count)
VALUES ('20s', '2025-11', 'transport', 161421, 768);

-- 문화/여가 (entertainment) - 85.87 USD * 1300
INSERT INTO cohort_stats (age_group, period, category, avg_spending, user_count)
VALUES ('20s', '2025-11', 'entertainment', 111631, 768);

-- 교육 (education) - 175.91 USD * 1300
INSERT INTO cohort_stats (age_group, period, category, avg_spending, user_count)
VALUES ('20s', '2025-11', 'education', 228683, 768);

-- 의료/건강 (health) - 114.04 USD * 1300
INSERT INTO cohort_stats (age_group, period, category, avg_spending, user_count)
VALUES ('20s', '2025-11', 'health', 148252, 768);

-- 쇼핑 (shopping) - 236.60 USD * 1300
INSERT INTO cohort_stats (age_group, period, category, avg_spending, user_count)
VALUES ('20s', '2025-11', 'shopping', 307580, 768);

-- 기타 (other) - 109.45 USD * 1300
INSERT INTO cohort_stats (age_group, period, category, avg_spending, user_count)
VALUES ('20s', '2025-11', 'other', 142285, 768);

-- 공과금/주거 (utilities) - 696.05 USD * 1300
INSERT INTO cohort_stats (age_group, period, category, avg_spending, user_count)
VALUES ('20s', '2025-11', 'utilities', 904865, 768);

-- =====================================================
-- 30대 (추정 데이터 - 직장인 평균 기반)
-- =====================================================

INSERT INTO cohort_stats (age_group, period, category, avg_spending, user_count)
VALUES ('30s', '2025-11', NULL, 2800000, 120);

INSERT INTO cohort_stats (age_group, period, category, avg_spending, user_count)
VALUES ('30s', '2025-11', 'food', 400000, 120);

INSERT INTO cohort_stats (age_group, period, category, avg_spending, user_count)
VALUES ('30s', '2025-11', 'transport', 200000, 120);

INSERT INTO cohort_stats (age_group, period, category, avg_spending, user_count)
VALUES ('30s', '2025-11', 'entertainment', 150000, 120);

INSERT INTO cohort_stats (age_group, period, category, avg_spending, user_count)
VALUES ('30s', '2025-11', 'education', 180000, 120);

INSERT INTO cohort_stats (age_group, period, category, avg_spending, user_count)
VALUES ('30s', '2025-11', 'health', 200000, 120);

INSERT INTO cohort_stats (age_group, period, category, avg_spending, user_count)
VALUES ('30s', '2025-11', 'shopping', 350000, 120);

INSERT INTO cohort_stats (age_group, period, category, avg_spending, user_count)
VALUES ('30s', '2025-11', 'other', 170000, 120);

INSERT INTO cohort_stats (age_group, period, category, avg_spending, user_count)
VALUES ('30s', '2025-11', 'utilities', 1150000, 120);
