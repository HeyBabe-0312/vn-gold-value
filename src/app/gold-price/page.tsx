"use client";

import { useState, useEffect, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Info,
  ChevronUp,
  ChevronDown,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useApp } from "@/providers/AppProvider";
import { intlLocaleForApp } from "@/lib/vn-setting";
import { formatGoldPricesUpdatedLocal } from "@/lib/vang-today";
import { cn } from "@/lib/utils";
import { LineChart, Line, ResponsiveContainer, Tooltip } from "recharts";
import { useAppDispatch, useAppSelector, useUsdVndRate } from "@/store/hooks";
import { fetchGoldPrices } from "@/store/goldPricesSlice";
import {
  GRAMS_PER_LUONG_VN,
  GRAMS_PER_TROY_OZ,
  vndLuongToDisplayAmount,
  usdOzToApproxVndPerOz,
  vndPerOzSpotToVndDisplayUnit,
  formatWorldGoldVndByUnit,
} from "@/lib/gold-units";

function Sparkline({ isUp }: { isUp: boolean }) {
  const [mounted, setMounted] = useState(false);
  const data = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        v: 100 + Math.sin(i * 0.55) * 4 + (isUp ? i * 0.35 : -i * 0.22),
      })),
    [isUp],
  );

  useEffect(() => {
    // Defer to avoid lint rule "set-state-in-effect".
    setTimeout(() => setMounted(true), 0);
  }, []);

  if (!mounted) {
    return (
      <div
        className="h-10 w-20 min-h-10 min-w-[80px] rounded border border-[var(--border-subtle)] bg-[var(--bg-secondary)]"
        aria-hidden
      />
    );
  }

  return (
    <div className="h-10 w-20 min-h-10 min-w-[80px]">
      <ResponsiveContainer width="100%" height="100%" minHeight={40}>
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey="v"
            stroke={isUp ? "#10B981" : "#EF4444"}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
          <Tooltip contentStyle={{ display: "none" }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

type SortField = "type" | "buy" | "sell" | "change";
type SortDir = "asc" | "desc";

function formatUsdOz(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export default function GoldPricePage() {
  const { t, currency, goldUnit, setGoldUnit, language } = useApp();
  const dispatch = useAppDispatch();
  const goldState = useAppSelector((s) => s.goldPrices);

  const rows = goldState.vndRows;
  const world = goldState.worldGold;
  const refSjc = goldState.sjcRef;
  const loading = goldState.status === "idle" || goldState.status === "loading";
  const error = goldState.error;
  const meta = goldState.meta;

  const usdVndRate = useUsdVndRate();
  const [sortField, setSortField] = useState<SortField>("sell");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const updateLabel = useMemo(() => {
    return formatGoldPricesUpdatedLocal(meta, intlLocaleForApp(language));
  }, [meta, language]);

  const worldVndDisplay = useMemo(() => {
    if (!world) return null;
    const vndOz = usdOzToApproxVndPerOz(world.buy, usdVndRate);
    return vndPerOzSpotToVndDisplayUnit(vndOz, goldUnit);
  }, [world, goldUnit, usdVndRate]);

  /** `vndPerLuong`: giá gốc từ API (VND mỗi lượng). */
  const formatDomestic = (vndPerLuong: number) => {
    const v = vndLuongToDisplayAmount(vndPerLuong, goldUnit);
    if (currency === "USD") {
      return `$${(v / usdVndRate).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
    }
    return `${(v / 1_000_000).toFixed(2)}M`;
  };

  const unitSuffix = goldUnit === "luong" ? t.perLuong : t.perChi;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const sorted = useMemo(() => {
    const list = [...rows];
    const mul = sortDir === "asc" ? 1 : -1;
    const collator = intlLocaleForApp(language);
    list.sort((a, b) => {
      if (sortField === "type")
        return a.name.localeCompare(b.name, collator) * mul;
      if (sortField === "buy") return (a.buy - b.buy) * mul;
      if (sortField === "sell") return (a.sell - b.sell) * mul;
      return (a.changePercent - b.changePercent) * mul;
    });
    return list;
  }, [rows, sortField, sortDir, language]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    void dispatch(fetchGoldPrices({ force: true })).finally(() => {
      setIsRefreshing(false);
    });
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field)
      return <ChevronUp className="h-3 w-3 opacity-30" />;
    return sortDir === "asc" ? (
      <ChevronUp className="h-3 w-3 text-[#F59E0B]" />
    ) : (
      <ChevronDown className="h-3 w-3 text-[#F59E0B]" />
    );
  };

  const spread =
    refSjc && refSjc.sell > 0 && refSjc.buy > 0
      ? refSjc.sell - refSjc.buy
      : null;

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 pb-24 md:pb-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">
            {t.goldPrice}
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5 font-mono">
            {loading
              ? t.loading
              : updateLabel
                ? `${t.updatedPrefix} ${updateLabel}`
                : "—"}
          </p>
          <p className="text-[11px] text-[var(--text-muted)] mt-1 max-w-md">
            {currency === "USD" && (
              <>
                {t.goldPriceUsdDisclaimer.replace(
                  "{rate}",
                  Math.round(usdVndRate).toLocaleString(intlLocaleForApp(language)),
                )}
              </>
            )}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0 sm:flex-row sm:items-center">
          <Badge variant="live">
            <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-[#10B981]" />
            {t.api}
          </Badge>
          <div
            className="flex rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] p-0.5"
            role="group"
            aria-label={t.unitDisplay}
          >
            <Button
              type="button"
              variant={goldUnit === "luong" ? "default" : "ghost"}
              size="sm"
              className={cn(
                "h-7 px-2.5 text-xs",
                goldUnit !== "luong" && "text-[var(--text-muted)]",
              )}
              onClick={() => setGoldUnit("luong")}
            >
              {t.unitLuong}
            </Button>
            <Button
              type="button"
              variant={goldUnit === "chi" ? "default" : "ghost"}
              size="sm"
              className={cn(
                "h-7 px-2.5 text-xs",
                goldUnit !== "chi" && "text-[var(--text-muted)]",
              )}
              onClick={() => setGoldUnit("chi")}
            >
              {t.unitChi}
            </Button>
          </div>
          <Button
            variant="secondary"
            size="icon"
            onClick={handleRefresh}
            disabled={loading || isRefreshing}
            className="h-8 w-8"
          >
            <RefreshCw
              className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")}
            />
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-[#EF4444]/30 bg-[#EF4444]/5 px-4 py-3 text-sm text-[#EF4444]">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {world && (
        <Card className="border-[#8B5CF6]/20 bg-[#8B5CF6]/5">
          <CardContent className="p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                {t.worldGoldCardTitle}
              </p>
              <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <p className="text-lg font-bold font-mono text-[var(--text-primary)]">
                  {formatUsdOz(world.buy)}
                  <span className="text-sm font-normal text-[var(--text-muted)] ml-1.5">
                    {t.goldPricePerOzSuffix}
                  </span>
                </p>
                {worldVndDisplay != null && (
                  <p className="text-sm font-mono text-[var(--text-secondary)]">
                    {formatWorldGoldVndByUnit(
                      worldVndDisplay,
                      currency,
                      goldUnit,
                      language,
                      usdVndRate,
                    )}
                  </p>
                )}
              </div>
              <p className="text-[11px] text-[var(--text-muted)] mt-1 leading-relaxed">
                {t.goldPriceWorldVndFormula
                  .replace(
                    "{rate}",
                    Math.round(usdVndRate).toLocaleString(intlLocaleForApp(language)),
                  )
                  .replace("{gramsLuong}", String(GRAMS_PER_LUONG_VN))
                  .replace("{gramsOz}", GRAMS_PER_TROY_OZ.toFixed(4))
                  .replace(
                    "{chiSuffix}",
                    goldUnit === "chi" ? t.goldPriceWorldVndChiSuffix : "",
                  )
                  .replace("{approxNote}", t.goldPriceWorldVndApprox)}
              </p>
            </div>
            <div
              className={cn(
                "flex items-center gap-1 text-sm font-mono font-medium",
                world.changePercent >= 0 ? "text-[#10B981]" : "text-[#EF4444]",
              )}
            >
              {world.changePercent >= 0 ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              {world.changePercent >= 0 ? "+" : ""}
              {world.changePercent.toFixed(2)}%
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {refSjc ? (
          <>
            <Card className="hover:bg-[var(--bg-card-hover)] transition-colors cursor-default">
              <CardContent className="p-4">
                <p className="text-xs text-[var(--text-muted)] mb-1 uppercase tracking-wide">
                  {refSjc.code} · {t.buy}
                </p>
                <p className="text-lg font-bold font-mono text-[var(--text-primary)]">
                  {formatDomestic(refSjc.buy)}
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5 truncate">
                  {refSjc.name} · {unitSuffix}
                </p>
              </CardContent>
            </Card>
            <Card className="hover:bg-[var(--bg-card-hover)] transition-colors cursor-default">
              <CardContent className="p-4">
                <p className="text-xs text-[var(--text-muted)] mb-1 uppercase tracking-wide">
                  {refSjc.code} · {t.sell}
                </p>
                <p className="text-lg font-bold font-mono text-[var(--text-primary)]">
                  {formatDomestic(refSjc.sell)}
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  {t.reference} · {unitSuffix}
                </p>
              </CardContent>
            </Card>
            <Card className="hover:bg-[var(--bg-card-hover)] transition-colors cursor-default">
              <CardContent className="p-4">
                <p className="text-xs text-[var(--text-muted)] mb-1 uppercase tracking-wide">
                  {t.spreadLabel}
                </p>
                <p
                  className={cn(
                    "text-lg font-bold font-mono",
                    spread != null && spread >= 0
                      ? "text-[var(--text-primary)]"
                      : "text-[#EF4444]",
                  )}
                >
                  {spread != null ? formatDomestic(spread) : "—"}
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  {t.spreadLabel} · {unitSuffix}
                </p>
              </CardContent>
            </Card>
            <Card className="hover:bg-[var(--bg-card-hover)] transition-colors cursor-default">
              <CardContent className="p-4">
                <p className="text-xs text-[var(--text-muted)] mb-1 uppercase tracking-wide">
                  {t.volatilitySell}
                </p>
                <p
                  className={cn(
                    "text-lg font-bold font-mono",
                    refSjc.changePercent >= 0
                      ? "text-[#10B981]"
                      : "text-[#EF4444]",
                  )}
                >
                  {refSjc.changePercent >= 0 ? "+" : ""}
                  {refSjc.changePercent.toFixed(2)}%
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  {t.vsPrevSession}
                </p>
              </CardContent>
            </Card>
          </>
        ) : (
          !loading &&
          !error && (
            <p className="text-sm text-[var(--text-muted)] col-span-full">
              {t.goldPriceNoSjcRef}
            </p>
          )
        )}
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border-default)]">
                <th className="text-left py-3 px-4">
                  <button
                    type="button"
                    onClick={() => handleSort("type")}
                    className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                  >
                    {t.sourceType} {renderSortIcon("type")}
                  </button>
                </th>
                <th className="text-right py-3 px-4 hidden md:table-cell">
                  <button
                    type="button"
                    onClick={() => handleSort("buy")}
                    className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer ml-auto"
                  >
                    <span className="flex flex-col items-end gap-0.5">
                      <span className="flex items-center gap-1">
                        {t.goldPriceColBuyIn} {renderSortIcon("buy")}
                      </span>
                      <span className="text-[10px] font-normal normal-case text-[var(--text-muted)]">
                        ({unitSuffix})
                      </span>
                    </span>
                  </button>
                </th>
                <th className="text-right py-3 px-4">
                  <button
                    type="button"
                    onClick={() => handleSort("sell")}
                    className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer ml-auto"
                  >
                    <span className="flex flex-col items-end gap-0.5">
                      <span className="flex items-center gap-1">
                        {t.goldPriceColSellOut} {renderSortIcon("sell")}
                      </span>
                      <span className="text-[10px] font-normal normal-case text-[var(--text-muted)]">
                        ({unitSuffix})
                      </span>
                    </span>
                  </button>
                </th>
                <th className="text-right py-3 px-4 hidden sm:table-cell">
                  <button
                    type="button"
                    onClick={() => handleSort("change")}
                    className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer ml-auto"
                  >
                    {t.change} {renderSortIcon("change")}
                  </button>
                </th>
                <th className="text-center py-3 px-4 hidden lg:table-cell">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    {t.trend}
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {loading && rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-12 text-center text-[var(--text-muted)]"
                  >
                    {t.loadingDomestic}
                  </td>
                </tr>
              ) : sorted.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-12 text-center text-[var(--text-muted)]"
                  >
                    {t.noVndRecords}
                  </td>
                </tr>
              ) : (
                sorted.map((item) => {
                  const isUp = item.changePercent >= 0;
                  const initials = item.code.slice(0, 2).toUpperCase();
                  return (
                    <tr
                      key={item.code}
                      className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--bg-card-hover)] transition-colors cursor-default"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2.5 min-w-[140px]">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F59E0B]/10 shrink-0">
                            <span className="text-[10px] font-bold font-mono text-[#F59E0B] leading-none">
                              {initials}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-[var(--text-primary)] truncate">
                              {item.name}
                            </p>
                            <p className="text-xs text-[var(--text-muted)] font-mono">
                              {item.code}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right hidden md:table-cell">
                        <span className="font-mono font-medium text-[var(--text-secondary)]">
                          {formatDomestic(item.buy)}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="font-mono font-bold text-[var(--text-primary)]">
                          {formatDomestic(item.sell)}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right hidden sm:table-cell">
                        <div
                          className={cn(
                            "inline-flex items-center gap-1 text-xs font-mono font-medium",
                            isUp ? "text-[#10B981]" : "text-[#EF4444]",
                          )}
                        >
                          {isUp ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          {isUp ? "+" : ""}
                          {item.changePercent.toFixed(2)}%
                        </div>
                      </td>
                      <td className="py-4 px-4 hidden lg:table-cell">
                        <div className="flex justify-center">
                          <Sparkline isUp={isUp} />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="flex items-start gap-2 rounded-xl border border-[#F59E0B]/20 bg-[#F59E0B]/5 p-4">
        <Info className="h-4 w-4 text-[#F59E0B] mt-0.5 shrink-0" />
        <p className="text-xs text-[var(--text-muted)] leading-relaxed">
          {t.goldPriceDataFooterBefore}
          <a
            href="https://www.vang.today/vi/api"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#F59E0B] underline-offset-2 hover:underline cursor-pointer"
          >
            vang.today
          </a>
          {t.goldPriceDataFooterAfter}
        </p>
      </div>
    </div>
  );
}
