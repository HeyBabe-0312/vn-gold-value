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
    <Card glowGold={glowGold} className="hover:bg-[var(--bg-card-hover)] transition-colors cursor-default">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2">
              {label}
            </p>
            <p className="text-xl font-bold font-mono text-[var(--text-primary)] tracking-tight truncate">
              {value}
            </p>
            {subValue && (
              <p className="text-xs text-[var(--text-muted)] font-mono mt-0.5">{subValue}</p>
            )}
            {change !== undefined && (
              <div className={cn(
                "flex items-center gap-1 mt-2 text-xs font-mono font-medium",
                isUp ? "text-[#10B981]" : "text-[#EF4444]"
              )}>
                {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                <span>{isUp ? "+" : ""}{formatNumber(Math.abs(change), 2)}%</span>
                {changeLabel && <span className="text-[var(--text-muted)] font-normal">{changeLabel}</span>}
              </div>
            )}
          </div>
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0 ml-3"
            style={{ backgroundColor: `${iconColor}15` }}
          >
            <Icon className="h-5 w-5" style={{ color: iconColor }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
