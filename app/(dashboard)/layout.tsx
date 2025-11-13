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

  const handleExpenseSubmit = async (data: any) => {
    // TODO: Implement actual API call
    console.log("Submitting expense:", data);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      <main className="mx-auto max-w-7xl px-4 py-4 pb-20 md:px-6 md:py-8 md:pb-8 lg:px-8">
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

