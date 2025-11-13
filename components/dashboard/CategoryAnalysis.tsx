"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, TooltipProps } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

interface CategoryData {
  category: string;
  amount: number;
  label: string;
}

interface CategoryAnalysisProps {
  data: CategoryData[];
  title?: string;
}

interface CustomLabelProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
}

const COLORS = [
  "#7c3aed", // violet
  "#ec4899", // pink
  "#f59e0b", // amber
  "#10b981", // emerald
  "#3b82f6", // blue
  "#8b5cf6", // purple
  "#14b8a6", // teal
  "#64748b", // slate
];

// CustomTooltip을 외부로 이동 - 고차 함수로 변경
function createCategoryTooltip(total: number) {
  return function CategoryTooltip({ active, payload }: TooltipProps<number, string>) {
    if (active && payload && payload.length) {
      const percentage = ((payload[0].value as number / total) * 100).toFixed(1);
      return (
        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
          <p className="text-sm font-medium">{payload[0].payload.label}</p>
          <p className="text-sm text-violet-600 font-semibold">
            {formatCurrency(payload[0].value as number)}
          </p>
          <p className="text-xs text-slate-600">{percentage}%</p>
        </div>
      );
    }
    return null;
  };
}

// CustomLabel을 외부로 이동
function CategoryLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: CustomLabelProps) {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) return null; // Don't show label if less than 5%

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      className="text-xs font-semibold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

export function CategoryAnalysis({
  data,
  title = "카테고리별 지출",
}: CategoryAnalysisProps) {
  const total = data.reduce((sum, item) => sum + item.amount, 0);
  const CustomTooltip = createCategoryTooltip(total);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={CategoryLabel}
              outerRadius={100}
              fill="#8884d8"
              dataKey="amount"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={CustomTooltip} />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value, entry) => {
                const categoryData = entry.payload as unknown as CategoryData;
                return <span className="text-sm">{categoryData.label}</span>;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

