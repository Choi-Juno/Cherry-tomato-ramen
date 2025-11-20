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

export function SpendingOverview({ transactions }: SpendingOverviewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("weekly");
  const [chartType, setChartType] = useState<ChartType>("trend");

  // Filter transactions based on viewMode range (optional, currently using all transactions for simple aggregation)
  // For a real app, you might want to filter by selected month/year range.
  
  // 1. Aggregate for Trend Chart
  const trendData = useMemo(() => {
    const dataMap: Record<string, number> = {};
    const now = new Date();
    
    transactions.forEach((t) => {
      const date = new Date(t.date);
      let key = "";
      let label = "";

      if (viewMode === "daily") {
        // Last 30 days
        const diffTime = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays <= 30) {
          key = t.date;
          label = `${date.getMonth() + 1}/${date.getDate()}`;
        }
      } else if (viewMode === "weekly") {
        // Last 12 weeks
        const diffTime = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const weekNum = Math.floor(diffDays / 7);
        if (weekNum <= 12) {
          // Calculate start of week
          const startOfWeek = new Date(date);
          startOfWeek.setDate(date.getDate() - date.getDay()); 
          key = startOfWeek.toISOString().split("T")[0];
          label = weekNum === 0 ? "이번 주" : `${weekNum}주 전`;
        }
      } else if (viewMode === "monthly") {
        // Last 12 months
        const monthDiff = (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth());
        if (monthDiff <= 12) {
          key = t.date.slice(0, 7); // YYYY-MM
          label = `${date.getMonth() + 1}월`;
        }
      }

      if (key) {
        dataMap[key] = (dataMap[key] || 0) + t.amount;
      }
    });

    // Convert map to array and sort
    return Object.entries(dataMap)
      .map(([date, amount]) => ({
        date, // used for sorting
        amount,
        label: viewMode === "daily" ? date.slice(5) : (viewMode === "weekly" ? undefined : `${parseInt(date.slice(5,7))}월`), // Fallback label
        // Real label needs to be preserved
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(item => ({
        ...item,
        label: viewMode === "weekly" ? getWeekLabel(item.date) : item.label
      }));
  }, [transactions, viewMode]);

  function getWeekLabel(dateStr: string) {
    const now = new Date();
    const date = new Date(dateStr);
    const diffTime = now.getTime() - date.getTime();
    const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
    if (diffWeeks === 0) return "이번 주";
    return `${diffWeeks}주 전`;
  }

  // 2. Aggregate for Category Chart
  const categoryData = useMemo(() => {
    const categoryTotals: Record<string, number> = {};

    // Filter transactions based on viewMode range same as above
    const now = new Date();

    transactions.forEach((t) => {
      const date = new Date(t.date);
      let include = false;

      if (viewMode === "daily") {
        const diffTime = now.getTime() - date.getTime();
        if (Math.floor(diffTime / (1000 * 60 * 60 * 24)) <= 30) include = true;
      } else if (viewMode === "weekly") {
        const diffTime = now.getTime() - date.getTime();
        if (Math.floor(diffTime / (1000 * 60 * 60 * 24)) <= 90) include = true; // approx 12 weeks
      } else {
        const monthDiff = (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth());
        if (monthDiff <= 12) include = true;
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
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
            <TabsList className="h-8">
              <TabsTrigger value="daily" className="text-xs h-7">일간</TabsTrigger>
              <TabsTrigger value="weekly" className="text-xs h-7">주간</TabsTrigger>
              <TabsTrigger value="monthly" className="text-xs h-7">월간</TabsTrigger>
            </TabsList>
          </Tabs>
          
          {/* Chart Type Toggle */}
          <div className="flex items-center border rounded-md bg-slate-100 dark:bg-slate-800 p-0.5 h-8">
            <Button
              variant={chartType === "trend" ? "secondary" : "ghost"}
              size="sm"
              className={`h-7 px-2 ${chartType === "trend" ? "shadow-sm bg-white dark:bg-slate-700" : ""}`}
              onClick={() => setChartType("trend")}
            >
              <BarChart3 className="h-4 w-4" />
            </Button>
            <Button
              variant={chartType === "category" ? "secondary" : "ghost"}
              size="sm"
              className={`h-7 px-2 ${chartType === "category" ? "shadow-sm bg-white dark:bg-slate-700" : ""}`}
              onClick={() => setChartType("category")}
            >
              <PieChart className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {chartType === "trend" ? (
          <SpendingChart
            data={trendData}
            title=""
            type={viewMode === "daily" ? "line" : "bar"}
          />
        ) : (
          <CategoryAnalysis
            data={categoryData}
            title=""
          />
        )}
      </CardContent>
    </Card>
  );
}

