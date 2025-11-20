"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Budget, CreateBudgetInput } from "@/types/budget";

export function useBudget(month?: string) {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const supabase = createClient();

  // Default to current month if not specified
  const targetMonth =
    month || new Date().toISOString().slice(0, 7); // YYYY-MM

  const fetchBudgets = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("budgets")
        .select("*")
        .eq("user_id", user.id)
        .eq("month", targetMonth);

      if (error) throw error;
      setBudgets(data as Budget[]);
    } catch (err) {
      console.error("Error fetching budgets:", err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [targetMonth, supabase]);

  const totalBudget = budgets.reduce((sum, item) => sum + item.amount, 0);

  const setBudget = async (input: CreateBudgetInput) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("budgets")
        .upsert(
          {
            user_id: user.id,
            ...input,
          },
          {
            onConflict: "user_id,category,month",
          }
        )
        .select()
        .single();

      if (error) throw error;

      setBudgets((prev) => {
        const existing = prev.find((b) => b.category === input.category);
        if (existing) {
          return prev.map((b) =>
            b.category === input.category ? (data as Budget) : b
          );
        }
        return [...prev, data as Budget];
      });

      return data as Budget;
    } catch (err) {
      throw err;
    }
  };

  const deleteBudget = async (id: string) => {
    try {
      const { error } = await supabase.from("budgets").delete().eq("id", id);

      if (error) throw error;
      setBudgets((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  return {
    budgets,
    totalBudget,
    loading,
    error,
    refetch: fetchBudgets,
    setBudget,
    deleteBudget,
  };
}

