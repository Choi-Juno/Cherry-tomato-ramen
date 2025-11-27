"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { AIInsight } from "@/types/insight";

export function useInsights() {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Memoize supabase client to prevent infinite loops
  const supabase = useMemo(() => createClient(), []);

  const fetchInsights = useCallback(async () => {
    try {
      setLoading(true);
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from("ai_insights")
        .select("*")
        .or(`expires_at.is.null,expires_at.gt.${now}`)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      setInsights(data as AIInsight[]);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const generateInsights = async () => {
    try {
      const response = await fetch("/api/insights/generate", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to generate insights");
      }

      await fetchInsights();
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  return {
    insights,
    loading,
    error,
    refetch: fetchInsights,
    generateInsights,
  };
}

