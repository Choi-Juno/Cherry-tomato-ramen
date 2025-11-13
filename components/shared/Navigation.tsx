"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Receipt, Sparkles, Target, User } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    label: "홈",
    href: "/dashboard",
    icon: Home,
  },
  {
    label: "내역",
    href: "/dashboard/transactions",
    icon: Receipt,
  },
  {
    label: "인사이트",
    href: "/dashboard/insights",
    icon: Sparkles,
  },
  {
    label: "예산",
    href: "/dashboard/budget",
    icon: Target,
  },
  {
    label: "MY",
    href: "/dashboard/settings",
    icon: User,
  },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Top Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="flex h-14 items-center justify-between px-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-xl">🍅</span>
            <span className="text-lg font-bold text-slate-900">
              소비 코치
            </span>
          </Link>
          <button className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-md active:scale-95 transition-transform">
            <span className="text-xs font-bold">김</span>
          </button>
        </div>
      </header>

      {/* Mobile Bottom Navigation (Fixed) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-lg pb-safe">
        <div className="flex items-center justify-around">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 py-2 px-3 min-h-[68px] flex-1 active:bg-slate-50 transition-all relative",
                  isActive && "text-violet-600"
                )}
              >
                {isActive && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-violet-600 rounded-full" />
                )}
                <Icon 
                  className={cn(
                    "h-6 w-6 transition-transform",
                    isActive ? "stroke-[2.5] scale-110" : "stroke-[2] text-slate-500"
                  )} 
                />
                <span className={cn(
                  "text-[10px] font-medium transition-all",
                  isActive ? "font-bold text-violet-600" : "text-slate-600"
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

