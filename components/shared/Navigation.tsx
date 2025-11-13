"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Receipt, Sparkles, Target, User, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

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
  const router = useRouter();
  const supabase = createClient();
  
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || null);
      }
    };
    getUser();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const getUserInitial = () => {
    if (userEmail) {
      return userEmail.charAt(0).toUpperCase();
    }
    return "U";
  };

  return (
    <>
      {/* Mobile Top Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm dark:bg-slate-800 dark:border-slate-700">
        <div className="flex h-14 items-center justify-between px-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-xl">🍅</span>
            <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
              소비 코치
            </span>
          </Link>
          
          {/* Theme Toggle and Profile */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            
            {/* Profile Button with Menu */}
            <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-md active:scale-95 transition-transform"
            >
              <span className="text-xs font-bold">{getUserInitial()}</span>
            </button>

            {/* Dropdown Menu */}
            {showProfileMenu && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowProfileMenu(false)}
                />
                
                {/* Menu */}
                <div className="absolute right-0 top-12 z-50 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden dark:bg-slate-800 dark:border-slate-700">
                  <div className="p-4 border-b border-slate-200 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/30 dark:to-purple-900/30 dark:border-slate-700">
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">로그인 계정</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {userEmail || "사용자"}
                    </p>
                  </div>
                  
                  <div className="p-2">
                    <Button
                      onClick={handleLogout}
                      variant="ghost"
                      className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      로그아웃
                    </Button>
                  </div>
                </div>
              </>
            )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation (Fixed) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-lg pb-safe dark:bg-slate-800 dark:border-slate-700">
        <div className="flex items-center justify-around">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 py-2 px-3 min-h-[68px] flex-1 active:bg-slate-50 dark:active:bg-slate-700 transition-all relative",
                  isActive && "text-violet-600"
                )}
              >
                {isActive && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-violet-600 rounded-full" />
                )}
                <Icon 
                  className={cn(
                    "h-6 w-6 transition-transform",
                    isActive ? "stroke-[2.5] scale-110" : "stroke-[2] text-slate-500 dark:text-slate-400"
                  )} 
                />
                <span className={cn(
                  "text-[10px] font-medium transition-all",
                  isActive ? "font-bold text-violet-600" : "text-slate-600 dark:text-slate-400"
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

