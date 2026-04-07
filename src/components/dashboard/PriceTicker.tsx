"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ChevronRight, TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  formatGoldPricesUpdatedLocal,
  type GoldPriceRow,
} from "@/lib/vang-today";
import { useApp } from "@/providers/AppProvider";
import { intlLocaleForApp } from "@/lib/vn-setting";
import { useAppSelector } from "@/store/hooks";
import { cn } from "@/lib/utils";

const PREVIEW_ROW_LIMIT = 7;

function PriceRow({ item }: { item: GoldPriceRow }) {
  const isUp = item.changePercent >= 0;
  const initials =
    item.code.length >= 2
      ? item.code.slice(0, 2)
      : item.name.slice(0, 2).toUpperCase();

  return (
    <div
      className={cn(
        "flex items-center justify-between py-2.5 px-3 rounded-lg transition-all duration-200 cursor-default",
        "hover:bg-[var(--bg-card-hover)]",
      )}
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#F59E0B]/10 shrink-0">
          <span className="text-xs font-bold font-mono text-[#F59E0B]">
            {initials}
          </span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
            {item.name}
          </p>
          <p className="text-xs text-[var(--text-muted)] font-mono truncate">
            {item.code}
          </p>
        </div>
      </div>

      <div className="text-right shrink-0 pl-2">
        <p className="text-sm font-mono font-bold text-[var(--text-primary)]">
          {(item.sell / 1_000_000).toFixed(1)}M
        </p>
        <div
          className={cn(
            "flex items-center justify-end gap-0.5 text-xs font-mono",
            isUp ? "text-[#10B981]" : "text-[#EF4444]",
          )}
        >
          {isUp ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          <span>
            {isUp ? "+" : ""}
            {item.changePercent.toFixed(2)}%
          </span>
        </div>
      </div>
    </div>
  );
}

export function PriceTicker() {
  const { t, language } = useApp();
  const { vndRows, meta, status, error, lastFetchedAt } = useAppSelector(
    (s) => s.goldPrices,
  );

  const rows = useMemo(() => {
    const list = [...vndRows];
    list.sort((a, b) => b.sell - a.sell);
    return list;
  }, [vndRows]);

  const previewRows = useMemo(
    () => rows.slice(0, PREVIEW_ROW_LIMIT),
    [rows],
  );
  const hasMoreRows = rows.length > PREVIEW_ROW_LIMIT;

  const updateLabel = useMemo(() => {
    const fromApi = formatGoldPricesUpdatedLocal(meta, intlLocaleForApp(language));
    if (fromApi) return fromApi;
    if (lastFetchedAt) {
      return new Date(lastFetchedAt).toLocaleString(intlLocaleForApp(language), {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    }
    return null;
  }, [meta, language, lastFetchedAt]);

  const loading = status === "idle" || status === "loading";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm font-semibold text-[var(--text-primary)]">
            {t.goldTypes}
          </CardTitle>
          <div className="flex items-center gap-1 text-xs text-[var(--text-muted)] text-right shrink-0">
            <span>{t.updatedPrefix}</span>
            <span className="font-medium text-[var(--text-primary)] tabular-nums">
              {updateLabel ?? (loading ? t.loading : "—")}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 px-3">
        {error && status === "failed" && rows.length === 0 ? (
          <p className="text-sm text-[#EF4444] px-3 py-2">{error}</p>
        ) : loading && rows.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)] px-3 py-2">
            {t.loadingDomestic}
          </p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)] px-3 py-2">
            {t.noVndRecords}
          </p>
        ) : (
          <div className="flex flex-col">
            {previewRows.map((item) => (
              <PriceRow key={item.code} item={item} />
            ))}
            {hasMoreRows ? (
              <Button
                variant="ghost"
                className="mt-1 h-9 w-full justify-center gap-1 rounded-lg text-xs font-medium text-[#F59E0B] hover:bg-[var(--bg-card-hover)] hover:text-[#D97706]"
                asChild
              >
                <Link href="/gold-price">
                  {t.goldTypesSeeAll}
                  <ChevronRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
              </Button>
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
