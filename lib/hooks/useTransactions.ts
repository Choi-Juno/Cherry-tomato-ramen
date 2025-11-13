"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Transaction, CreateTransactionInput } from "@/types/transaction";

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const supabase = createClient();

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .order("date", { ascending: false });

      if (error) throw error;
      setTransactions(data as Transaction[]);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const addTransaction = async (input: CreateTransactionInput) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("transactions")
        .insert({
          user_id: user.id,
          ...input,
        })
        .select()
        .single();

      if (error) throw error;
      setTransactions((prev) => [data as Transaction, ...prev]);
      return data as Transaction;
    } catch (err) {
      throw err;
    }
  };

  const updateTransaction = async (id: string, updates: Partial<CreateTransactionInput>) => {
    try {
      const { data, error } = await supabase
        .from("transactions")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      setTransactions((prev) =>
        prev.map((t) => (t.id === id ? (data as Transaction) : t))
      );
      return data as Transaction;
    } catch (err) {
      throw err;
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return {
    transactions,
    loading,
    error,
    refetch: fetchTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  };
}

