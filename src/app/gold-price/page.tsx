"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Info,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GOLD_PRICES, type GoldPrice } from "@/lib/mock-data";
import { useApp } from "@/providers/AppProvider";
import { cn } from "@/lib/utils";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

function Sparkline({ isUp }: { isUp: boolean }) {
  const data = Array.from({ length: 12 }, (_, i) => ({
    v: 100 + Math.sin(i * 0.5) * 3 + (Math.random() - 0.5) * 2 + (isUp ? i * 0.3 : -i * 0.2),
  }));
  return (
    <div className="h-10 w-20">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey="v"
            stroke={isUp ? "#10B981" : "#EF4444"}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
          <Tooltip
            contentStyle={{ display: "none" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

type SortField = "type" | "buy" | "sell" | "change";
type SortDir = "asc" | "desc";

export default function GoldPricePage() {
  const { t, currency } = useApp();
  const [prices, setPrices] = useState<GoldPrice[]>(GOLD_PRICES);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [sortField, setSortField] = useState<SortField>("sell");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const USD_RATE = 25_340;
  const formatPrice = (vnd: number) =>
    currency === "USD"
      ? `$${(vnd / USD_RATE).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`
      : `${(vnd / 1_000_000).toFixed(2)}M`;

  useEffect(() => {
    const interval = setInterval(() => {
      setPrices((prev) =>
        prev.map((p) => {
          const delta = (Math.random() - 0.48) * 200_000;
          const newSell = p.sell + Math.round(delta);
          const newBuy = newSell - 2_000_000;
          const newChange = p.change + Math.round(delta * 0.1);
          const newPercent = parseFloat((p.changePercent + (Math.random() - 0.48) * 0.05).toFixed(2));
          return { ...p, sell: newSell, buy: newBuy, change: newChange, changePercent: newPercent };
        })
      );
      setLastUpdate(new Date());
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const sorted = [...prices].sort((a, b) => {
    const mul = sortDir === "asc" ? 1 : -1;
    if (sortField === "type") return a.type.localeCompare(b.type) * mul;
    if (sortField === "buy") return (a.buy - b.buy) * mul;
    if (sortField === "sell") return (a.sell - b.sell) * mul;
    return (a.changePercent - b.changePercent) * mul;
  });

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronUp className="h-3 w-3 opacity-30" />;
    return sortDir === "asc"
      ? <ChevronUp className="h-3 w-3 text-[#F59E0B]" />
      : <ChevronDown className="h-3 w-3 text-[#F59E0B]" />;
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 pb-24 md:pb-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">{t.goldPrice}</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5 font-mono">
            Cập nhật: {lastUpdate.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="live">
            <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-[#10B981]" />
            Trực tiếp
          </Badge>
          <Button variant="secondary" size="icon" onClick={handleRefresh} className="h-8 w-8">
            <RefreshCw className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "SJC Mua", value: formatPrice(118_500_000), sub: "cao nhất", up: true },
          { label: "SJC Bán", value: formatPrice(120_500_000), sub: "thị trường", up: true },
          { label: "Chênh lệch", value: formatPrice(2_000_000), sub: "spread", up: false },
          { label: "Thay đổi 24h", value: "+0.42%", sub: "SJC", up: true },
        ].map((item) => (
          <Card key={item.label} className="hover:bg-[var(--bg-card-hover)] transition-colors cursor-default">
            <CardContent className="p-4">
              <p className="text-xs text-[var(--text-muted)] mb-1 uppercase tracking-wide">{item.label}</p>
              <p className={cn(
                "text-lg font-bold font-mono",
                item.up ? "text-[var(--text-primary)]" : "text-[#EF4444]"
              )}>
                {item.value}
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">{item.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border-default)]">
                <th className="text-left py-3 px-4">
                  <button
                    onClick={() => handleSort("type")}
                    className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                  >
                    Loại vàng <SortIcon field="type" />
                  </button>
                </th>
                <th className="text-right py-3 px-4 hidden md:table-cell">
                  <button
                    onClick={() => handleSort("buy")}
                    className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer ml-auto"
                  >
                    Mua vào <SortIcon field="buy" />
                  </button>
                </th>
                <th className="text-right py-3 px-4">
                  <button
                    onClick={() => handleSort("sell")}
                    className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer ml-auto"
                  >
                    Bán ra <SortIcon field="sell" />
                  </button>
                </th>
                <th className="text-right py-3 px-4 hidden sm:table-cell">
                  <button
                    onClick={() => handleSort("change")}
                    className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer ml-auto"
                  >
                    Thay đổi <SortIcon field="change" />
                  </button>
                </th>
                <th className="text-center py-3 px-4 hidden lg:table-cell">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    Xu hướng
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((item) => {
                const isUp = item.changePercent >= 0;
                return (
                  <tr
                    key={item.type}
                    className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--bg-card-hover)] transition-colors cursor-default"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F59E0B]/10 shrink-0">
                          <span className="text-xs font-bold font-mono text-[#F59E0B]">
                            {item.type.slice(0, 2)}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-[var(--text-primary)]">{item.type}</p>
                          <p className="text-xs text-[var(--text-muted)] font-mono">{item.updatedAt}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right hidden md:table-cell">
                      <span className="font-mono font-medium text-[var(--text-secondary)]">
                        {formatPrice(item.buy)}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="font-mono font-bold text-[var(--text-primary)]">
                        {formatPrice(item.sell)}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right hidden sm:table-cell">
                      <div className={cn(
                        "inline-flex items-center gap-1 text-xs font-mono font-medium",
                        isUp ? "text-[#10B981]" : "text-[#EF4444]"
                      )}>
                        {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {isUp ? "+" : ""}{item.changePercent.toFixed(2)}%
                      </div>
                    </td>
                    <td className="py-4 px-4 hidden lg:table-cell">
                      <div className="flex justify-center">
                        <Sparkline isUp={isUp} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Info notice */}
      <div className="flex items-start gap-2 rounded-xl border border-[#F59E0B]/20 bg-[#F59E0B]/5 p-4">
        <Info className="h-4 w-4 text-[#F59E0B] mt-0.5 shrink-0" />
        <p className="text-xs text-[var(--text-muted)] leading-relaxed">
          Giá vàng được cập nhật mỗi 3 giây từ các nguồn SJC, DOJI, PNJ. Đây là giá tham khảo, giá thực tế có thể khác nhau tùy theo địa điểm giao dịch.
        </p>
      </div>
    </div>
  );
}
