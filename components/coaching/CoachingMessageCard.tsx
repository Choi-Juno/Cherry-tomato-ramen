"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CoachingMessage } from "@/types/coaching";
import {
  Lightbulb,
  TrendingUp,
  Target,
  ChevronRight,
  Sparkles,
} from "lucide-react";

interface CoachingMessageCardProps {
  message: CoachingMessage;
  onAcceptChallenge?: (messageId: string) => void;
}

const SEVERITY_STYLES = {
  info: {
    bg: "bg-blue-50 dark:bg-blue-950/30",
    icon: "text-blue-600 dark:text-blue-400",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  },
  warning: {
    bg: "bg-amber-50 dark:bg-amber-950/30",
    icon: "text-amber-600 dark:text-amber-400",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
  },
  success: {
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    icon: "text-emerald-600 dark:text-emerald-400",
    badge:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
  },
};

const CATEGORY_LABELS: Record<string, string> = {
  food: "식비",
  delivery: "배달",
  cafe: "카페",
  transport: "교통비",
  shopping: "쇼핑",
  entertainment: "문화/여가",
  education: "교육",
  health: "의료/건강",
  utilities: "공과금",
  other: "기타",
  general: "전체",
};

export function CoachingMessageCard({
  message,
  onAcceptChallenge,
}: CoachingMessageCardProps) {
  const [challengeAccepted, setChallengeAccepted] = useState(false);
  const styles = SEVERITY_STYLES[message.severity];

  const handleAcceptChallenge = () => {
    setChallengeAccepted(true);
    onAcceptChallenge?.(message.id);
  };

  const getIcon = () => {
    switch (message.pattern_type) {
      case "spending_increase":
        return <TrendingUp className={`h-5 w-5 ${styles.icon}`} />;
      case "positive_reinforcement":
        return <Sparkles className={`h-5 w-5 ${styles.icon}`} />;
      default:
        return <Lightbulb className={`h-5 w-5 ${styles.icon}`} />;
    }
  };

  return (
    <Card className={`${styles.bg} transition-all hover:shadow-md`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${styles.badge}`}>{getIcon()}</div>
            <div>
              <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
                {message.title}
              </CardTitle>
              {message.category !== "general" && (
                <Badge variant="secondary" className="mt-1 text-xs">
                  {CATEGORY_LABELS[message.category] || message.category}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          {message.body}
        </p>

        {message.suggested_challenge && !challengeAccepted && (
          <div className="pt-2">
            <Button
              onClick={handleAcceptChallenge}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white"
            >
              <Target className="h-4 w-4 mr-2" />
              챌린지 시작하기
              <ChevronRight className="h-4 w-4 ml-auto" />
            </Button>
          </div>
        )}

        {challengeAccepted && (
          <div className="flex items-center gap-2 p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
            <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
              챌린지를 시작했어요! 화이팅! 💪
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

