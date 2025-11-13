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

// Mock User ID (인증 구현 전까지 사용)
// scripts/seed-test-user.ts에서 생성된 실제 사용자 ID
const MOCK_USER_ID = "8140d257-f25a-48d0-a38a-47d90850689a";

export function TransactionsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  // 초기 데이터 로드
  const refreshTransactions = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", MOCK_USER_ID)
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
  }, [supabase]);

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    refreshTransactions();
  }, [refreshTransactions]);

  const addTransaction = useCallback(
    async (input: CreateTransactionInput) => {
      try {
        setIsLoading(true);

        const newTransaction = {
          user_id: MOCK_USER_ID,
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
    [supabase]
  );

  const updateTransaction = useCallback(
    async (id: string, data: Partial<Transaction>) => {
      try {
        setIsLoading(true);

        const { error } = await supabase
          .from("transactions")
          .update(data)
          .eq("id", id)
          .eq("user_id", MOCK_USER_ID);

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
    [supabase]
  );

  const deleteTransaction = useCallback(
    async (id: string) => {
      try {
        setIsLoading(true);

        const { error } = await supabase
          .from("transactions")
          .delete()
          .eq("id", id)
          .eq("user_id", MOCK_USER_ID);

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
    [supabase]
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

