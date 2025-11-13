"use client";

// Force dynamic rendering - don't prerender at build time
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

// 초기 예산 설정 (로컬 스토리지에서 불러오거나 기본값 사용)
const getInitialBudgets = (): Record<TransactionCategory, number> => {
  if (typeof window === "undefined") return DEFAULT_BUDGETS;
  
  const saved = localStorage.getItem("category-budgets");
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return DEFAULT_BUDGETS;
    }
  }
  return DEFAULT_BUDGETS;
};

const DEFAULT_BUDGETS: Record<TransactionCategory, number> = {
  food: 300000,
  transport: 100000,
  shopping: 150000,
  entertainment: 100000,
  education: 50000,
  health: 30000,
  utilities: 50000,
  other: 20000,
};

export default function BudgetPage() {
  const { transactions } = useTransactionsStore();
  const { addToast } = useToast();
  
  const [categoryBudgets, setCategoryBudgets] = useState<Record<TransactionCategory, number>>(getInitialBudgets());
  const [editingId, setEditingId] = useState<TransactionCategory | null>(null);
  const [tempValue, setTempValue] = useState("");

  // 카테고리별 실제 지출 계산 (현재 월)
  const categorySpending = useMemo(() => {
    const spending: Record<TransactionCategory, number> = {
      food: 0,
      transport: 0,
      shopping: 0,
      entertainment: 0,
      education: 0,
      health: 0,
      utilities: 0,
      other: 0,
    };

    const currentMonth = new Date().toISOString().slice(0, 7);

    transactions.forEach((t) => {
      if (t.date.startsWith(currentMonth)) {
        spending[t.category] += t.amount;
      }
    });

    return spending;
  }, [transactions]);

  // BudgetItem 배열 생성
  const budgets: BudgetItem[] = useMemo(() => {
    return Object.entries(CATEGORY_LABELS).map(([category]) => ({
      category: category as TransactionCategory,
      budget: categoryBudgets[category as TransactionCategory],
      spent: categorySpending[category as TransactionCategory],
    }));
  }, [categoryBudgets, categorySpending]);

  const totalBudget = useMemo(() => budgets.reduce((sum, item) => sum + item.budget, 0), [budgets]);
  const totalSpent = useMemo(() => budgets.reduce((sum, item) => sum + item.spent, 0), [budgets]);
  const totalRemaining = totalBudget - totalSpent;

  const handleEdit = (category: TransactionCategory, currentBudget: number) => {
    setEditingId(category);
    setTempValue(currentBudget.toString());
  };

  const handleSave = (category: TransactionCategory) => {
    const newBudget = parseInt(tempValue) || 0;
    
    const updatedBudgets = {
      ...categoryBudgets,
      [category]: newBudget,
    };
    
    setCategoryBudgets(updatedBudgets);
    
    // 로컬 스토리지에 저장
    if (typeof window !== "undefined") {
      localStorage.setItem("category-budgets", JSON.stringify(updatedBudgets));
    }
    
    setEditingId(null);
    setTempValue("");
    
    addToast({
      title: "예산 설정 완료",
      description: `${CATEGORY_LABELS[category]} 예산이 ${formatCurrency(newBudget)}로 설정되었습니다.`,
      variant: "success",
    });
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

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="pt-2">
        <h1 className="text-2xl font-bold text-slate-900">예산 관리</h1>
        <p className="text-sm text-slate-600 mt-1">
          카테고리별 예산을 설정하고 지출을 관리하세요
        </p>
      </div>

      {/* Overall Summary */}
      <div className="grid gap-3 grid-cols-3">
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-slate-600 mb-1">총 예산</p>
            <p className="text-xl font-bold text-slate-900">
              {formatCurrency(totalBudget)}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-slate-600 mb-1">총 지출</p>
            <p className="text-xl font-bold text-violet-600">
              {formatCurrency(totalSpent)}
            </p>
            <p className="text-[10px] text-slate-500 mt-1">
              {totalBudget > 0
                ? `${((totalSpent / totalBudget) * 100).toFixed(0)}% 사용`
                : "미설정"}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-slate-600 mb-1">남은 예산</p>
            <p
              className={`text-xl font-bold ${
                totalRemaining < 0 ? "text-red-600" : "text-emerald-600"
              }`}
            >
              {formatCurrency(Math.abs(totalRemaining))}
            </p>
            {totalRemaining < 0 && (
              <p className="text-[10px] text-red-500 mt-1">초과</p>
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
            {budgets.map((item) => {
              const percentage =
                item.budget > 0 ? (item.spent / item.budget) * 100 : 0;
              const status = getBudgetStatus(item.spent, item.budget);
              const isEditing = editingId === item.category;

              const categoryIcons: Record<TransactionCategory, string> = {
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
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center flex-shrink-0 shadow-sm">
                        <span className="text-lg">
                          {categoryIcons[item.category]}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-slate-900 text-sm">
                            {CATEGORY_LABELS[item.category]}
                          </p>
                          {status.severity === "danger" && (
                            <Badge variant="destructive" className="text-[9px] px-1.5 py-0">초과</Badge>
                          )}
                          {status.severity === "warning" && (
                            <Badge variant="warning" className="text-[9px] px-1.5 py-0">주의</Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">
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
                    <p className="text-[10px] text-slate-500 text-right">
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
      <Card className="bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200 shadow-sm">
        <CardContent className="p-4">
          <h3 className="font-semibold text-violet-900 mb-2 text-sm">
            💡 예산 설정 팁
          </h3>
          <ul className="space-y-1 text-xs text-violet-800 leading-relaxed">
            <li>• 50-30-20 법칙: 생활비 50%, 여가 30%, 저축 20%</li>
            <li>• 식비는 월 수입의 20-25%가 적정</li>
            <li>• 예산의 80%에 도달하면 지출 줄이기</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

