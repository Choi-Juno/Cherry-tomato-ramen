"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FABProps {
  onClick: () => void;
  className?: string;
}

export function FAB({ onClick, className }: FABProps) {
  return (
    <Button
      onClick={onClick}
      size="icon"
      className={cn(
        "fixed right-4 h-14 w-14 rounded-full shadow-lg active:shadow-xl transition-all z-50",
        "bottom-[88px]", // 하단 네비게이션(64px) + 여백(24px)
        "md:bottom-8 md:right-8",
        "active:scale-95",
        className
      )}
      aria-label="지출 추가"
    >
      <Plus className="h-7 w-7" />
    </Button>
  );
}

