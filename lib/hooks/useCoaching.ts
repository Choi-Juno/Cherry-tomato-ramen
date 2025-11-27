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

      let coachingSuccess = false;
      let peerSuccess = false;

      // Handle coaching message
      if (coachingRes.status === "fulfilled") {
        if (coachingRes.value.ok) {
          try {
            const data = await coachingRes.value.json();
            if (data.success && data.message) {
              setCoachingMessage(data.message);
              coachingSuccess = true;
            }
          } catch (parseError) {
            console.error("Failed to parse coaching response:", parseError);
          }
        } else {
          console.error("Coaching API error:", coachingRes.value.status);
        }
      } else {
        console.error("Coaching fetch failed:", coachingRes.reason);
      }

      // Handle peer comparison
      if (peerRes.status === "fulfilled") {
        if (peerRes.value.ok) {
          try {
            const data = await peerRes.value.json();
            if (data.success && data.comparison) {
              setPeerComparison(data.comparison);
              peerSuccess = true;
            }
          } catch (parseError) {
            console.error("Failed to parse peer comparison response:", parseError);
          }
        } else {
          // Check if it's a birth year not set error
          try {
            const errorData = await peerRes.value.json();
            if (errorData.message) {
              console.log("Peer comparison info:", errorData.message);
            }
          } catch {
            console.error("Peer comparison API error:", peerRes.value.status);
          }
        }
      } else {
        console.error("Peer comparison fetch failed:", peerRes.reason);
      }

      // Only set error if both failed
      if (!coachingSuccess && !peerSuccess) {
        // Check if ML service is running
        try {
          const healthRes = await fetch(
            process.env.NEXT_PUBLIC_ML_API_URL || "http://localhost:8000" + "/health"
          );
          if (!healthRes.ok) {
            setError("ML 서비스가 실행되지 않았습니다. 터미널에서 ML 서비스를 시작해주세요.");
          }
        } catch {
          setError("ML 서비스에 연결할 수 없습니다. 터미널에서 ML 서비스를 시작해주세요.");
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

