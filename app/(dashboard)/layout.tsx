"use client";

import { useState } from "react";
import { Navigation } from "@/components/shared/Navigation";
import { FAB } from "@/components/shared/FAB";
import { ExpenseInputModal } from "@/components/transactions/ExpenseInputModal";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  const handleExpenseSubmit = async (data: unknown) => {
    // TODO: Implement actual API call
    console.log("Submitting expense:", data);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
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

