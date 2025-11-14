"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { useTheme } from "next-themes";

interface SpendingDataPoint {
  date: string;
  amount: number;
  label?: string;
}

interface SpendingChartProps {
  data: SpendingDataPoint[];
  title?: string;
  type?: "line" | "bar";
}

// CustomTooltip 컴포넌트를 외부로 이동
function CustomTooltip({ active, payload }: TooltipProps<number, string>) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 shadow-sm">
        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
          {payload[0].payload.label || payload[0].payload.date}
        </p>
        <p className="text-sm text-violet-600 dark:text-violet-400 font-semibold">
          {formatCurrency(payload[0].value as number)}
        </p>
      </div>
    );
  }
  return null;
}

export function SpendingChart({
  data,
  title = "소비 추이",
  type = "line",
}: SpendingChartProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Dynamic colors based on theme
  const colors = {
    grid: isDark ? "#334155" : "#e2e8f0", // slate-700 : slate-200
    text: isDark ? "#e2e8f0" : "#1e293b", // slate-200 : slate-800
    axis: isDark ? "#64748b" : "#94a3b8", // slate-500 : slate-400
    primary: isDark ? "#8b5cf6" : "#7c3aed", // violet-500 : violet-600
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="dark:text-slate-100">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          {type === "line" ? (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12, fill: colors.text }}
                stroke={colors.axis}
              />
              <YAxis
                tick={{ fontSize: 12, fill: colors.text }}
                stroke={colors.axis}
                tickFormatter={(value) => `${Math.floor(value / 1000)}K`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="amount"
                stroke={colors.primary}
                strokeWidth={2}
                dot={{ fill: colors.primary, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          ) : (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12, fill: colors.text }}
                stroke={colors.axis}
              />
              <YAxis
                tick={{ fontSize: 12, fill: colors.text }}
                stroke={colors.axis}
                tickFormatter={(value) => `${Math.floor(value / 1000)}K`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="amount" fill={colors.primary} radius={[8, 8, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

