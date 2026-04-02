"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, TrendingUp, ArrowLeftRight, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/providers/AppProvider";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, labelKey: "dashboard" as const },
  { href: "/gold-price", icon: TrendingUp, labelKey: "goldPrice" as const },
  { href: "/converter", icon: ArrowLeftRight, labelKey: "converter" as const },
];

export function Sidebar() {
  const pathname = usePathname();
  const { t } = useApp();

  return (
    <aside className="hidden md:flex flex-col w-56 shrink-0 border-r border-[var(--border-default)] bg-[var(--bg-sidebar)] pt-4">
      <nav className="flex flex-col gap-1 px-3">
        <div className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
          Menu
        </div>
        {navItems.map(({ href, icon: Icon, labelKey }) => {
          const isActive = pathname === href || (href === "/dashboard" && pathname === "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 cursor-pointer",
                isActive
                  ? "bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20"
                  : "text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)]"
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0", isActive && "text-[#F59E0B]")} />
              {t[labelKey]}
            </Link>
          );
        })}
      </nav>

      {/* Market status */}
      <div className="mt-auto mb-4 mx-3">
        <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[var(--text-muted)]">Thị trường</span>
            <div className="flex items-center gap-1">
              <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-[#10B981]" />
              <span className="text-xs text-[#10B981] font-medium">Mở cửa</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-[#F59E0B]" />
            <div>
              <div className="text-sm font-semibold font-mono text-[var(--text-primary)]">SJC</div>
              <div className="text-xs text-[var(--text-muted)] font-mono">120.5M VND</div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  const { t } = useApp();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--border-default)] bg-[var(--bg-primary)]/95 backdrop-blur-md">
      <div className="flex items-center justify-around py-2 px-4">
        {navItems.map(({ href, icon: Icon, labelKey }) => {
          const isActive = pathname === href || (href === "/dashboard" && pathname === "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition-all duration-200 cursor-pointer min-w-[60px]",
                isActive
                  ? "text-[#F59E0B]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{t[labelKey]}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
