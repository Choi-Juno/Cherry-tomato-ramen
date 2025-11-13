"use client";

import { SpendingSummary } from "@/components/dashboard/SpendingSummary";
import { SpendingChart } from "@/components/dashboard/SpendingChart";
import { CategoryAnalysis } from "@/components/dashboard/CategoryAnalysis";
import { AIInsightCard } from "@/components/insights/AIInsightCard";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatShortDate } from "@/lib/utils";
import { AIInsight } from "@/types/insight";
import { useTransactionsStore } from "@/lib/store/transactions-store";
import { useMemo } from "react";

// Mock data - AI Insights (ML 서비스 연결 전까지 사용)
const MOCK_INSIGHTS: AIInsight[] = [
    {
        id: "1",
        user_id: "user1",
        type: "overspending",
        severity: "warning",
        title: "식비 지출이 증가하고 있어요",
        description:
            "지난달 대비 식비가 15% 증가했습니다. 배달 음식과 카페 이용이 주요 원인입니다.",
        suggested_action:
            "주 2회 배달 음식을 줄이면 월 5만원을 절약할 수 있어요",
        potential_savings: 50000,
        category: "food",
        created_at: new Date().toISOString(),
    },
    {
        id: "2",
        user_id: "user1",
        type: "savings_opportunity",
        severity: "info",
        title: "교통비 절약 기회",
        description:
            "최근 택시 이용이 많았습니다. 대중교통을 이용하면 교통비를 절감할 수 있습니다.",
        suggested_action: "주 3회 대중교통 이용으로 월 3만원 절약 가능",
        potential_savings: 30000,
        category: "transport",
        created_at: new Date().toISOString(),
    },
    {
        id: "3",
        user_id: "user1",
        type: "trend_decrease",
        severity: "info",
        title: "쇼핑 지출이 감소했어요! 👏",
        description: "지난달 대비 쇼핑 지출이 20% 감소했습니다. 잘하고 계세요!",
        category: "shopping",
        created_at: new Date().toISOString(),
    },
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

export default function DashboardPage() {
    const { transactions } = useTransactionsStore();

    // 실시간 총 지출 계산
    const totalSpent = useMemo(() => {
        return transactions.reduce((sum, t) => sum + t.amount, 0);
    }, [transactions]);

    // 월 예산 (나중에 설정 기능 추가 예정)
    const monthlyBudget = 700000;
    const budgetRemaining = monthlyBudget - totalSpent;
    const budgetUsedPercentage = (totalSpent / monthlyBudget) * 100;

    // 카테고리별 지출 계산
    const categoryData = useMemo(() => {
        const categoryTotals: Record<string, number> = {};

        transactions.forEach((t) => {
            if (!categoryTotals[t.category]) {
                categoryTotals[t.category] = 0;
            }
            categoryTotals[t.category] += t.amount;
        });

        return Object.entries(categoryTotals).map(([category, amount]) => ({
            category,
            amount,
            label: CATEGORY_LABELS[category] || category,
        }));
    }, [transactions]);

    // 주간 트렌드 계산 (최근 5주)
    const weeklyTrend = useMemo(() => {
        const weeks: Record<string, number> = {};
        const now = new Date();

        transactions.forEach((t) => {
            const transDate = new Date(t.date);
            const diffTime = now.getTime() - transDate.getTime();
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            const weekNumber = Math.floor(diffDays / 7);

            if (weekNumber < 5) {
                const weekKey = `week${weekNumber}`;
                if (!weeks[weekKey]) {
                    weeks[weekKey] = 0;
                }
                weeks[weekKey] += t.amount;
            }
        });

        // 최근 5주 데이터 생성
        const trendData = [];
        for (let i = 4; i >= 0; i--) {
            const weekKey = `week${i}`;
            trendData.push({
                date: new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000)
                    .toISOString()
                    .split("T")[0],
                amount: weeks[weekKey] || 0,
                label: i === 0 ? "이번 주" : `${i}주 전`,
            });
        }

        return trendData;
    }, [transactions]);

    // Get recent transactions (최근 5개)
    const recentTransactions = useMemo(() => {
        return transactions.slice(0, 5);
    }, [transactions]);

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

    return (
        <div className="space-y-5">
            {/* Page Header */}
            <div className="pt-2">
                <div className="flex items-center justify-between mb-1">
                    <h1 className="text-2xl font-bold text-slate-900">
                        안녕하세요 👋
                    </h1>
                    <div className="text-xs text-slate-500">
                        {new Date().toLocaleDateString("ko-KR", {
                            month: "long",
                            day: "numeric",
                        })}
                    </div>
                </div>
                <p className="text-sm text-slate-600">
                    오늘도 현명한 소비 하세요!
                </p>
            </div>

            {/* Spending Summary Cards - 실시간 데이터 */}
            <SpendingSummary
                totalSpent={totalSpent}
                budgetRemaining={budgetRemaining}
                monthlyBudget={monthlyBudget}
                percentageChange={12.5} // TODO: 이전 달 대비 계산
            />

            {/* Charts Section - 실시간 데이터 */}
            <div className="space-y-4">
                <SpendingChart
                    data={weeklyTrend}
                    title="주간 소비 추이"
                    type="bar"
                />
                {categoryData.length > 0 ? (
                    <CategoryAnalysis data={categoryData} />
                ) : (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <div className="text-4xl mb-3">📊</div>
                            <p className="text-sm text-slate-600">
                                지출을 추가하면 카테고리별 분석이 표시됩니다
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* AI Insights Section */}
            <section>
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold text-slate-900">
                            AI 인사이트
                        </h2>
                        <Badge
                            variant="default"
                            className="text-[10px] px-2 py-0.5"
                        >
                            New
                        </Badge>
                    </div>
                </div>
                <div className="space-y-3">
                    {MOCK_INSIGHTS.map((insight) => (
                        <AIInsightCard key={insight.id} insight={insight} />
                    ))}
                </div>
            </section>

            {/* Recent Transactions - 실제 데이터 사용 */}
            <section>
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xl font-bold text-slate-900">
                        최근 내역
                    </h2>
                    <a
                        href="/dashboard/transactions"
                        className="text-sm font-semibold text-violet-600 active:text-violet-700 flex items-center gap-1"
                    >
                        전체보기
                        <span className="text-xs">→</span>
                    </a>
                </div>

                {recentTransactions.length === 0 ? (
                    <Card className="overflow-hidden shadow-sm">
                        <CardContent className="p-12 text-center">
                            <div className="text-5xl mb-4">📝</div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">
                                아직 지출 내역이 없어요
                            </h3>
                            <p className="text-sm text-slate-600 mb-4">
                                우측 하단 + 버튼을 눌러 첫 지출을 기록해보세요!
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="overflow-hidden shadow-sm">
                        <CardContent className="p-0">
                            <div className="divide-y divide-slate-100">
                                {recentTransactions.map((transaction) => (
                                    <div
                                        key={transaction.id}
                                        className="flex items-center justify-between p-4 active:bg-slate-50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className="h-11 w-11 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center flex-shrink-0 shadow-sm">
                                                <span className="text-xl">
                                                    {categoryIcons[
                                                        transaction.category
                                                    ] || "📦"}
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-slate-900 text-sm truncate">
                                                    {transaction.description}
                                                </p>
                                                <p className="text-xs text-slate-500 truncate">
                                                    {
                                                        CATEGORY_LABELS[
                                                            transaction.category
                                                        ]
                                                    }{" "}
                                                    •{" "}
                                                    {formatShortDate(
                                                        new Date(
                                                            transaction.date
                                                        )
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right flex-shrink-0 ml-3">
                                            <p className="font-bold text-slate-900 text-base">
                                                {formatCurrency(
                                                    transaction.amount
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </section>
        </div>
    );
}
