"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { GOLD_PRICES, type GoldPrice } from "@/lib/mock-data";
import { useApp } from "@/providers/AppProvider";
import { cn } from "@/lib/utils";

function PriceRow({ item, flashKey }: { item: GoldPrice; flashKey: number }) {
  const isUp = item.changePercent >= 0;
  const [flash, setFlash] = useState<"up" | "down" | null>(null);
  const prevKey = flashKey;

  useEffect(() => {
    if (prevKey > 0) {
      setFlash(isUp ? "up" : "down");
      const t = setTimeout(() => setFlash(null), 800);
      return () => clearTimeout(t);
    }
  }, [flashKey, isUp, prevKey]);

  return (
    <div
      className={cn(
        "flex items-center justify-between py-2.5 px-3 rounded-lg transition-all duration-200 cursor-default",
        flash === "up" && "flash-green",
        flash === "down" && "flash-red",
        "hover:bg-[var(--bg-card-hover)]"
      )}
    >
      <div className="flex items-center gap-2.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#F59E0B]/10 shrink-0">
          <span className="text-xs font-bold font-mono text-[#F59E0B]">
            {item.type.slice(0, 2)}
          </span>
        </div>
        <div>
          <p className="text-sm font-semibold text-[var(--text-primary)]">{item.type}</p>
          <p className="text-xs text-[var(--text-muted)] font-mono">{item.updatedAt}</p>
        </div>
      </div>

      <div className="text-right">
        <p className="text-sm font-mono font-bold text-[var(--text-primary)]">
          {(item.sell / 1_000_000).toFixed(1)}M
        </p>
        <div className={cn(
          "flex items-center justify-end gap-0.5 text-xs font-mono",
          isUp ? "text-[#10B981]" : "text-[#EF4444]"
        )}>
          {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          <span>{isUp ? "+" : ""}{item.changePercent.toFixed(2)}%</span>
        </div>
      </div>
    </div>
  );
}

export function PriceTicker() {
  const { t } = useApp();
  const [prices, setPrices] = useState<GoldPrice[]>(GOLD_PRICES);
  const [flashKey, setFlashKey] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPrices((prev) =>
        prev.map((item) => {
          const delta = (Math.random() - 0.48) * 0.1;
          const newChange = item.changePercent + delta;
          const newSell = item.sell + Math.round(delta * item.sell * 0.1);
          return {
            ...item,
            sell: newSell,
            changePercent: parseFloat(newChange.toFixed(2)),
            updatedAt: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
          };
        })
      );
      setFlashKey((k) => k + 1);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-[var(--text-primary)]">
            {t.goldTypes}
          </CardTitle>
          <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
            <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-[#10B981]" />
            <span className="text-[#10B981] font-medium text-xs">Live</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 px-3">
        <div className="flex flex-col">
          {prices.map((item) => (
            <PriceRow key={item.type} item={item} flashKey={flashKey} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
