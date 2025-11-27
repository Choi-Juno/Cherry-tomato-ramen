"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PeerComparisonMessage } from "@/types/coaching";
import { Users, TrendingUp, TrendingDown, Minus, HelpCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface PeerComparisonCardProps {
  comparison: PeerComparisonMessage;
}

const COMPARISON_STYLES = {
  above: {
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    progressColor: "bg-amber-500",
    icon: TrendingUp,
  },
  below: {
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    progressColor: "bg-emerald-500",
    icon: TrendingDown,
  },
  similar: {
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/30",
    progressColor: "bg-blue-500",
    icon: Minus,
  },
};

export function PeerComparisonCard({ comparison }: PeerComparisonCardProps) {
  const styles = COMPARISON_STYLES[comparison.comparison_type];
  const Icon = styles.icon;

  // Calculate progress percentage (user vs cohort)
  const maxValue = Math.max(comparison.user_spending, comparison.cohort_average);
  const userProgress =
    maxValue > 0 ? (comparison.user_spending / maxValue) * 100 : 0;
  const cohortProgress =
    maxValue > 0 ? (comparison.cohort_average / maxValue) * 100 : 0;

  // Convert age group to Korean label
  const ageLabel = comparison.age_group.replace("s", "").replace("+", "") + "대";

  return (
    <Card className={`${styles.bg} transition-all hover:shadow-md`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg bg-white/50 dark:bg-slate-800/50`}>
              <Users className={`h-5 w-5 ${styles.color}`} />
            </div>
            <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {ageLabel} 또래와 비교
            </CardTitle>
          </div>

          <div className="group relative">
            <button className="p-1 rounded-full hover:bg-white/50 dark:hover:bg-slate-800/50 transition-colors">
              <HelpCircle className="h-4 w-4 text-slate-400" />
            </button>
            <div className="absolute right-0 top-full mt-2 w-48 p-2 bg-slate-900 dark:bg-slate-700 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              {comparison.cohort_size}명의 {ageLabel} 사용자 데이터를 기반으로
              계산됩니다. 개인 정보는 포함되지 않습니다.
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Spending Comparison Bars */}
        <div className="space-y-3">
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-400">
                나의 지출
              </span>
              <span className="font-medium text-slate-900 dark:text-slate-100">
                {formatCurrency(comparison.user_spending)}
              </span>
            </div>
            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${styles.progressColor} rounded-full transition-all duration-500`}
                style={{ width: `${userProgress}%` }}
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-400">
                {ageLabel} 평균
              </span>
              <span className="font-medium text-slate-900 dark:text-slate-100">
                {formatCurrency(comparison.cohort_average)}
              </span>
            </div>
            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-slate-400 dark:bg-slate-500 rounded-full transition-all duration-500"
                style={{ width: `${cohortProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Difference Badge */}
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${styles.color}`} />
          <Badge variant="secondary" className={styles.color}>
            {comparison.comparison_type === "above" && "+"}
            {comparison.comparison_type === "below" && "-"}
            {Math.abs(comparison.difference_percent).toFixed(0)}%
          </Badge>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            ({comparison.comparison_type === "above" ? "+" : ""}
            {formatCurrency(comparison.difference_amount)})
          </span>
        </div>

        {/* Message */}
        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          {comparison.message}
        </p>
      </CardContent>
    </Card>
  );
}

