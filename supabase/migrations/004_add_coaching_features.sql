-- Migration: 004_add_coaching_features.sql
-- Add coaching and peer comparison features

-- 1. Add birth_year to users table for age-based cohort analysis
ALTER TABLE users ADD COLUMN IF NOT EXISTS birth_year INTEGER;

-- 2. Add time_slot to transactions for time-of-day pattern analysis
-- Values: 'morning' (6-12), 'afternoon' (12-18), 'evening' (18-22), 'late_night' (22-6)
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS time_slot TEXT;

-- 3. Create coaching_logs table to track shown messages
CREATE TABLE IF NOT EXISTS coaching_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    message_type TEXT NOT NULL, -- 'coaching' or 'peer_comparison'
    message_data JSONB NOT NULL,
    shown_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    challenge_accepted BOOLEAN DEFAULT FALSE,
    challenge_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create cohort_stats table for caching aggregated data
CREATE TABLE IF NOT EXISTS cohort_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    age_group TEXT NOT NULL, -- '20s', '30s', etc.
    period TEXT NOT NULL, -- 'YYYY-MM'
    category TEXT, -- NULL for total, or specific category
    avg_spending NUMERIC NOT NULL,
    user_count INTEGER NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(age_group, period, category)
);

-- Index for efficient cohort queries
CREATE INDEX IF NOT EXISTS idx_cohort_stats_lookup 
ON cohort_stats(age_group, period, category);

-- Index for coaching logs
CREATE INDEX IF NOT EXISTS idx_coaching_logs_user 
ON coaching_logs(user_id, created_at DESC);

-- RLS Policies
ALTER TABLE coaching_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own coaching logs"
ON coaching_logs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own coaching logs"
ON coaching_logs FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own coaching logs"
ON coaching_logs FOR UPDATE
USING (auth.uid() = user_id);

-- Cohort stats are read-only for users (updated by backend)
ALTER TABLE cohort_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view cohort stats"
ON cohort_stats FOR SELECT
TO authenticated
USING (true);

