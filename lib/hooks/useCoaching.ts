"use client";

import { useState, useEffect, useCallback } from "react";
import { CoachingMessage, PeerComparisonMessage } from "@/types/coaching";

interface UseCoachingResult {
  coachingMessage: CoachingMessage | null;
  peerComparison: PeerComparisonMessage | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  acceptChallenge: (messageId: string) => Promise<void>;
}

export function useCoaching(): UseCoachingResult {
  const [coachingMessage, setCoachingMessage] =
    useState<CoachingMessage | null>(null);
  const [peerComparison, setPeerComparison] =
    useState<PeerComparisonMessage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCoachingData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch both in parallel
      const [coachingRes, peerRes] = await Promise.allSettled([
        fetch("/api/coaching/message", { method: "POST" }),
        fetch("/api/coaching/peer-comparison", { method: "POST" }),
      ]);

      // Handle coaching message
      if (coachingRes.status === "fulfilled" && coachingRes.value.ok) {
        const data = await coachingRes.value.json();
        if (data.success && data.message) {
          setCoachingMessage(data.message);
        }
      }

      // Handle peer comparison
      if (peerRes.status === "fulfilled" && peerRes.value.ok) {
        const data = await peerRes.value.json();
        if (data.success && data.comparison) {
          setPeerComparison(data.comparison);
        }
      }
    } catch (err) {
      setError("코칭 데이터를 불러오는데 실패했습니다.");
      console.error("Coaching fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const acceptChallenge = useCallback(async (messageId: string) => {
    try {
      await fetch("/api/coaching/accept-challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message_id: messageId }),
      });
    } catch (err) {
      console.error("Accept challenge error:", err);
    }
  }, []);

  useEffect(() => {
    fetchCoachingData();
  }, [fetchCoachingData]);

  return {
    coachingMessage,
    peerComparison,
    isLoading,
    error,
    refetch: fetchCoachingData,
    acceptChallenge,
  };
}

