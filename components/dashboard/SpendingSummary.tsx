import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, TrendingDown, ChevronRight } from "lucide-react";
import Link from "next/link";

interface SpendingSummaryProps {
  totalSpent: number;
  budgetRemaining: number;
  monthlyBudget: number;
  percentageChange: number;
}

export function SpendingSummary({
  totalSpent,
  budgetRemaining,
  monthlyBudget,
  percentageChange,
}: SpendingSummaryProps) {
  const budgetUsedPercentage = monthlyBudget > 0 ? (totalSpent / monthlyBudget) * 100 : 0;
  const isOverBudget = budgetUsedPercentage > 100;

  return (
    <div className="space-y-3">
      {/* Main Summary Card */}
      <Card className="overflow-hidden shadow-md bg-gradient-to-br from-violet-500 to-purple-600 dark:from-violet-600 dark:to-purple-700 border-none">
        <CardContent className="p-5">
          <div className="text-white">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-violet-100">이번 달 총 지출</p>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold mb-2">
                  {formatCurrency(totalSpent)}
                </p>
                <div className="flex items-center gap-1">
                  {percentageChange > 0 ? (
                    <>
                      <TrendingUp className="h-3.5 w-3.5" />
                      <span className="text-xs font-medium">
                        +{percentageChange.toFixed(1)}%
                      </span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="h-3.5 w-3.5" />
                      <span className="text-xs font-medium">
                        {percentageChange.toFixed(1)}%
                      </span>
                    </>
                  )}
                  <span className="text-xs text-violet-100">지난달 대비</span>
                </div>
              </div>
              <Link href="/dashboard/transactions">
                <div className="rounded-full bg-white/20 p-3 backdrop-blur-sm hover:bg-white/30 transition-colors cursor-pointer">
                  <ChevronRight className="h-7 w-7 text-white" />
                </div>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Budget Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Budget Remaining */}
        <Card className="shadow-sm bg-card border-border">
          <CardContent className="p-4">
            <div className="flex flex-col">
              <p className="text-xs font-medium text-muted-foreground mb-1">남은 예산</p>
              <p
                className={`text-2xl font-bold ${
                  isOverBudget ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"
                }`}
              >
                {formatCurrency(Math.abs(budgetRemaining))}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">
                {isOverBudget ? "⚠️ 예산 초과" : `✓ ${(100 - budgetUsedPercentage).toFixed(0)}% 남음`}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Budget */}
        <Card className="shadow-sm bg-card border-border">
          <CardContent className="p-4">
            <div className="flex flex-col">
              <p className="text-xs font-medium text-muted-foreground mb-1">월 예산</p>
              <p className="text-2xl font-bold text-foreground">
                {formatCurrency(monthlyBudget)}
              </p>
              <div className="mt-2">
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      budgetUsedPercentage > 90
                        ? "bg-red-500"
                        : budgetUsedPercentage > 70
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                    }`}
                    style={{ width: `${Math.min(budgetUsedPercentage, 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {budgetUsedPercentage.toFixed(0)}% 사용 중
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
