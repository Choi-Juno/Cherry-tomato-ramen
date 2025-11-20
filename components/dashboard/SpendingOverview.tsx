"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SpendingChart } from "./SpendingChart";
import { CategoryAnalysis } from "./CategoryAnalysis";
import { Transaction } from "@/types/transaction";
import { Button } from "@/components/ui/button";
import { BarChart3, PieChart } from "lucide-react";

type ViewMode = "daily" | "weekly" | "monthly";
type ChartType = "trend" | "category";

interface SpendingOverviewProps {
    transactions: Transaction[];
}

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

// Moved outside component to prevent memoization issues
function getWeekLabel(dateStr: string) {
    const now = new Date();
    const date = new Date(dateStr);
    const diffTime = now.getTime() - date.getTime();
    const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
    if (diffWeeks === 0) return "이번 주";
    return `${diffWeeks}주 전`;
}

export function SpendingOverview({ transactions }: SpendingOverviewProps) {
    const [viewMode, setViewMode] = useState<ViewMode>("weekly");
    const [chartType, setChartType] = useState<ChartType>("trend");

    // 1. Aggregate for Trend Chart
    const trendData = useMemo(() => {
        const now = new Date();
        const dataMap: Record<string, number> = {};

        // Helper to format date as YYYY-MM-DD
        const formatDate = (d: Date) => d.toISOString().split("T")[0];

        // Initialize slots with 0
        if (viewMode === "daily") {
            for (let i = 6; i >= 0; i--) {
                const d = new Date(now);
                d.setDate(now.getDate() - i);
                const key = formatDate(d);
                dataMap[key] = 0;
            }
        } else if (viewMode === "weekly") {
            const currentWeekStart = new Date(now);
            currentWeekStart.setDate(now.getDate() - now.getDay());
            for (let i = 3; i >= 0; i--) {
                const d = new Date(currentWeekStart);
                d.setDate(currentWeekStart.getDate() - i * 7);
                const key = formatDate(d);
                dataMap[key] = 0;
            }
        } else if (viewMode === "monthly") {
            for (let i = 3; i >= 0; i--) {
                // Create date for the 1st of the month
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const key = `${d.getFullYear()}-${String(
                    d.getMonth() + 1
                ).padStart(2, "0")}`;
                dataMap[key] = 0;
            }
        }

        transactions.forEach((t) => {
            const date = new Date(t.date);
            let key = "";

            if (viewMode === "daily") {
                // Check if transaction is within range (handled by map check)
                key = t.date;
            } else if (viewMode === "weekly") {
                const startOfWeek = new Date(date);
                startOfWeek.setDate(date.getDate() - date.getDay());
                key = formatDate(startOfWeek);
            } else if (viewMode === "monthly") {
                key = t.date.slice(0, 7); // YYYY-MM
            }

            if (Object.prototype.hasOwnProperty.call(dataMap, key)) {
                dataMap[key] += t.amount;
            }
        });

        // Convert map to array and sort
        return Object.entries(dataMap)
            .map(([date, amount]) => {
                let label = "";
                if (viewMode === "daily") {
                    label = date.slice(5);
                } else if (viewMode === "monthly") {
                    label = `${parseInt(date.slice(5, 7))}월`;
                } else if (viewMode === "weekly") {
                    label = getWeekLabel(date);
                }

                return {
                    date, // used for sorting
                    amount,
                    label,
                };
            })
            .sort((a, b) => a.date.localeCompare(b.date));
    }, [transactions, viewMode]);

    // 2. Aggregate for Category Chart
    const categoryData = useMemo(() => {
        const categoryTotals: Record<string, number> = {};
        const now = new Date();

        transactions.forEach((t) => {
            const date = new Date(t.date);
            let include = false;

            if (viewMode === "daily") {
                const diffTime = now.getTime() - date.getTime();
                if (Math.floor(diffTime / (1000 * 60 * 60 * 24)) < 7)
                    include = true;
            } else if (viewMode === "weekly") {
                const diffTime = now.getTime() - date.getTime();
                if (Math.floor(diffTime / (1000 * 60 * 60 * 24)) < 28)
                    include = true; // approx 4 weeks
            } else {
                const monthDiff =
                    (now.getFullYear() - date.getFullYear()) * 12 +
                    (now.getMonth() - date.getMonth());
                if (monthDiff < 4) include = true;
            }

            if (include) {
                if (!categoryTotals[t.category]) {
                    categoryTotals[t.category] = 0;
                }
                categoryTotals[t.category] += t.amount;
            }
        });

        return Object.entries(categoryTotals)
            .map(([category, amount]) => ({
                category,
                amount,
                label: CATEGORY_LABELS[category] || category,
            }))
            .sort((a, b) => b.amount - a.amount);
    }, [transactions, viewMode]);

    return (
        <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    지출 분석
                </CardTitle>
                <div className="flex items-center gap-2">
                    {/* View Mode Tabs */}
                    <Tabs
                        value={viewMode}
                        onValueChange={(v) => setViewMode(v as ViewMode)}
                    >
                        <TabsList className="h-8">
                            <TabsTrigger value="daily" className="text-xs h-7">
                                일간
                            </TabsTrigger>
                            <TabsTrigger value="weekly" className="text-xs h-7">
                                주간
                            </TabsTrigger>
                            <TabsTrigger
                                value="monthly"
                                className="text-xs h-7"
                            >
                                월간
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>

                    {/* Chart Type Toggle */}
                    <div className="flex items-center border rounded-md bg-muted p-0.5 h-8">
                        <Button
                            variant={
                                chartType === "trend" ? "secondary" : "ghost"
                            }
                            size="sm"
                            className={`h-7 px-2 ${
                                chartType === "trend"
                                    ? "shadow-sm bg-background"
                                    : ""
                            }`}
                            onClick={() => setChartType("trend")}
                        >
                            <BarChart3 className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={
                                chartType === "category" ? "secondary" : "ghost"
                            }
                            size="sm"
                            className={`h-7 px-2 ${
                                chartType === "category"
                                    ? "shadow-sm bg-background"
                                    : ""
                            }`}
                            onClick={() => setChartType("category")}
                        >
                            <PieChart className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {chartType === "trend" ? (
                    <SpendingChart data={trendData} title="" type="bar" />
                ) : (
                    <CategoryAnalysis data={categoryData} title="" />
                )}
            </CardContent>
        </Card>
    );
}
