"use client";

import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface FABProps {
  onClick: () => void;
  className?: string;
}

export function FAB({ onClick, className }: FABProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "fixed right-5 bottom-[92px] z-50",
        "h-16 w-16 rounded-full",
        "bg-gradient-to-br from-violet-500 to-purple-600",
        "text-white shadow-2xl",
        "flex items-center justify-center",
        "active:scale-90 transition-transform duration-150",
        "before:absolute before:inset-0 before:rounded-full before:bg-violet-400 before:animate-ping before:opacity-20",
        className
      )}
      aria-label="지출 추가"
    >
      <Plus className="h-8 w-8 stroke-[3]" />
    </button>
  );
}

