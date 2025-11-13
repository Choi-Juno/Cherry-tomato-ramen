import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Search } from "lucide-react";

// Mock data
const MOCK_TRANSACTIONS = [
  { id: "1", description: "스타벅스 커피", amount: 5500, category: "food", payment_method: "card", merchant: "스타벅스", date: "2024-01-15" },
  { id: "2", description: "지하철", amount: 1350, category: "transport", payment_method: "card", merchant: "서울교통공사", date: "2024-01-15" },
  { id: "3", description: "점심 식사", amount: 9000, category: "food", payment_method: "card", merchant: "맛있는집", date: "2024-01-14" },
  { id: "4", description: "영화 관람", amount: 15000, category: "entertainment", payment_method: "card", merchant: "CGV", date: "2024-01-13" },
  { id: "5", description: "편의점", amount: 8500, category: "food", payment_method: "cash", merchant: "GS25", date: "2024-01-13" },
  { id: "6", description: "택시", amount: 12000, category: "transport", payment_method: "card", merchant: "카카오T", date: "2024-01-12" },
  { id: "7", description: "온라인 쇼핑", amount: 45000, category: "shopping", payment_method: "card", merchant: "쿠팡", date: "2024-01-10" },
  { id: "8", description: "저녁 식사", amount: 18000, category: "food", payment_method: "card", merchant: "한식당", date: "2024-01-09" },
];

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
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">거래 내역</h1>
        <p className="text-slate-600 mt-1">모든 지출 내역을 확인하고 관리하세요</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="내용, 장소 검색..."
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select defaultValue="all">
              <SelectTrigger className="w-full sm:w-[180px]">
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
            <Select defaultValue="month">
              <SelectTrigger className="w-full sm:w-[150px]">
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
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-600">총 거래 건수</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {MOCK_TRANSACTIONS.length}건
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-600">총 지출 금액</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {formatCurrency(
                MOCK_TRANSACTIONS.reduce((sum, t) => sum + t.amount, 0)
              )}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-600">평균 지출</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {formatCurrency(
                MOCK_TRANSACTIONS.reduce((sum, t) => sum + t.amount, 0) /
                  MOCK_TRANSACTIONS.length
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions List */}
      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-200">
            {MOCK_TRANSACTIONS.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="h-12 w-12 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">
                      {transaction.category === "food" && "🍽️"}
                      {transaction.category === "transport" && "🚗"}
                      {transaction.category === "shopping" && "🛍️"}
                      {transaction.category === "entertainment" && "🎬"}
                      {transaction.category === "education" && "📚"}
                      {transaction.category === "health" && "💊"}
                      {transaction.category === "utilities" && "💡"}
                      {transaction.category === "other" && "📦"}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-900 truncate">
                        {transaction.description}
                      </p>
                      <Badge
                        className={CATEGORY_COLORS[transaction.category]}
                        variant="secondary"
                      >
                        {CATEGORY_LABELS[transaction.category]}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">
                      {transaction.merchant} • {formatDate(transaction.date)}
                    </p>
                  </div>
                </div>

                <div className="text-right ml-4">
                  <p className="font-bold text-slate-900 text-lg">
                    {formatCurrency(transaction.amount)}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {transaction.payment_method === "card" && "카드"}
                    {transaction.payment_method === "cash" && "현금"}
                    {transaction.payment_method === "transfer" && "이체"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

