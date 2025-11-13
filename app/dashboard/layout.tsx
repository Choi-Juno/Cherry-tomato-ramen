"use client";

import { useState } from "react";
import { Navigation } from "@/components/shared/Navigation";
import { FAB } from "@/components/shared/FAB";
import { ExpenseInputModal } from "@/components/transactions/ExpenseInputModal";
import { TransactionsProvider, useTransactionsStore } from "@/lib/store/transactions-store";
import { ToastProvider, useToast } from "@/components/ui/toast";
import { CreateTransactionInput } from "@/types/transaction";

function DashboardContent({ children }: { children: React.ReactNode }) {
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const { addTransaction } = useTransactionsStore();
  const { addToast } = useToast();

  const handleExpenseSubmit = async (data: CreateTransactionInput) => {
    try {
      await addTransaction(data);
      setIsExpenseModalOpen(false);
      
      addToast({
        title: "지출 추가 완료!",
        description: `${data.description} - ${data.amount.toLocaleString()}원`,
        variant: "success",
        duration: 3000,
      });
    } catch (error) {
      addToast({
        title: "오류 발생",
        description: "지출 추가 중 문제가 발생했습니다.",
        variant: "error",
        duration: 4000,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <Navigation />
      <main className="px-4 py-4 pb-24">
        {children}
      </main>
      <FAB onClick={() => setIsExpenseModalOpen(true)} />
      <ExpenseInputModal
        open={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onSubmit={handleExpenseSubmit}
      />
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <TransactionsProvider>
        <DashboardContent>{children}</DashboardContent>
      </TransactionsProvider>
    </ToastProvider>
  );
}

