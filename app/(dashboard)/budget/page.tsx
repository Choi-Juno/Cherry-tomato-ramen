"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { TransactionCategory } from "@/types/transaction";
import { Edit2, Check, X } from "lucide-react";

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

const MOCK_BUDGETS: BudgetItem[] = [
  { category: "food", budget: 300000, spent: 280000 },
  { category: "transport", budget: 100000, spent: 120000 },
  { category: "shopping", budget: 150000, spent: 150000 },
  { category: "entertainment", budget: 100000, spent: 80000 },
  { category: "education", budget: 50000, spent: 0 },
  { category: "health", budget: 30000, spent: 0 },
  { category: "utilities", budget: 0, spent: 0 },
  { category: "other", budget: 20000, spent: 20000 },
];

export default function BudgetPage() {
  const [budgets, setBudgets] = useState<BudgetItem[]>(MOCK_BUDGETS);
  const [editingId, setEditingId] = useState<TransactionCategory | null>(null);
  const [tempValue, setTempValue] = useState("");

  const totalBudget = budgets.reduce((sum, item) => sum + item.budget, 0);
  const totalSpent = budgets.reduce((sum, item) => sum + item.spent, 0);
  const totalRemaining = totalBudget - totalSpent;

  const handleEdit = (category: TransactionCategory, currentBudget: number) => {
    setEditingId(category);
    setTempValue(currentBudget.toString());
  };

  const handleSave = (category: TransactionCategory) => {
    const newBudget = parseInt(tempValue) || 0;
    setBudgets(
      budgets.map((item) =>
        item.category === category ? { ...item, budget: newBudget } : item
      )
    );
    setEditingId(null);
    setTempValue("");
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
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">예산 관리</h1>
        <p className="text-slate-600 mt-1">
          카테고리별 예산을 설정하고 지출을 관리하세요
        </p>
      </div>

      {/* Overall Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-slate-600">총 예산</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">
              {formatCurrency(totalBudget)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-slate-600">총 지출</p>
            <p className="text-3xl font-bold text-violet-600 mt-2">
              {formatCurrency(totalSpent)}
            </p>
            <p className="text-sm text-slate-500 mt-2">
              {totalBudget > 0
                ? `${((totalSpent / totalBudget) * 100).toFixed(0)}% 사용`
                : "예산 미설정"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-slate-600">남은 예산</p>
            <p
              className={`text-3xl font-bold mt-2 ${
                totalRemaining < 0 ? "text-red-600" : "text-emerald-600"
              }`}
            >
              {formatCurrency(Math.abs(totalRemaining))}
            </p>
            {totalRemaining < 0 && (
              <p className="text-sm text-red-500 mt-2">예산 초과</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Category Budgets */}
      <Card>
        <CardHeader>
          <CardTitle>카테고리별 예산</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {budgets.map((item) => {
              const percentage =
                item.budget > 0 ? (item.spent / item.budget) * 100 : 0;
              const status = getBudgetStatus(item.spent, item.budget);
              const isEditing = editingId === item.category;

              return (
                <div key={item.category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">
                        {item.category === "food" && "🍽️"}
                        {item.category === "transport" && "🚗"}
                        {item.category === "shopping" && "🛍️"}
                        {item.category === "entertainment" && "🎬"}
                        {item.category === "education" && "📚"}
                        {item.category === "health" && "💊"}
                        {item.category === "utilities" && "💡"}
                        {item.category === "other" && "📦"}
                      </span>
                      <div>
                        <p className="font-medium text-slate-900">
                          {CATEGORY_LABELS[item.category]}
                        </p>
                        <p className="text-sm text-slate-500">
                          {formatCurrency(item.spent)} /{" "}
                          {formatCurrency(item.budget)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {status.severity === "danger" && (
                        <Badge variant="destructive">초과</Badge>
                      )}
                      {status.severity === "warning" && (
                        <Badge variant="warning">주의</Badge>
                      )}

                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={tempValue}
                            onChange={(e) => setTempValue(e.target.value)}
                            className="w-32"
                            placeholder="예산 입력"
                            autoFocus
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleSave(item.category)}
                          >
                            <Check className="h-4 w-4 text-emerald-600" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={handleCancel}
                          >
                            <X className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEdit(item.category, item.budget)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Progress
                      value={Math.min(percentage, 100)}
                      className="h-2"
                    />
                    <p className="text-xs text-slate-500 text-right">
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
      <Card className="bg-violet-50 border-violet-200">
        <CardContent className="p-6">
          <h3 className="font-semibold text-violet-900 mb-2">
            💡 예산 설정 팁
          </h3>
          <ul className="space-y-1 text-sm text-violet-800">
            <li>• 월 수입의 50-30-20 법칙: 생활비 50%, 여가 30%, 저축 20%</li>
            <li>• 식비는 월 수입의 20-25%가 적정선입니다</li>
            <li>• 예산의 80%에 도달하면 지출을 줄이기 시작하세요</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

