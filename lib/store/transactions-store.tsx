"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { Transaction, CreateTransactionInput } from "@/types/transaction";

interface TransactionsContextType {
  transactions: Transaction[];
  addTransaction: (input: CreateTransactionInput) => Promise<void>;
  updateTransaction: (id: string, data: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  isLoading: boolean;
}

const TransactionsContext = createContext<TransactionsContextType | undefined>(
  undefined
);

// Mock 초기 데이터 - 최근 1개월
const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: "1",
    user_id: "mock-user",
    amount: 5500,
    description: "스타벅스",
    category: "food",
    payment_method: "card",
    merchant: "스타벅스",
    date: new Date().toISOString().split("T")[0],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    user_id: "mock-user",
    amount: 12000,
    description: "택시",
    category: "transport",
    payment_method: "card",
    merchant: "카카오T",
    date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "3",
    user_id: "mock-user",
    amount: 9000,
    description: "점심 식사",
    category: "food",
    payment_method: "card",
    merchant: "한식당",
    date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "4",
    user_id: "mock-user",
    amount: 15000,
    description: "영화 관람",
    category: "entertainment",
    payment_method: "card",
    merchant: "CGV",
    date: new Date(Date.now() - 172800000).toISOString().split("T")[0],
    created_at: new Date(Date.now() - 172800000).toISOString(),
    updated_at: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: "5",
    user_id: "mock-user",
    amount: 8500,
    description: "편의점",
    category: "food",
    payment_method: "cash",
    merchant: "GS25",
    date: new Date(Date.now() - 259200000).toISOString().split("T")[0],
    created_at: new Date(Date.now() - 259200000).toISOString(),
    updated_at: new Date(Date.now() - 259200000).toISOString(),
  },
];

export function TransactionsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [transactions, setTransactions] =
    useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [isLoading, setIsLoading] = useState(false);

  const addTransaction = useCallback(
    async (input: CreateTransactionInput) => {
      setIsLoading(true);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      const newTransaction: Transaction = {
        id: `mock-${Date.now()}`,
        user_id: "mock-user",
        ...input,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setTransactions((prev) => [newTransaction, ...prev]);
      setIsLoading(false);
    },
    []
  );

  const updateTransaction = useCallback(
    async (id: string, data: Partial<Transaction>) => {
      setIsLoading(true);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      setTransactions((prev) =>
        prev.map((t) =>
          t.id === id
            ? { ...t, ...data, updated_at: new Date().toISOString() }
            : t
        )
      );

      setIsLoading(false);
    },
    []
  );

  const deleteTransaction = useCallback(async (id: string) => {
    setIsLoading(true);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    setTransactions((prev) => prev.filter((t) => t.id !== id));
    setIsLoading(false);
  }, []);

  return (
    <TransactionsContext.Provider
      value={{
        transactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        isLoading,
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

