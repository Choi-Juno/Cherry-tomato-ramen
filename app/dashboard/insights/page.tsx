import { AIInsightCard } from "@/components/insights/AIInsightCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AIInsight } from "@/types/insight";
import { Lightbulb, TrendingUp, AlertTriangle } from "lucide-react";

// Mock data
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
  {
    id: "4",
    user_id: "user1",
    type: "category_warning",
    severity: "warning",
    title: "문화/여가 예산 초과 위험",
    description:
      "이번 달 문화/여가 지출이 예산의 85%에 도달했습니다. 남은 기간 동안 주의가 필요합니다.",
    suggested_action: "이번 주말은 무료 문화 시설을 이용해보는 건 어떨까요?",
    category: "entertainment",
    created_at: new Date().toISOString(),
  },
  {
    id: "5",
    user_id: "user1",
    type: "spending_persona",
    severity: "info",
    title: "당신의 소비 패턴: 균형잡힌 소비자 🎯",
    description:
      "다양한 카테고리에 고르게 지출하고 있으며, 충동 구매가 적은 편입니다. 전체 사용자 중 상위 30%의 건강한 소비 패턴을 보이고 있어요!",
    created_at: new Date().toISOString(),
  },
  {
    id: "6",
    user_id: "user1",
    type: "trend_increase",
    severity: "critical",
    title: "배달 음식 지출 급증",
    description:
      "최근 2주간 배달 음식 주문이 이전 대비 50% 증가했습니다. 주요 원인은 야식 주문입니다.",
    suggested_action:
      "집에서 간단한 요리를 준비하거나, 야식 대신 건강한 간식을 준비해보세요",
    potential_savings: 40000,
    category: "food",
    created_at: new Date().toISOString(),
  },
];

const TABS_DATA = [
  { value: "all", label: "전체", icon: Lightbulb },
  { value: "savings", label: "절약 기회", icon: TrendingUp },
  { value: "warnings", label: "주의 필요", icon: AlertTriangle },
];

export default function InsightsPage() {
  const savingsInsights = MOCK_INSIGHTS.filter(
    (i) => i.type === "savings_opportunity" || i.potential_savings
  );
  const warningInsights = MOCK_INSIGHTS.filter(
    (i) => i.severity === "warning" || i.severity === "critical"
  );

  const totalPotentialSavings = MOCK_INSIGHTS.reduce(
    (sum, insight) => sum + (insight.potential_savings || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">AI 인사이트</h1>
        <p className="text-slate-600 mt-1">
          AI가 분석한 당신의 소비 패턴과 개선 방안
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-violet-100 p-3">
                <Lightbulb className="h-6 w-6 text-violet-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">
                  총 인사이트
                </p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {MOCK_INSIGHTS.length}개
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-emerald-100 p-3">
                <TrendingUp className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">
                  절약 가능 금액
                </p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">
                  {(totalPotentialSavings / 10000).toFixed(0)}만원
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-amber-100 p-3">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">주의 항목</p>
                <p className="text-2xl font-bold text-amber-600 mt-1">
                  {warningInsights.length}개
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights Tabs */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          {TABS_DATA.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger key={tab.value} value={tab.value} className="gap-2">
                <Icon className="h-4 w-4" />
                {tab.label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {MOCK_INSIGHTS.map((insight) => (
            <AIInsightCard key={insight.id} insight={insight} />
          ))}
        </TabsContent>

        <TabsContent value="savings" className="space-y-4">
          {savingsInsights.length > 0 ? (
            savingsInsights.map((insight) => (
              <AIInsightCard key={insight.id} insight={insight} />
            ))
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-slate-500">
                  현재 추천할 절약 기회가 없습니다
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="warnings" className="space-y-4">
          {warningInsights.length > 0 ? (
            warningInsights.map((insight) => (
              <AIInsightCard key={insight.id} insight={insight} />
            ))
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-slate-500">
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

