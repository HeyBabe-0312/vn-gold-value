"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon, Globe, TrendingUp, TrendingDown, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/providers/AppProvider";
import { WORLD_GOLD_PRICE_USD, WORLD_GOLD_CHANGE_PERCENT } from "@/lib/mock-data";
import { cn, formatNumber } from "@/lib/utils";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

const CURRENCIES = ["VND", "USD"] as const;
const LANGUAGES = [
  { code: "vi", label: "Tiếng Việt", flag: "🇻🇳" },
  { code: "en", label: "English", flag: "🇺🇸" },
] as const;

export function Header() {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, currency, setCurrency, t } = useApp();
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    setMounted(true);
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const isUp = WORLD_GOLD_CHANGE_PERCENT >= 0;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--border-default)] bg-[var(--bg-primary)]/95 backdrop-blur-md">
      <div className="flex h-14 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F59E0B] shadow-sm">
            <span className="text-sm font-bold text-slate-900 font-mono">Au</span>
          </div>
          <div className="hidden sm:block">
            <span className="text-sm font-semibold text-[var(--text-primary)]">VN Gold</span>
            <span className="ml-1 text-sm font-light text-[var(--text-muted)]">Value</span>
          </div>
        </div>

        {/* Center: Live gold ticker */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] px-3 py-1.5">
            <div className="flex items-center gap-1.5">
              <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-[#10B981]" />
              <Badge variant="live" className="text-xs">LIVE</Badge>
            </div>
            <div className="h-4 w-px bg-[var(--border-default)]" />
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--text-muted)] font-mono">XAU/USD</span>
              <span className="text-sm font-semibold font-mono text-[var(--text-primary)]">
                ${formatNumber(WORLD_GOLD_PRICE_USD)}
              </span>
              <span className={cn(
                "flex items-center gap-0.5 text-xs font-mono font-medium",
                isUp ? "text-[#10B981]" : "text-[#EF4444]"
              )}>
                {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {isUp ? "+" : ""}{WORLD_GOLD_CHANGE_PERCENT}%
              </span>
            </div>
          </div>

          {mounted && (
            <div className="hidden lg:flex items-center gap-1.5 text-xs text-[var(--text-muted)] font-mono">
              <Zap className="h-3 w-3 text-[#F59E0B]" />
              {currentTime}
            </div>
          )}
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-1">
          {/* Currency switcher */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <Button variant="ghost" size="sm" className="h-8 px-2 text-xs font-mono font-medium">
                {currency}
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="z-50 min-w-[100px] rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-1 shadow-[var(--shadow-lg)] animate-in fade-in-0 zoom-in-95"
                sideOffset={8}
                align="end"
              >
                {CURRENCIES.map((cur) => (
                  <DropdownMenu.Item
                    key={cur}
                    className={cn(
                      "flex cursor-pointer items-center rounded-lg px-3 py-2 text-sm outline-none transition-colors",
                      currency === cur
                        ? "bg-[#F59E0B]/10 text-[#F59E0B] font-medium"
                        : "text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]"
                    )}
                    onSelect={() => setCurrency(cur)}
                  >
                    {cur}
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>

          {/* Language switcher */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Globe className="h-4 w-4" />
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="z-50 min-w-[140px] rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-1 shadow-[var(--shadow-lg)] animate-in fade-in-0 zoom-in-95"
                sideOffset={8}
                align="end"
              >
                {LANGUAGES.map((lang) => (
                  <DropdownMenu.Item
                    key={lang.code}
                    className={cn(
                      "flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm outline-none transition-colors",
                      language === lang.code
                        ? "bg-[#F59E0B]/10 text-[#F59E0B] font-medium"
                        : "text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]"
                    )}
                    onSelect={() => setLanguage(lang.code as "vi" | "en")}
                  >
                    <span className="text-base">{lang.flag}</span>
                    {lang.label}
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>

          {/* Theme toggle */}
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label={theme === "dark" ? t.lightMode : t.darkMode}
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4 text-[#F59E0B]" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
