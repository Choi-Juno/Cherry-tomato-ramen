export type InsightType = 
  | "overspending"
  | "trend_increase"
  | "trend_decrease"
  | "savings_opportunity"
  | "category_warning"
  | "spending_persona";

export type InsightSeverity = "info" | "warning" | "critical";

export interface AIInsight {
  id: string;
  user_id: string;
  type: InsightType;
  severity: InsightSeverity;
  title: string;
  description: string;
  suggested_action?: string;
  potential_savings?: number;
  category?: string;
  metadata?: Record<string, any>;
  created_at: string;
  expires_at?: string;
}

export interface MLInsightRequest {
  user_id: string;
  transactions: Array<{
    date: string;
    amount: number;
    category: string;
    description: string;
  }>;
  current_month_budget?: Record<string, number>;
}

export interface MLInsightResponse {
  insights: Array<{
    type: InsightType;
    severity: InsightSeverity;
    title: string;
    description: string;
    suggested_action?: string;
    potential_savings?: number;
    category?: string;
  }>;
  spending_persona?: string;
  trend_analysis?: {
    month_over_month_change: number;
    category_trends: Record<string, number>;
  };
}

