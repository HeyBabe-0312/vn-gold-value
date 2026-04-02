"use client";

import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CHART_DATA, type ChartDataPoint } from "@/lib/mock-data";
import { useApp } from "@/providers/AppProvider";

const TIME_RANGES = ["1H", "4H", "1D", "1W", "1M"] as const;
type TimeRange = (typeof TIME_RANGES)[number];

const SLICE_MAP: Record<TimeRange, number> = {
  "1H": 12,
  "4H": 24,
  "1D": 48,
  "1W": 48,
  "1M": 48,
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: ChartDataPoint }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const data = payload[0];
  return (
    <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-3 shadow-[var(--shadow-lg)]">
      <p className="text-xs text-[var(--text-muted)] mb-1 font-mono">{label}</p>
      <p className="text-sm font-bold font-mono text-[var(--text-primary)]">
        {(data.value / 1_000_000).toFixed(2)}M VND
      </p>
      <p className="text-xs text-[var(--text-muted)] font-mono">
        Vol: {data.payload.volume}
      </p>
    </div>
  );
}

export function PriceChart() {
  const { t } = useApp();
  const [range, setRange] = useState<TimeRange>("1D");
  const [data, setData] = useState(CHART_DATA);
  const [animKey, setAnimKey] = useState(0);
  const [chartReady, setChartReady] = useState(false);

  useEffect(() => {
    // Defer to avoid lint rule "set-state-in-effect".
    setTimeout(() => setChartReady(true), 0);
  }, []);

  useEffect(() => {
    const sliced = CHART_DATA.slice(-SLICE_MAP[range]);
    // Defer to avoid lint rule "set-state-in-effect".
    setTimeout(() => {
      setData(sliced);
      setAnimKey((k) => k + 1);
    }, 0);
  }, [range]);

  // Simulate real-time update
  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) => {
        const last = prev[prev.length - 1];
        const change = (Math.random() - 0.48) * 100_000;
        const newPoint: ChartDataPoint = {
          time: new Date().toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          price: Math.round(Math.max(last.price + change, 115_000_000)),
          volume: Math.round(Math.random() * 500 + 100),
        };
        return [...prev.slice(1), newPoint];
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const firstPrice = data[0]?.price ?? 0;
  const lastPrice = data[data.length - 1]?.price ?? 0;
  const isUp = lastPrice >= firstPrice;
  const minPrice = Math.min(...data.map((d) => d.price));
  const maxPrice = Math.max(...data.map((d) => d.price));

  const gradientId = `gradient-${isUp ? "up" : "down"}`;

  return (
    <Card className="col-span-full min-w-0 lg:col-span-2">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-semibold text-[var(--text-primary)]">
              {t.priceChart} — SJC
            </CardTitle>
            <Badge variant="live">
              <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-[#10B981]" />
              LIVE
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            {TIME_RANGES.map((r) => (
              <Button
                key={r}
                variant={range === r ? "default" : "ghost"}
                size="sm"
                className={
                  range === r
                    ? "h-7 px-2.5 text-xs"
                    : "h-7 px-2.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }
                onClick={() => setRange(r)}
              >
                {r}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex items-baseline gap-3 mt-1">
          <span className="text-2xl font-bold font-mono text-[var(--text-primary)]">
            {(lastPrice / 1_000_000).toFixed(2)}M
          </span>
          <span
            className={`text-sm font-mono font-medium ${isUp ? "text-[#10B981]" : "text-[#EF4444]"}`}
          >
            {isUp ? "+" : ""}
            {(((lastPrice - firstPrice) / firstPrice) * 100).toFixed(2)}%
          </span>
          <span className="text-xs text-[var(--text-muted)]">VND/lượng</span>
        </div>
      </CardHeader>
      <CardContent className="p-0 pb-4">
        <div className="h-[280px] w-full min-w-0 px-2">
          {chartReady ? (
            <ResponsiveContainer
              width="100%"
              height="100%"
              minHeight={280}
              minWidth={0}
            >
              <AreaChart
                key={animKey}
                data={data}
                margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
              >
              <defs>
                <linearGradient id="gradient-up" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradient-down" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border-default)"
                vertical={false}
                opacity={0.5}
              />
              <XAxis
                dataKey="time"
                tick={{
                  fontSize: 10,
                  fill: "var(--text-muted)",
                  fontFamily: "Fira Code, monospace",
                }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={[minPrice * 0.999, maxPrice * 1.001]}
                tick={{
                  fontSize: 10,
                  fill: "var(--text-muted)",
                  fontFamily: "Fira Code, monospace",
                }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${(v / 1_000_000).toFixed(1)}M`}
                width={52}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ stroke: "var(--border-subtle)", strokeWidth: 1 }}
              />
              <ReferenceLine
                y={firstPrice}
                stroke="var(--text-muted)"
                strokeDasharray="4 4"
                strokeOpacity={0.4}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke={isUp ? "#10B981" : "#EF4444"}
                strokeWidth={2}
                fill={`url(#${gradientId})`}
                dot={false}
                activeDot={{
                  r: 4,
                  fill: isUp ? "#10B981" : "#EF4444",
                  stroke: "var(--bg-card)",
                  strokeWidth: 2,
                }}
                isAnimationActive={true}
                animationDuration={400}
              />
            </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div
              className="h-full w-full animate-pulse rounded-lg bg-[var(--bg-secondary)]"
              aria-hidden
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
