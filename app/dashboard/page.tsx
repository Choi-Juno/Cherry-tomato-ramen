"use client";

// Force dynamic rendering - don't prerender at build time
export const dynamic = "force-dynamic";

import { SpendingSummary } from "@/components/dashboard/SpendingSummary";
import { SpendingOverview } from "@/components/dashboard/SpendingOverview";
import { AIInsightCard } from "@/components/insights/AIInsightCard";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency, formatShortDate } from "@/lib/utils";
import { AIInsight } from "@/types/insight";
import { useTransactionsStore } from "@/lib/store/transactions-store";
import { useBudget } from "@/lib/hooks/useBudget";
import { useMemo, useState, useEffect } from "react";
import { mlApiClient } from "@/lib/ml/client";
import { createClient } from "@/lib/supabase/client";

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
    const { totalBudget } = useBudget(); // useBudget hook for single source of truth
    const supabase = createClient();

    // AI Insights 상태
    const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
    const [isLoadingInsights, setIsLoadingInsights] = useState(false);
    const [insightsError, setInsightsError] = useState<string | null>(null);
    const [insightTab, setInsightTab] = useState("all");

    // 실시간 총 지출 계산
    const totalSpent = useMemo(() => {
        return transactions.reduce((sum, t) => sum + t.amount, 0);
    }, [transactions]);

    // 남은 예산 계산
    // If totalBudget is 0 (not set), remaining is negative totalSpent (or just show 0/unset logic in UI)
    const budgetRemaining = totalBudget > 0 ? totalBudget - totalSpent : -totalSpent;

    // Filtered Insights
    const filteredInsights = useMemo(() => {
        return aiInsights.filter((insight) => {
            if (insightTab === "all") return true;
            if (insightTab === "savings") return insight.type === "savings_opportunity";
            if (insightTab === "warnings") {
                return (
                    ["overspending", "category_warning"].includes(insight.type) ||
                    insight.severity === "warning" ||
                    insight.severity === "critical"
                );
            }
            return true;
        });
    }, [aiInsights, insightTab]);

    // ML API에서 AI 인사이트 가져오기
    useEffect(() => {
        const fetchInsights = async () => {
            // 거래 내역이 없으면 인사이트를 가져오지 않음
            if (transactions.length === 0) {
                setAiInsights([]);
                return;
            }

            setIsLoadingInsights(true);
            setInsightsError(null);

            try {
                // 현재 사용자 ID 가져오기
                const {
                    data: { user },
                } = await supabase.auth.getUser();
                if (!user) {
                    throw new Error("User not authenticated");
                }

                // 예산 데이터 준비 (카테고리별) - TODO: Pass actual budget data if available
                const currentMonthBudget = {
                    food: 300000,
                    transport: 100000,
                    shopping: 150000,
                    entertainment: 100000,
                    education: 50000,
                    health: 30000,
                    utilities: 50000,
                    other: 20000,
                };

                // ML API 호출
                const response = await mlApiClient.generateInsights({
                    user_id: user.id,
                    transactions: transactions.map((t) => ({
                        date: t.date,
                        amount: t.amount,
                        category: t.category,
                        description: t.description,
                    })),
                    current_month_budget: currentMonthBudget,
                });

                // 인사이트 설정 (ML API 응답을 AIInsight 타입으로 변환)
                const insights: AIInsight[] = (response.insights || []).map(
                    (insight, index) => ({
                        ...insight,
                        id: `${user.id}-${Date.now()}-${index}`,
                        user_id: user.id,
                        created_at: new Date().toISOString(),
                    })
                );
                setAiInsights(insights);
            } catch (error) {
                console.error("Failed to fetch AI insights:", error);

                // 에러 메시지를 더 자세하게 표시
                let errorMessage = "AI 인사이트를 불러올 수 없습니다.";
                if (error instanceof Error) {
                    errorMessage += ` (${error.message})`;
                    console.error("Error details:", error.message);
                }

                // ML 서비스 연결 확인
                try {
                    const response = await fetch(
                        "http://localhost:8000/health"
                    );
                    if (!response.ok) {
                        errorMessage =
                            "ML 서비스가 실행되지 않았습니다. 터미널에서 ML 서비스를 시작해주세요.";
                    }
                } catch {
                    errorMessage =
                        "ML 서비스에 연결할 수 없습니다. 터미널에서 ML 서비스를 시작해주세요.";
                }

                setInsightsError(errorMessage);
                setAiInsights([]);
            } finally {
                setIsLoadingInsights(false);
            }
        };

        fetchInsights();
    }, [transactions, supabase]);

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
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        안녕하세요 👋
                    </h1>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                        {new Date().toLocaleDateString("ko-KR", {
                            month: "long",
                            day: "numeric",
                        })}
                    </div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                    오늘도 현명한 소비 하세요!
                </p>
            </div>

            {/* Spending Summary Cards - 실시간 데이터 + 예산 연동 */}
            <SpendingSummary
                totalSpent={totalSpent}
                budgetRemaining={budgetRemaining}
                monthlyBudget={totalBudget}
                percentageChange={0} // TODO: 이전 달 대비 계산 로직 추가 필요
            />

            {/* Unified Spending Overview (Trend + Category) */}
            <div className="space-y-4">
                <SpendingOverview transactions={transactions} />
            </div>

            {/* AI Insights Section with Tabs */}
            <section>
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                            AI 인사이트
                        </h2>
                        <Badge
                            variant="default"
                            className="text-[10px] px-2 py-0.5"
                        >
                            AI
                        </Badge>
                    </div>
                </div>

                {/* Insight Tabs */}
                <Tabs value={insightTab} onValueChange={setInsightTab} className="w-full mb-3">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="all">전체</TabsTrigger>
                        <TabsTrigger value="savings">절약 가능</TabsTrigger>
                        <TabsTrigger value="warnings">주의 항목</TabsTrigger>
                    </TabsList>
                </Tabs>

                {isLoadingInsights ? (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <div className="text-4xl mb-3">🤖</div>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                AI가 당신의 소비 패턴을 분석하고 있습니다...
                            </p>
                        </CardContent>
                    </Card>
                ) : insightsError ? (
                    <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
                        <CardContent className="p-6 text-center">
                            <div className="text-3xl mb-2">⚠️</div>
                            <p className="text-sm text-red-700 dark:text-red-300">
                                {insightsError}
                            </p>
                        </CardContent>
                    </Card>
                ) : filteredInsights.length === 0 ? (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <div className="text-4xl mb-3">
                                {insightTab === "all" ? "💡" : insightTab === "savings" ? "💰" : "✅"}
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                {insightTab === "all"
                                    ? (transactions.length === 0
                                        ? "지출 내역을 추가하면 AI가 인사이트를 제공합니다"
                                        : "현재 특별한 인사이트가 없습니다.")
                                    : insightTab === "savings"
                                    ? "절약 가능한 항목이 없습니다."
                                    : "주의할 만한 지출 내역이 없습니다."}
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {filteredInsights.slice(0, 3).map((insight) => (
                            <AIInsightCard key={insight.id} insight={insight} />
                        ))}
                        {filteredInsights.length > 3 && (
                            <a
                                href="/dashboard/insights"
                                className="block text-center py-3 text-sm font-semibold text-violet-600 hover:text-violet-700 active:text-violet-800 dark:text-violet-400 dark:hover:text-violet-300"
                            >
                                전체 인사이트 보기 ({aiInsights.length}개) →
                            </a>
                        )}
                    </div>
                )}
            </section>

            {/* Recent Transactions */}
            <section>
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                        최근 내역
                    </h2>
                    <a
                        href="/dashboard/transactions"
                        className="text-sm font-semibold text-violet-600 active:text-violet-700 dark:text-violet-400 dark:active:text-violet-300 flex items-center gap-1"
                    >
                        전체보기
                        <span className="text-xs">→</span>
                    </a>
                </div>

                {recentTransactions.length === 0 ? (
                    <Card className="overflow-hidden shadow-sm">
                        <CardContent className="p-12 text-center">
                            <div className="text-5xl mb-4">📝</div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                                아직 지출 내역이 없어요
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                                우측 하단 + 버튼을 눌러 첫 지출을 기록해보세요!
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="overflow-hidden shadow-sm">
                        <CardContent className="p-0">
                            <div className="divide-y divide-slate-100 dark:divide-slate-700">
                                {recentTransactions.map((transaction) => (
                                    <div
                                        key={transaction.id}
                                        className="flex items-center justify-between p-4 active:bg-slate-50 dark:active:bg-slate-700 transition-colors"
                                    >
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className="h-11 w-11 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900 dark:to-purple-900 flex items-center justify-center flex-shrink-0 shadow-sm">
                                                <span className="text-xl">
                                                    {categoryIcons[
                                                        transaction.category
                                                    ] || "📦"}
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm truncate">
                                                    {transaction.description}
                                                </p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
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
                                            <p className="font-bold text-slate-900 dark:text-slate-100 text-base">
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
