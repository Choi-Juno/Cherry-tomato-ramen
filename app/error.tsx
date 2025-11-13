"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-6">
          <span className="text-6xl">⚠️</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          문제가 발생했습니다
        </h2>
        <p className="text-slate-600 mb-6">
          일시적인 오류가 발생했습니다. 다시 시도해주세요.
        </p>
        <div className="space-y-3">
          <Button
            onClick={reset}
            className="w-full h-12 bg-gradient-to-r from-violet-500 to-purple-600"
          >
            다시 시도
          </Button>
          <Button
            variant="outline"
            onClick={() => (window.location.href = "/dashboard")}
            className="w-full h-12"
          >
            대시보드로 돌아가기
          </Button>
        </div>
      </div>
    </div>
  );
}

