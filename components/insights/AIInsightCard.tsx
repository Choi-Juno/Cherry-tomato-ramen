"use client";

import { AlertTriangle, TrendingUp, TrendingDown, Lightbulb, Info, LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AIInsight, InsightType, InsightSeverity } from "@/types/insight";
import { formatCurrency, cn } from "@/lib/utils";

interface AIInsightCardProps {
  insight: AIInsight;
}

const INSIGHT_CONFIG: Record<
  InsightType,
  { icon: LucideIcon; color: string; bgColor: string }
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
    <Card className="active:scale-[0.98] transition-transform shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={cn("rounded-xl p-2.5 flex-shrink-0 shadow-sm", config.bgColor)}>
            <Icon className={cn("h-5 w-5", config.color)} />
          </div>

          {/* Content */}
          <div className="flex-1 space-y-2 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-bold text-sm text-slate-900 leading-tight">
                {insight.title}
              </h3>
              <Badge variant={SEVERITY_VARIANTS[insight.severity]} className="shrink-0 text-[9px] px-2 py-0.5">
                {insight.severity === "info" && "정보"}
                {insight.severity === "warning" && "주의"}
                {insight.severity === "critical" && "경고"}
              </Badge>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {insight.description}
            </p>

            {insight.suggested_action && (
              <div className="rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 p-3 border border-violet-100">
                <p className="text-xs text-slate-700 leading-relaxed">
                  <span className="font-bold">💡 AI 제안</span>
                  <br />
                  {insight.suggested_action}
                </p>
              </div>
            )}

            {insight.potential_savings && insight.potential_savings > 0 && (
              <div className="flex items-center gap-2 text-xs bg-emerald-50 rounded-lg px-3 py-2">
                <span className="text-emerald-700 font-medium">💰 절약 가능</span>
                <span className="font-bold text-emerald-600 text-sm">
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

