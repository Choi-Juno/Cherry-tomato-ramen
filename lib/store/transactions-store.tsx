"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { Transaction, CreateTransactionInput } from "@/types/transaction";
import { createClient } from "@/lib/supabase/client";

interface TransactionsContextType {
  transactions: Transaction[];
  addTransaction: (input: CreateTransactionInput) => Promise<void>;
  updateTransaction: (id: string, data: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  isLoading: boolean;
  refreshTransactions: () => Promise<void>;
}

const TransactionsContext = createContext<TransactionsContextType | undefined>(
  undefined
);

export function TransactionsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const supabase = createClient();

  // 인증된 사용자 ID 가져오기
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getUser();
  }, [supabase]);

  // 초기 데이터 로드
  const refreshTransactions = useCallback(async () => {
    if (!userId) return;
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", userId)
        .neq("is_deleted", true)
        .order("date", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Failed to fetch transactions:", error);
        throw error;
      }

      setTransactions(data || []);
    } catch (error) {
      console.error("Error loading transactions:", error);
    } finally {
      setIsLoading(false);
    }
  }, [userId, supabase]);

  // userId가 설정되면 데이터 로드
  useEffect(() => {
    if (userId) {
      refreshTransactions();
    }
  }, [userId, refreshTransactions]);

  const addTransaction = useCallback(
    async (input: CreateTransactionInput) => {
      if (!userId) {
        throw new Error("User not authenticated");
      }
      
      try {
        setIsLoading(true);

        const newTransaction = {
          user_id: userId,
          ...input,
        };

        const { data, error } = await supabase
          .from("transactions")
          .insert([newTransaction])
          .select()
          .single();

        if (error) {
          console.error("Failed to add transaction:", error);
          throw error;
        }

        // 로컬 상태 업데이트
        setTransactions((prev) => [data, ...prev]);
      } catch (error) {
        console.error("Error adding transaction:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [userId, supabase]
  );

  const updateTransaction = useCallback(
    async (id: string, data: Partial<Transaction>) => {
      if (!userId) {
        throw new Error("User not authenticated");
      }
      
      try {
        setIsLoading(true);

        const { error } = await supabase
          .from("transactions")
          .update(data)
          .eq("id", id)
          .eq("user_id", userId);

        if (error) {
          console.error("Failed to update transaction:", error);
          throw error;
        }

        // 로컬 상태 업데이트
        setTransactions((prev) =>
          prev.map((t) =>
            t.id === id
              ? { ...t, ...data, updated_at: new Date().toISOString() }
              : t
          )
        );
      } catch (error) {
        console.error("Error updating transaction:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [userId, supabase]
  );

  const deleteTransaction = useCallback(
    async (id: string) => {
      if (!userId) {
        throw new Error("User not authenticated");
      }
      
      try {
        setIsLoading(true);

        const { error } = await supabase
          .from("transactions")
          .update({ is_deleted: true })
          .eq("id", id)
          .eq("user_id", userId);

        if (error) {
          console.error("Failed to delete transaction:", error);
          throw error;
        }

        // 로컬 상태 업데이트
        setTransactions((prev) => prev.filter((t) => t.id !== id));
      } catch (error) {
        console.error("Error deleting transaction:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [userId, supabase]
  );

  return (
    <TransactionsContext.Provider
      value={{
        transactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        isLoading,
        refreshTransactions,
      }}
    >
      {children}
    </TransactionsContext.Provider>
  );
}

export function useTransactionsStore() {
  const context = useContext(TransactionsContext);
  if (context === undefined) {
    throw new Error(
      "useTransactionsStore must be used within a TransactionsProvider"
    );
  }
  return context;
}

