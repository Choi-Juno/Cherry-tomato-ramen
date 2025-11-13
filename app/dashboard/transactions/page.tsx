"use client";

// Force dynamic rendering - don't prerender at build time
export const dynamic = 'force-dynamic';

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Search, Trash2 } from "lucide-react";
import { useTransactionsStore } from "@/lib/store/transactions-store";
import { useToast } from "@/components/ui/toast";

const CATEGORY_LABELS: Record<string, string> = {
  food: "식비",
  transport: "교통비",
  shopping: "쇼핑",
  entertainment: "문화/여가",
  education: "교육",
  health: "의료/건강",
  utilities: "공과금",
  other: "기타",
};

const CATEGORY_COLORS: Record<string, string> = {
  food: "bg-violet-100 text-violet-700",
  transport: "bg-blue-100 text-blue-700",
  shopping: "bg-pink-100 text-pink-700",
  entertainment: "bg-amber-100 text-amber-700",
  education: "bg-emerald-100 text-emerald-700",
  health: "bg-red-100 text-red-700",
  utilities: "bg-slate-100 text-slate-700",
  other: "bg-gray-100 text-gray-700",
};

export default function TransactionsPage() {
  const { transactions, deleteTransaction } = useTransactionsStore();
  const { addToast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState("month");

  // 카테고리 아이콘 맵핑
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

  // 필터링된 거래 내역
  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

    // 검색어 필터
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.description.toLowerCase().includes(query) ||
          t.merchant?.toLowerCase().includes(query)
      );
    }

    // 카테고리 필터
    if (categoryFilter !== "all") {
      filtered = filtered.filter((t) => t.category === categoryFilter);
    }

    // 기간 필터
    const now = new Date();
    const periodDaysMap: Record<string, number> = {
      week: 7,
      month: 30,
      quarter: 90,
      year: 365,
    };
    const periodDays: number = periodDaysMap[periodFilter] ?? 30; // 기본값 30일

    filtered = filtered.filter((t) => {
      const transDate = new Date(t.date);
      const diffTime = now.getTime() - transDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= periodDays;
    });

    return filtered;
  }, [transactions, searchQuery, categoryFilter, periodFilter]);

  // 통계 계산
  const stats = useMemo(() => {
    const total = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
    const count = filteredTransactions.length;
    const average = count > 0 ? total / count : 0;

    return { total, count, average };
  }, [filteredTransactions]);

  // 삭제 핸들러
  const handleDelete = async (id: string, description: string) => {
    if (confirm(`"${description}" 거래를 삭제하시겠습니까?`)) {
      try {
        await deleteTransaction(id);
        addToast({
          title: "삭제 완료",
          description: "거래 내역이 삭제되었습니다.",
          variant: "success",
        });
      } catch {
        addToast({
          title: "삭제 실패",
          description: "거래 삭제 중 오류가 발생했습니다.",
          variant: "error",
        });
      }
    }
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="pt-2">
        <h1 className="text-2xl font-bold text-slate-900">거래 내역</h1>
        <p className="text-sm text-slate-600 mt-1">
          모든 지출 내역을 확인하고 관리하세요
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="내용, 장소 검색..."
                className="pl-10 h-12"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Category Filter */}
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="카테고리" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 카테고리</SelectItem>
                  {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Date Filter */}
              <Select value={periodFilter} onValueChange={setPeriodFilter}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="기간" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">최근 1주일</SelectItem>
                  <SelectItem value="month">최근 1개월</SelectItem>
                  <SelectItem value="quarter">최근 3개월</SelectItem>
                  <SelectItem value="year">최근 1년</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid gap-3 grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-600 mb-1">거래 건수</p>
            <p className="text-xl font-bold text-slate-900">
              {stats.count}건
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-600 mb-1">총 지출</p>
            <p className="text-xl font-bold text-slate-900">
              {formatCurrency(stats.total)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-600 mb-1">평균</p>
            <p className="text-xl font-bold text-slate-900">
              {formatCurrency(Math.floor(stats.average))}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions List */}
      {filteredTransactions.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              거래 내역이 없습니다
            </h3>
            <p className="text-sm text-slate-600">
              {searchQuery || categoryFilter !== "all"
                ? "검색 조건을 변경해보세요"
                : "우측 하단 + 버튼을 눌러 지출을 추가해보세요"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {filteredTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 active:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="h-11 w-11 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center flex-shrink-0 shadow-sm">
                      <span className="text-xl">
                        {categoryIcons[transaction.category] || "📦"}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-slate-900 text-sm truncate">
                          {transaction.description}
                        </p>
                        <Badge
                          className={CATEGORY_COLORS[transaction.category]}
                          variant="secondary"
                        >
                          {CATEGORY_LABELS[transaction.category]}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500">
                        {transaction.merchant && `${transaction.merchant} • `}
                        {formatDate(transaction.date)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-3">
                    <div className="text-right">
                      <p className="font-bold text-slate-900 text-base">
                        {formatCurrency(transaction.amount)}
                      </p>
                      <p className="text-xs text-slate-500">
                        {transaction.payment_method === "card" && "카드"}
                        {transaction.payment_method === "cash" && "현금"}
                        {transaction.payment_method === "transfer" && "이체"}
                        {transaction.payment_method === "other" && "기타"}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 w-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() =>
                        handleDelete(transaction.id, transaction.description)
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

