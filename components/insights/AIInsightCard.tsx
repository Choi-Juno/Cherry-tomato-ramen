"use client";

import { AlertTriangle, TrendingUp, TrendingDown, Lightbulb, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AIInsight, InsightType, InsightSeverity } from "@/types/insight";
import { formatCurrency, cn } from "@/lib/utils";

interface AIInsightCardProps {
  insight: AIInsight;
}

const INSIGHT_CONFIG: Record<
  InsightType,
  { icon: any; color: string; bgColor: string }
> = {
  overspending: {
    icon: AlertTriangle,
    color: "text-red-600",
    bgColor: "bg-red-50",
  },
  trend_increase: {
    icon: TrendingUp,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
  },
  trend_decrease: {
    icon: TrendingDown,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
  },
  savings_opportunity: {
    icon: Lightbulb,
    color: "text-violet-600",
    bgColor: "bg-violet-50",
  },
  category_warning: {
    icon: AlertTriangle,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
  },
  spending_persona: {
    icon: Info,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
};

const SEVERITY_VARIANTS: Record<InsightSeverity, "default" | "warning" | "destructive"> = {
  info: "default",
  warning: "warning",
  critical: "destructive",
};

export function AIInsightCard({ insight }: AIInsightCardProps) {
  const config = INSIGHT_CONFIG[insight.type];
  const Icon = config.icon;

  return (
    <Card className="active:shadow-md md:hover:shadow-md transition-shadow">
      <CardContent className="p-3 md:p-4">
        <div className="flex items-start gap-2 md:gap-3">
          {/* Icon */}
          <div className={cn("rounded-lg p-1.5 md:p-2 flex-shrink-0", config.bgColor)}>
            <Icon className={cn("h-4 w-4 md:h-5 md:w-5", config.color)} />
          </div>

          {/* Content */}
          <div className="flex-1 space-y-1.5 md:space-y-2 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-sm md:text-base text-slate-900 leading-tight">
                {insight.title}
              </h3>
              <Badge variant={SEVERITY_VARIANTS[insight.severity]} className="shrink-0 text-[10px] md:text-xs">
                {insight.severity === "info" && "정보"}
                {insight.severity === "warning" && "주의"}
                {insight.severity === "critical" && "경고"}
              </Badge>
            </div>

            <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
              {insight.description}
            </p>

            {insight.suggested_action && (
              <div className="rounded-lg bg-slate-50 p-2 md:p-3">
                <p className="text-xs md:text-sm text-slate-700 leading-relaxed">
                  💡 <span className="font-medium">제안:</span>{" "}
                  {insight.suggested_action}
                </p>
              </div>
            )}

            {insight.potential_savings && insight.potential_savings > 0 && (
              <div className="flex items-center gap-2 text-xs md:text-sm">
                <span className="text-slate-600">절약 가능 금액:</span>
                <span className="font-bold text-emerald-600">
                  {formatCurrency(insight.potential_savings)}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

