import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";

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
  const budgetUsedPercentage = (totalSpent / monthlyBudget) * 100;
  const isOverBudget = budgetUsedPercentage > 100;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Total Spent This Month */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">이번 달 지출</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                {formatCurrency(totalSpent)}
              </p>
              <div className="flex items-center gap-1 mt-2">
                {percentageChange > 0 ? (
                  <>
                    <TrendingUp className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-500">
                      +{percentageChange.toFixed(1)}%
                    </span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm text-emerald-500">
                      {percentageChange.toFixed(1)}%
                    </span>
                  </>
                )}
                <span className="text-sm text-slate-500">지난달 대비</span>
              </div>
            </div>
            <div className="rounded-full bg-violet-100 p-3">
              <DollarSign className="h-6 w-6 text-violet-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Budget Remaining */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">남은 예산</p>
              <p
                className={`text-3xl font-bold mt-2 ${
                  isOverBudget ? "text-red-600" : "text-emerald-600"
                }`}
              >
                {formatCurrency(Math.abs(budgetRemaining))}
              </p>
              <p className="text-sm text-slate-500 mt-2">
                {isOverBudget ? "예산 초과" : `예산의 ${(100 - budgetUsedPercentage).toFixed(0)}%`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Budget */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">월 예산</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                {formatCurrency(monthlyBudget)}
              </p>
              <div className="mt-2">
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
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
                <p className="text-xs text-slate-500 mt-1">
                  {budgetUsedPercentage.toFixed(0)}% 사용
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

