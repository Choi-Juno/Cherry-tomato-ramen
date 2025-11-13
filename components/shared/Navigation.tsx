"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Receipt, Lightbulb, DollarSign, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    label: "대시보드",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "내역",
    href: "/transactions",
    icon: Receipt,
  },
  {
    label: "인사이트",
    href: "/insights",
    icon: Lightbulb,
  },
  {
    label: "예산",
    href: "/budget",
    icon: DollarSign,
  },
  {
    label: "설정",
    href: "/settings",
    icon: Settings,
  },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Top Navigation */}
      <nav className="hidden md:block border-b border-slate-200 bg-white sticky top-0 z-30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/dashboard" className="flex items-center gap-2">
                <span className="text-2xl">🍅</span>
                <span className="text-xl font-bold text-slate-900">
                  소비 코치
                </span>
              </Link>

              <div className="flex items-center gap-1">
                {NAV_ITEMS.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-violet-50 text-violet-700"
                          : "text-slate-700 hover:bg-slate-100"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-violet-700 hover:bg-violet-200 transition-colors">
                <span className="text-sm font-semibold">김</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Top Header */}
      <header className="md:hidden sticky top-0 z-30 bg-white border-b border-slate-200">
        <div className="flex h-14 items-center justify-between px-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-xl">🍅</span>
            <span className="text-lg font-bold text-slate-900">
              소비 코치
            </span>
          </Link>
          <button className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-100 text-violet-700 active:bg-violet-200 transition-colors">
            <span className="text-xs font-semibold">김</span>
          </button>
        </div>
      </header>

      {/* Mobile Bottom Navigation (Fixed) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 safe-area-inset-bottom">
        <div className="flex items-center justify-around">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 py-2 px-3 min-h-[64px] flex-1 active:bg-slate-50 transition-colors",
                  isActive
                    ? "text-violet-600"
                    : "text-slate-500"
                )}
              >
                <Icon className={cn(
                  "h-6 w-6",
                  isActive ? "stroke-[2.5]" : "stroke-[2]"
                )} />
                <span className={cn(
                  "text-[11px] font-medium",
                  isActive ? "font-semibold" : ""
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

