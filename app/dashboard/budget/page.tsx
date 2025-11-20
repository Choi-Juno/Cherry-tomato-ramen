"use client";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { TransactionCategory } from "@/types/transaction";
import { Edit2, Check, X } from "lucide-react";
import { useTransactionsStore } from "@/lib/store/transactions-store";
import { useToast } from "@/components/ui/toast";
import { useBudget } from "@/lib/hooks/useBudget";

const CATEGORY_LABELS: Record<TransactionCategory, string> = {
  food: "식비",
  transport: "교통비",
  shopping: "쇼핑",
  entertainment: "문화/여가",
  education: "교육",
  health: "의료/건강",
  utilities: "공과금",
  other: "기타",
};

interface BudgetItem {
  category: TransactionCategory;
  budget: number;
  spent: number;
}

export default function BudgetPage() {
  const { transactions } = useTransactionsStore();
  const { budgets, totalBudget, setBudget, loading: budgetLoading } = useBudget();
  const { addToast } = useToast();
  
  const [editingId, setEditingId] = useState<TransactionCategory | null>(null);
  const [tempValue, setTempValue] = useState("");

  // 카테고리별 실제 지출 계산 (현재 월)
  const categorySpending = useMemo(() => {
    const spending: Record<string, number> = {};
    const currentMonth = new Date().toISOString().slice(0, 7);

    transactions.forEach((t) => {
      if (t.date.startsWith(currentMonth)) {
        spending[t.category] = (spending[t.category] || 0) + t.amount;
      }
    });

    return spending;
  }, [transactions]);

  // BudgetItem 배열 생성 (Supabase 데이터 기반)
  const budgetItems: BudgetItem[] = useMemo(() => {
    return Object.keys(CATEGORY_LABELS).map((key) => {
      const category = key as TransactionCategory;
      const budgetItem = budgets.find((b) => b.category === category);
      return {
        category,
        budget: budgetItem ? budgetItem.amount : 0,
        spent: categorySpending[category] || 0,
      };
    });
  }, [budgets, categorySpending]);

  const totalSpent = useMemo(() => budgetItems.reduce((sum, item) => sum + item.spent, 0), [budgetItems]);
  const totalRemaining = totalBudget - totalSpent;

  const handleEdit = (category: TransactionCategory, currentBudget: number) => {
    setEditingId(category);
    setTempValue(currentBudget.toString());
  };

  const handleSave = async (category: TransactionCategory) => {
    const newBudget = parseInt(tempValue) || 0;
    
    try {
      await setBudget({
        category,
        amount: newBudget,
        month: new Date().toISOString().slice(0, 7),
      });
      
      setEditingId(null);
      setTempValue("");
      
      addToast({
        title: "예산 설정 완료",
        description: `${CATEGORY_LABELS[category]} 예산이 ${formatCurrency(newBudget)}로 설정되었습니다.`,
        variant: "success",
      });
    } catch (error) {
      console.error(error);
      addToast({
        title: "설정 실패",
        description: "예산 저장 중 오류가 발생했습니다.",
        variant: "error",
      });
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setTempValue("");
  };

  const getBudgetStatus = (spent: number, budget: number) => {
    if (budget === 0) return { color: "bg-slate-300", severity: "none" };
    const percentage = (spent / budget) * 100;
    if (percentage >= 100) return { color: "bg-red-500", severity: "danger" };
    if (percentage >= 80) return { color: "bg-amber-500", severity: "warning" };
    return { color: "bg-emerald-500", severity: "success" };
  };

  if (budgetLoading) {
    return <div className="p-8 text-center">로딩 중...</div>;
  }

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="pt-2">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">예산 관리</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          카테고리별 예산을 설정하고 지출을 관리하세요
        </p>
      </div>

      {/* Overall Summary */}
      <div className="grid gap-3 grid-cols-3">
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">총 예산</p>
            <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {formatCurrency(totalBudget)}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">총 지출</p>
            <p className="text-xl font-bold text-violet-600 dark:text-violet-400">
              {formatCurrency(totalSpent)}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
              {totalBudget > 0
                ? `${((totalSpent / totalBudget) * 100).toFixed(0)}% 사용`
                : "미설정"}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">남은 예산</p>
            <p
              className={`text-xl font-bold ${
                totalRemaining < 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"
              }`}
            >
              {formatCurrency(Math.abs(totalRemaining))}
            </p>
            {totalRemaining < 0 && (
              <p className="text-[10px] text-red-500 dark:text-red-400 mt-1">초과</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Category Budgets */}
      <Card className="shadow-sm">
        <CardHeader className="p-4">
          <CardTitle className="text-lg">카테고리별 예산</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="space-y-5">
            {budgetItems.map((item) => {
              const percentage =
                item.budget > 0 ? (item.spent / item.budget) * 100 : 0;
              const status = getBudgetStatus(item.spent, item.budget);
              const isEditing = editingId === item.category;

              const categoryIcons: Record<string, string> = {
                food: "🍽️",
                transport: "🚗",
                shopping: "🛍️",
                entertainment: "🎬",
                education: "📚",
                health: "💊",
                utilities: "💡",
                other: "📦",
              };

              return (
                <div key={item.category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900 dark:to-purple-900 flex items-center justify-center flex-shrink-0 shadow-sm">
                        <span className="text-lg">
                          {categoryIcons[item.category] || "📦"}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                            {CATEGORY_LABELS[item.category]}
                          </p>
                          {status.severity === "danger" && (
                            <Badge variant="destructive" className="text-[9px] px-1.5 py-0">초과</Badge>
                          )}
                          {status.severity === "warning" && (
                            <Badge className="bg-amber-500 text-white hover:bg-amber-600 text-[9px] px-1.5 py-0">주의</Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {formatCurrency(item.spent)} / {formatCurrency(item.budget)}
                        </p>
                      </div>
                    </div>

                    {isEditing ? (
                      <div className="flex items-center gap-1 ml-2">
                        <Input
                          type="number"
                          value={tempValue}
                          onChange={(e) => setTempValue(e.target.value)}
                          className="w-24 h-9 text-sm"
                          placeholder="예산"
                          autoFocus
                        />
                        <Button
                          size="sm"
                          className="h-9 w-9 p-0 bg-emerald-600 hover:bg-emerald-700"
                          onClick={() => handleSave(item.category)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-9 w-9 p-0"
                          onClick={handleCancel}
                        >
                          <X className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-9 w-9 p-0 ml-2"
                        onClick={() => handleEdit(item.category, item.budget)}
                      >
                        <Edit2 className="h-3.5 w-3.5 text-violet-600" />
                      </Button>
                    )}
                  </div>

                  <div className="space-y-1">
                    <Progress
                      value={Math.min(percentage, 100)}
                      className="h-2"
                    />
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 text-right">
                      {percentage.toFixed(0)}% 사용
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/50 dark:to-purple-950/50 border-violet-200 dark:border-violet-900/50 shadow-sm">
        <CardContent className="p-4">
          <h3 className="font-semibold text-violet-900 dark:text-violet-300 mb-2 text-sm">
            💡 예산 설정 팁
          </h3>
          <ul className="space-y-1 text-xs text-violet-800 dark:text-violet-400 leading-relaxed">
            <li>• 50-30-20 법칙: 생활비 50%, 여가 30%, 저축 20%</li>
            <li>• 식비는 월 수입의 20-25%가 적정</li>
            <li>• 예산의 80%에 도달하면 지출 줄이기</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
