-- Seed data for testing (DO NOT USE IN PRODUCTION)
-- This file contains sample data for development and testing

-- Note: You'll need to create a test user in Supabase Auth first
-- Then replace 'YOUR_TEST_USER_ID' with the actual UUID

-- Sample test user ID (replace with actual ID from Supabase Auth)
-- To get this: Sign up a test user via Supabase Dashboard > Authentication
DO $$
DECLARE
  test_user_id UUID := 'YOUR_TEST_USER_ID'; -- REPLACE THIS
BEGIN
  -- Only insert if test user exists
  IF EXISTS (SELECT 1 FROM auth.users WHERE id = test_user_id) THEN
    
    -- Insert sample transactions for the last 3 months
    INSERT INTO public.transactions (user_id, amount, description, category, payment_method, merchant, date) VALUES
      -- January 2024
      (test_user_id, 5500, '스타벅스 아메리카노', 'food', 'card', '스타벅스', '2024-01-15'),
      (test_user_id, 9000, '점심 식사', 'food', 'card', '한식당', '2024-01-15'),
      (test_user_id, 1350, '지하철', 'transport', 'card', '서울교통공사', '2024-01-15'),
      (test_user_id, 15000, '영화 관람', 'entertainment', 'card', 'CGV', '2024-01-14'),
      (test_user_id, 12000, '택시', 'transport', 'card', '카카오T', '2024-01-14'),
      (test_user_id, 45000, '온라인 쇼핑', 'shopping', 'card', '쿠팡', '2024-01-13'),
      (test_user_id, 8500, '편의점', 'food', 'cash', 'GS25', '2024-01-13'),
      (test_user_id, 18000, '저녁 식사', 'food', 'card', '일식당', '2024-01-12'),
      (test_user_id, 6500, '카페', 'food', 'card', '카페', '2024-01-11'),
      (test_user_id, 25000, '배달 음식', 'food', 'card', '배달의민족', '2024-01-10'),
      (test_user_id, 3500, '버스', 'transport', 'card', '서울버스', '2024-01-10'),
      (test_user_id, 35000, '옷 구매', 'shopping', 'card', 'ZARA', '2024-01-09'),
      (test_user_id, 11000, '점심', 'food', 'card', '중식당', '2024-01-08'),
      (test_user_id, 5000, '스낵', 'food', 'cash', '편의점', '2024-01-08'),
      
      -- February 2024
      (test_user_id, 6000, '아침 식사', 'food', 'card', '카페', '2024-02-01'),
      (test_user_id, 12000, '점심 식사', 'food', 'card', '한식당', '2024-02-01'),
      (test_user_id, 1350, '지하철', 'transport', 'card', '서울교통공사', '2024-02-01'),
      (test_user_id, 30000, '배달 음식', 'food', 'card', '배달의민족', '2024-02-02'),
      (test_user_id, 15000, '영화', 'entertainment', 'card', 'CGV', '2024-02-03'),
      (test_user_id, 50000, '쇼핑', 'shopping', 'card', '무신사', '2024-02-04'),
      (test_user_id, 8000, '간식', 'food', 'cash', '편의점', '2024-02-05'),
      (test_user_id, 20000, '저녁 식사', 'food', 'card', '고기집', '2024-02-05'),
      (test_user_id, 4500, '커피', 'food', 'card', '스타벅스', '2024-02-06'),
      (test_user_id, 13000, '택시', 'transport', 'card', '카카오T', '2024-02-07'),
      (test_user_id, 40000, '교재 구매', 'education', 'card', '교보문고', '2024-02-08'),
      (test_user_id, 25000, '배달 음식', 'food', 'card', '요기요', '2024-02-09'),
      (test_user_id, 7000, '점심', 'food', 'card', '분식집', '2024-02-10'),
      (test_user_id, 60000, '의류', 'shopping', 'card', 'H&M', '2024-02-11'),
      (test_user_id, 10000, '저녁', 'food', 'card', '치킨', '2024-02-12'),
      
      -- March 2024  
      (test_user_id, 5500, '커피', 'food', 'card', '스타벅스', '2024-03-01'),
      (test_user_id, 11000, '점심', 'food', 'card', '일식당', '2024-03-01'),
      (test_user_id, 1350, '지하철', 'transport', 'card', '서울교통공사', '2024-03-01'),
      (test_user_id, 28000, '배달', 'food', 'card', '배달의민족', '2024-03-02'),
      (test_user_id, 18000, '저녁', 'food', 'card', '한식당', '2024-03-02'),
      (test_user_id, 6500, '간식', 'food', 'cash', 'CU', '2024-03-03'),
      (test_user_id, 15000, '영화', 'entertainment', 'card', 'CGV', '2024-03-04'),
      (test_user_id, 45000, '쇼핑', 'shopping', 'card', '쿠팡', '2024-03-05'),
      (test_user_id, 9000, '점심', 'food', 'card', '중식당', '2024-03-06'),
      (test_user_id, 12000, '택시', 'transport', 'card', '카카오T', '2024-03-06'),
      (test_user_id, 30000, '배달', 'food', 'card', '요기요', '2024-03-07'),
      (test_user_id, 20000, '약 구매', 'health', 'card', '약국', '2024-03-08'),
      (test_user_id, 7500, '아침', 'food', 'card', '카페', '2024-03-09'),
      (test_user_id, 55000, '옷', 'shopping', 'card', 'ZARA', '2024-03-10');

    -- Insert sample budgets for current month
    INSERT INTO public.budgets (user_id, category, amount, month) VALUES
      (test_user_id, 'food', 300000, TO_CHAR(CURRENT_DATE, 'YYYY-MM')),
      (test_user_id, 'transport', 100000, TO_CHAR(CURRENT_DATE, 'YYYY-MM')),
      (test_user_id, 'shopping', 150000, TO_CHAR(CURRENT_DATE, 'YYYY-MM')),
      (test_user_id, 'entertainment', 100000, TO_CHAR(CURRENT_DATE, 'YYYY-MM')),
      (test_user_id, 'education', 50000, TO_CHAR(CURRENT_DATE, 'YYYY-MM')),
      (test_user_id, 'health', 30000, TO_CHAR(CURRENT_DATE, 'YYYY-MM')),
      (test_user_id, 'other', 20000, TO_CHAR(CURRENT_DATE, 'YYYY-MM'));

    -- Insert sample AI insights
    INSERT INTO public.ai_insights (user_id, type, severity, title, description, suggested_action, potential_savings, category) VALUES
      (test_user_id, 'overspending', 'warning', '식비 지출이 증가하고 있어요', 
       '지난달 대비 식비가 15% 증가했습니다. 배달 음식과 카페 이용이 주요 원인입니다.',
       '주 2회 배달 음식을 줄이면 월 5만원을 절약할 수 있어요', 50000, 'food'),
      
      (test_user_id, 'savings_opportunity', 'info', '교통비 절약 기회',
       '최근 택시 이용이 많았습니다. 대중교통을 이용하면 교통비를 절감할 수 있습니다.',
       '주 3회 대중교통 이용으로 월 3만원 절약 가능', 30000, 'transport'),
      
      (test_user_id, 'trend_decrease', 'info', '쇼핑 지출이 감소했어요! 👏',
       '지난달 대비 쇼핑 지출이 20% 감소했습니다. 잘하고 계세요!',
       NULL, NULL, 'shopping'),
      
      (test_user_id, 'category_warning', 'warning', '문화/여가 예산 초과 위험',
       '이번 달 문화/여가 지출이 예산의 85%에 도달했습니다. 남은 기간 동안 주의가 필요합니다.',
       '이번 주말은 무료 문화 시설을 이용해보는 건 어떨까요?', NULL, 'entertainment'),
      
      (test_user_id, 'spending_persona', 'info', '당신의 소비 패턴: 균형잡힌 소비자 🎯',
       '다양한 카테고리에 고르게 지출하고 있으며, 충동 구매가 적은 편입니다. 전체 사용자 중 상위 30%의 건강한 소비 패턴을 보이고 있어요!',
       NULL, NULL, NULL);

    -- Insert sample challenge
    INSERT INTO public.challenges (user_id, title, description, category, target_amount, current_amount, start_date, end_date, status) VALUES
      (test_user_id, '배달 음식 줄이기 챌린지', '이번 달 배달 음식을 10만원 이하로 줄여보세요!', 
       'food', 100000, 55000, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 'active');

    RAISE NOTICE 'Sample data inserted successfully for user: %', test_user_id;
  ELSE
    RAISE NOTICE 'Test user not found. Please create a user first and update the test_user_id.';
  END IF;
END $$;

