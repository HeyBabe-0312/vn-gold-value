"use client";

import { BarChart2, TrendingUp, Activity, DollarSign } from "lucide-react";
import { PriceChart } from "@/components/dashboard/PriceChart";
import { PriceTicker } from "@/components/dashboard/PriceTicker";
import { MarketOverview } from "@/components/dashboard/MarketOverview";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { useApp } from "@/providers/AppProvider";
import {
  WORLD_GOLD_PRICE_USD,
  WORLD_GOLD_CHANGE_PERCENT,
  STATS,
} from "@/lib/mock-data";

export default function DashboardPage() {
  const { t, currency } = useApp();
  const sjcPrice = currency === "USD"
    ? `$${(120_500_000 / 25_340).toFixed(0)}`
    : "120.5M VND";

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 pb-24 md:pb-6">
      {/* Page title */}
      <div>
        <h1 className="text-xl font-bold text-[var(--text-primary)]">{t.dashboard}</h1>
        <p className="text-sm text-[var(--text-muted)] mt-0.5">
          {t.realtime} · {new Date().toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatsCard
          label="SJC (Bán)"
          value={sjcPrice}
          subValue="Giá bán lẻ"
          change={0.42}
          changeLabel="hôm nay"
          icon={TrendingUp}
          iconColor="#F59E0B"
          glowGold
        />
        <StatsCard
          label={t.worldGold}
          value={`$${WORLD_GOLD_PRICE_USD.toLocaleString()}`}
          subValue="XAU/USD"
          change={WORLD_GOLD_CHANGE_PERCENT}
          changeLabel="24h"
          icon={DollarSign}
          iconColor="#8B5CF6"
        />
        <StatsCard
          label={t.high}
          value={`${(STATS.highPrice / 1_000_000).toFixed(1)}M`}
          subValue="VND/lượng"
          icon={BarChart2}
          iconColor="#10B981"
        />
        <StatsCard
          label={t.volume}
          value={STATS.totalVolume}
          subValue="lượng giao dịch"
          change={5.2}
          changeLabel="vs hôm qua"
          icon={Activity}
          iconColor="#3B82F6"
        />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <PriceChart />
        <PriceTicker />
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MarketOverview />

        {/* World prices card */}
        <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-5">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Giá vàng thế giới</h3>
          <div className="space-y-3">
            {[
              { label: "Spot Gold (XAU)", price: "$3,124.50", change: "+0.40%", up: true },
              { label: "Gold Futures", price: "$3,132.80", change: "+0.35%", up: true },
              { label: "Silver (XAG)", price: "$34.21", change: "-0.12%", up: false },
              { label: "Platinum", price: "$982.50", change: "+0.18%", up: true },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b border-[var(--border-subtle)] last:border-0">
                <span className="text-sm text-[var(--text-secondary)]">{item.label}</span>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-semibold text-[var(--text-primary)]">{item.price}</span>
                  <span className={`font-mono text-xs font-medium w-16 text-right ${item.up ? "text-[#10B981]" : "text-[#EF4444]"}`}>
                    {item.change}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
