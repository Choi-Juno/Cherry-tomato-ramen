"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Navigation } from "@/components/shared/Navigation";
import { FAB } from "@/components/shared/FAB";
import { ExpenseInputModal } from "@/components/transactions/ExpenseInputModal";
import { TransactionsProvider, useTransactionsStore } from "@/lib/store/transactions-store";
import { ToastProvider, useToast } from "@/components/ui/toast";
import { CreateTransactionInput } from "@/types/transaction";

function DashboardContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const supabase = createClient();
  
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const { addTransaction } = useTransactionsStore();
  const { addToast } = useToast();

  // 세션 확인
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push("/login");
      } else {
        setIsCheckingAuth(false);
      }
    };

    checkSession();

    // 세션 변경 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_OUT" || !session) {
          router.push("/login");
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  // 로딩 중
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🍅</div>
          <p className="text-lg font-semibold text-slate-700">로딩 중...</p>
        </div>
      </div>
    );
  }

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

