"use client";

import { useCoaching } from "@/lib/hooks/useCoaching";
import { CoachingMessageCard } from "@/components/coaching/CoachingMessageCard";
import { PeerComparisonCard } from "@/components/coaching/PeerComparisonCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, Sparkles } from "lucide-react";

export function AICoachingSection() {
  const {
    coachingMessage,
    peerComparison,
    isLoading,
    error,
    refetch,
    acceptChallenge,
  } = useCoaching();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-violet-600" />
            AI 코칭
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-violet-600" />
            AI 코칭
          </h2>
        </div>
        <Card className="bg-amber-50 dark:bg-amber-950/30">
          <CardContent className="pt-6">
            <p className="text-sm text-amber-700 dark:text-amber-400">{error}</p>
            <Button variant="outline" size="sm" onClick={refetch} className="mt-3">
              <RefreshCw className="h-4 w-4 mr-2" />
              다시 시도
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If no data at all, show a placeholder
  if (!coachingMessage && !peerComparison) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-violet-600" />
            AI 코칭
          </h2>
        </div>
        <Card className="bg-slate-50 dark:bg-slate-900/50">
          <CardContent className="pt-6 text-center">
            <Sparkles className="h-8 w-8 text-violet-600 mx-auto mb-3" />
            <p className="text-sm text-slate-600 dark:text-slate-400">
              지출 데이터가 쌓이면 맞춤형 AI 코칭을 제공해 드릴게요.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-violet-600" />
          AI 코칭
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={refetch}
          className="text-slate-500 hover:text-slate-700"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {coachingMessage && (
          <CoachingMessageCard
            message={coachingMessage}
            onAcceptChallenge={acceptChallenge}
          />
        )}

        {peerComparison && <PeerComparisonCard comparison={peerComparison} />}
      </div>
    </div>
  );
}

