// AI Coaching Types

export interface SuggestedChallenge {
  type: "limit_count" | "limit_amount" | "skip_days";
  target: number;
  period: "day" | "week" | "month";
  category: string;
  description: string;
}

export interface CoachingMessage {
  id: string;
  title: string;
  body: string;
  category: string;
  pattern_type: "spending_increase" | "time_pattern" | "positive_reinforcement";
  suggested_challenge: SuggestedChallenge | null;
  severity: "info" | "warning" | "success";
  generated_at: string;
}

export interface PeerComparisonMessage {
  id: string;
  age_group: string;
  user_spending: number;
  cohort_average: number;
  difference_amount: number;
  difference_percent: number;
  comparison_type: "above" | "below" | "similar";
  top_excess_category: string | null;
  message: string;
  cohort_size: number;
  period: string;
  generated_at: string;
}

export interface CoachingLogEntry {
  id: string;
  user_id: string;
  message_type: "coaching" | "peer_comparison";
  message_data: CoachingMessage | PeerComparisonMessage;
  shown_at: string;
  challenge_accepted: boolean;
  challenge_completed: boolean;
}

export interface CoachingResponse {
  success: boolean;
  message: CoachingMessage;
}

export interface PeerComparisonResponse {
  success: boolean;
  comparison: PeerComparisonMessage;
}

