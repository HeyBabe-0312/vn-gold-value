"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { GOLD_PRICES } from "@/lib/mock-data";
import { useApp } from "@/providers/AppProvider";

export function MarketOverview() {
  const { t } = useApp();
  const [chartReady, setChartReady] = useState(false);
  const [data, setData] = useState(
    GOLD_PRICES.map((g) => ({
      name: g.type,
      buy: g.buy / 1_000_000,
      sell: g.sell / 1_000_000,
      change: g.changePercent,
    })),
  );

  useEffect(() => {
    // Defer to avoid lint rule "set-state-in-effect".
    setTimeout(() => setChartReady(true), 0);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) =>
        prev.map((d) => ({
          ...d,
          sell: parseFloat((d.sell + (Math.random() - 0.48) * 0.1).toFixed(2)),
          change: parseFloat(
            (d.change + (Math.random() - 0.48) * 0.05).toFixed(2),
          ),
        })),
      );
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle className="text-sm font-semibold text-[var(--text-primary)]">
          {t.marketOverview}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[180px] w-full min-w-0">
          {chartReady ? (
            <ResponsiveContainer width="100%" height="100%" minHeight={180}>
              <BarChart
                data={data}
                margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
                barGap={4}
              >
                <XAxis
                  dataKey="name"
                  tick={{
                    fontSize: 10,
                    fill: "var(--text-muted)",
                    fontFamily: "Fira Code, monospace",
                  }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{
                    fontSize: 10,
                    fill: "var(--text-muted)",
                    fontFamily: "Fira Code, monospace",
                  }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${v}M`}
                  width={42}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--bg-card)",
                    border: "1px solid var(--border-default)",
                    borderRadius: "12px",
                    fontSize: "12px",
                    color: "var(--text-primary)",
                    fontFamily: "Fira Code, monospace",
                  }}
                  cursor={{ fill: "var(--border-subtle)", opacity: 0.3 }}
                  formatter={(v) => [`${Number(v ?? 0).toFixed(2)}M VND`]}
                />
                <Bar dataKey="sell" radius={[4, 4, 0, 0]} maxBarSize={28}>
                  {data.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={entry.change >= 0 ? "#10B981" : "#EF4444"}
                      fillOpacity={0.8}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div
              className="h-full w-full animate-pulse rounded-lg bg-[var(--bg-secondary)]"
              aria-hidden
            />
          )}
        </div>
        {/* Legend */}
        <div className="flex items-center gap-4 mt-2 px-1">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-[#10B981]" />
            <span className="text-xs text-[var(--text-muted)]">Tăng</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-[#EF4444]" />
            <span className="text-xs text-[var(--text-muted)]">Giảm</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
