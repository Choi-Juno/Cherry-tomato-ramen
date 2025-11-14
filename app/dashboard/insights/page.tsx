"use client";

// Force dynamic rendering - don't prerender at build time
export const dynamic = 'force-dynamic';

import { AIInsightCard } from "@/components/insights/AIInsightCard";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AIInsight } from "@/types/insight";
import { Lightbulb, TrendingUp, AlertTriangle } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { mlApiClient } from "@/lib/ml/client";
import { createClient } from "@/lib/supabase/client";
import { useTransactionsStore } from "@/lib/store/transactions-store";

const TABS_DATA = [
  { value: "all", label: "전체", icon: Lightbulb },
  { value: "savings", label: "절약 기회", icon: TrendingUp },
  { value: "warnings", label: "주의 필요", icon: AlertTriangle },
];

export default function InsightsPage() {
  const { transactions } = useTransactionsStore();
  const supabase = createClient();

  // AI Insights 상태
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);

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
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error("User not authenticated");
        }

        // 예산 데이터 준비 (카테고리별)
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
        const insights: AIInsight[] = (response.insights || []).map((insight, index) => ({
          ...insight,
          id: `${user.id}-${Date.now()}-${index}`,
          user_id: user.id,
          created_at: new Date().toISOString(),
        }));
        setAiInsights(insights);
      } catch (error) {
        console.error("Failed to fetch AI insights:", error);
        setInsightsError("AI 인사이트를 불러올 수 없습니다. 잠시 후 다시 시도해주세요.");
        setAiInsights([]);
      } finally {
        setIsLoadingInsights(false);
      }
    };

    fetchInsights();
  }, [transactions, supabase]);

  // 필터링된 인사이트 계산
  const savingsInsights = useMemo(
    () =>
      aiInsights.filter(
        (i) => i.type === "savings_opportunity" || i.potential_savings
      ),
    [aiInsights]
  );

  const warningInsights = useMemo(
    () =>
      aiInsights.filter(
        (i) => i.severity === "warning" || i.severity === "critical"
      ),
    [aiInsights]
  );

  const totalPotentialSavings = useMemo(
    () =>
      aiInsights.reduce(
        (sum, insight) => sum + (insight.potential_savings || 0),
        0
      ),
    [aiInsights]
  );

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="pt-2">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">AI 인사이트</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          AI가 분석한 당신의 소비 패턴과 개선 방안
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-3 grid-cols-3">
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col items-center text-center">
              <div className="rounded-full bg-violet-100 dark:bg-violet-900 p-2.5 mb-2">
                <Lightbulb className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              </div>
              <p className="text-[10px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                인사이트
              </p>
              <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {isLoadingInsights ? "-" : `${aiInsights.length}개`}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col items-center text-center">
              <div className="rounded-full bg-emerald-100 dark:bg-emerald-900 p-2.5 mb-2">
                <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-[10px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                절약 가능
              </p>
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {isLoadingInsights
                  ? "-"
                  : `${(totalPotentialSavings / 10000).toFixed(0)}만원`}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col items-center text-center">
              <div className="rounded-full bg-amber-100 dark:bg-amber-900 p-2.5 mb-2">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <p className="text-[10px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                주의 항목
              </p>
              <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
                {isLoadingInsights ? "-" : `${warningInsights.length}개`}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 h-11">
          {TABS_DATA.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger key={tab.value} value={tab.value} className="gap-1.5 text-sm">
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="all" className="space-y-3 mt-4">
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
            <Card className="border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950">
              <CardContent className="p-6 text-center">
                <div className="text-3xl mb-2">⚠️</div>
                <p className="text-sm text-red-700 dark:text-red-300">{insightsError}</p>
              </CardContent>
            </Card>
          ) : aiInsights.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="text-4xl mb-3">💡</div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {transactions.length === 0
                    ? "지출 내역을 추가하면 AI가 인사이트를 제공합니다"
                    : "현재 특별한 인사이트가 없습니다. 계속 현명한 소비를 하세요!"}
                </p>
              </CardContent>
            </Card>
          ) : (
            aiInsights.map((insight) => (
              <AIInsightCard key={insight.id} insight={insight} />
            ))
          )}
        </TabsContent>

        <TabsContent value="savings" className="space-y-3 mt-4">
          {isLoadingInsights ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="text-4xl mb-3">🤖</div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  절약 기회를 찾는 중...
                </p>
              </CardContent>
            </Card>
          ) : savingsInsights.length > 0 ? (
            savingsInsights.map((insight) => (
              <AIInsightCard key={insight.id} insight={insight} />
            ))
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="text-4xl mb-3">💰</div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  현재 추천할 절약 기회가 없습니다
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="warnings" className="space-y-3 mt-4">
          {isLoadingInsights ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="text-4xl mb-3">🤖</div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  주의 항목을 확인하는 중...
                </p>
              </CardContent>
            </Card>
          ) : warningInsights.length > 0 ? (
            warningInsights.map((insight) => (
              <AIInsightCard key={insight.id} insight={insight} />
            ))
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="text-4xl mb-3">✨</div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  현재 주의가 필요한 항목이 없습니다 👍
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

