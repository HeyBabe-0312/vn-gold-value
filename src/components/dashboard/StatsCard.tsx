"use client";

import { TrendingUp, TrendingDown, LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn, formatNumber } from "@/lib/utils";

interface StatsCardProps {
  label: string;
  value: string;
  subValue?: string;
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  iconColor?: string;
  glowGold?: boolean;
}

export function StatsCard({
  label,
  value,
  subValue,
  change,
  changeLabel,
  icon: Icon,
  iconColor = "#F59E0B",
  glowGold,
}: StatsCardProps) {
  const isUp = change !== undefined ? change >= 0 : undefined;

  return (
    <Card glowGold={glowGold} className="hover:bg-[var(--bg-card-hover)] transition-colors cursor-default min-w-0">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 pr-1">
            <p className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1.5 sm:mb-2 sm:text-xs leading-snug break-words">
              {label}
            </p>
            <p
              className="text-lg font-bold font-mono text-[var(--text-primary)] tracking-tight leading-snug break-words [overflow-wrap:anywhere] sm:text-xl"
              translate="no"
            >
              {value}
            </p>
            {subValue && (
              <p className="text-xs text-[var(--text-muted)] font-mono mt-0.5 break-words">
                {subValue}
              </p>
            )}
            {change !== undefined && (
              <div
                className={cn(
                  "mt-2 flex flex-wrap items-center gap-x-1 gap-y-0.5 text-xs font-mono font-medium",
                  isUp ? "text-[#10B981]" : "text-[#EF4444]",
                )}
              >
                {isUp ? (
                  <TrendingUp className="h-3 w-3 shrink-0" />
                ) : (
                  <TrendingDown className="h-3 w-3 shrink-0" />
                )}
                <span className="shrink-0">
                  {isUp ? "+" : ""}
                  {formatNumber(Math.abs(change), 2)}%
                </span>
                {changeLabel && (
                  <span className="min-w-0 break-words text-[var(--text-muted)] font-normal leading-snug">
                    {changeLabel}
                  </span>
                )}
              </div>
            )}
          </div>
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:h-10 sm:w-10"
            style={{ backgroundColor: `${iconColor}15` }}
          >
            <Icon className="h-[18px] w-[18px] sm:h-5 sm:w-5" style={{ color: iconColor }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
