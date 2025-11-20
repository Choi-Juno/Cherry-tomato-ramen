"use client";

import { Card, CardContent } from "@/components/ui/card";
import { AIInsight } from "@/types/insight";
import { Lightbulb, TrendingUp, AlertTriangle, ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

interface DashboardAIInsightsProps {
    insights: AIInsight[];
    isLoading: boolean;
    error: string | null;
}

export function DashboardAIInsights({
    insights,
    isLoading,
    error,
}: DashboardAIInsightsProps) {
    // Calculate summary stats
    const totalInsights = insights.length;
    const totalSavings = insights.reduce(
        (sum, i) => sum + (i.potential_savings || 0),
        0
    );
    const warningCount = insights.filter(
        (i) => i.severity === "warning" || i.severity === "critical"
    ).length;

    // Determine the "Top Summary" message based on insights
    // In a real app, this might come from a specific "summary" endpoint or ML model output.
    // Here we construct a simple summary based on the data.
    const getSummaryMessage = () => {
        if (warningCount > 0) {
            return `현재 ${warningCount}건의 주의가 필요한 항목이 있습니다. 지출 내역을 확인해보세요.`;
        }
        if (totalSavings > 0) {
            return `이번 달 약 ${formatCurrency(
                totalSavings
            )}을 절약할 수 있는 기회가 있습니다!`;
        }
        if (totalInsights > 0) {
            return "새로운 소비 분석 리포트가 도착했습니다. 상세 내용을 확인해보세요.";
        }
        return "현재 특별한 특이사항이 없습니다. 현명한 소비를 이어가세요!";
    };

    if (isLoading) {
        return (
            <Card className="bg-card border-border shadow-sm">
                <CardContent className="p-6 flex items-center justify-center min-h-[100px]">
                    <div className="flex flex-col items-center gap-2">
                        <div className="animate-spin text-2xl">🤖</div>
                        <p className="text-sm text-muted-foreground">
                            AI 분석 중...
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900 shadow-sm">
                <CardContent className="p-6 flex items-center justify-center text-center">
                    <p className="text-sm text-red-600 dark:text-red-400">
                        {error}
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-3">
            {/* Summary Banner */}
            <Card className="bg-violet-50 dark:bg-violet-900 border-violet-100 dark:border-violet-900 shadow-sm">
                <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                        <div className="p-2 bg-white dark:bg-violet-900/50 rounded-full shadow-sm shrink-0">
                            <Lightbulb className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                                AI 소비 분석 리포트
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                                {getSummaryMessage()}
                            </p>

                            <Link
                                href="/dashboard/insights"
                                className="inline-flex items-center text-xs font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors"
                            >
                                전체 리포트 확인하기
                                <ArrowRight className="ml-1 h-3 w-3" />
                            </Link>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Mini Stats Row */}
            <div className="grid grid-cols-3 gap-3">
                <Link href="/dashboard/insights" className="block group">
                    <Card className="h-full bg-card hover:bg-muted transition-colors border-border shadow-sm">
                        <CardContent className="p-3 flex flex-col items-center justify-center text-center h-full">
                            <span className="text-[10px] text-muted-foreground font-medium mb-1">
                                전체 인사이트
                            </span>
                            <span className="text-lg font-bold text-foreground group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                                {totalInsights}건
                            </span>
                        </CardContent>
                    </Card>
                </Link>

                <Link
                    href="/dashboard/insights?tab=savings"
                    className="block group"
                >
                    <Card className="h-full bg-card hover:bg-muted transition-colors border-border shadow-sm">
                        <CardContent className="p-3 flex flex-col items-center justify-center text-center h-full">
                            <div className="flex items-center gap-1 mb-1">
                                <TrendingUp className="h-3 w-3 text-emerald-500" />
                                <span className="text-[10px] text-muted-foreground font-medium">
                                    절약 가능
                                </span>
                            </div>
                            <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                                {totalSavings > 0
                                    ? formatCurrency(totalSavings)
                                    : "-"}
                            </span>
                        </CardContent>
                    </Card>
                </Link>

                <Link
                    href="/dashboard/insights?tab=warnings"
                    className="block group"
                >
                    <Card className="h-full bg-card hover:bg-muted transition-colors border-border shadow-sm">
                        <CardContent className="p-3 flex flex-col items-center justify-center text-center h-full">
                            <div className="flex items-center gap-1 mb-1">
                                <AlertTriangle className="h-3 w-3 text-amber-500" />
                                <span className="text-[10px] text-muted-foreground font-medium">
                                    주의 항목
                                </span>
                            </div>
                            <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
                                {warningCount > 0 ? `${warningCount}건` : "-"}
                            </span>
                        </CardContent>
                    </Card>
                </Link>
            </div>
        </div>
    );
}
