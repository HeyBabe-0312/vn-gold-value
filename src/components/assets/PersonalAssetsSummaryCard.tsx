"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Wallet, Coins, ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/providers/AppProvider";
import { intlLocaleForApp } from "@/lib/vn-setting";
import {
  displayQtyLuongToUnit,
  loadPersonalAssets,
  type PersonalAssetsMap,
  formatQty,
  PERSONAL_ASSETS_EVENT,
} from "@/lib/personal-assets";
import { useAppSelector, useUsdVndRate } from "@/store/hooks";

function formatVnd(value: number) {
  if (!Number.isFinite(value)) return "—";
  if (value >= 1_000_000_000)
    return `${(value / 1_000_000_000).toFixed(2)}B VND`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M VND`;
  return `${Math.round(value).toLocaleString("vi-VN")} VND`;
}

export function PersonalAssetsSummaryCard() {
  const { t, currency, goldUnit, language } = useApp();
  const goldState = useAppSelector((s) => s.goldPrices);
  const usdVndRate = useUsdVndRate();

  const [assets, setAssets] = useState<PersonalAssetsMap>({});
  const prices = goldState.vndRows;
  const loading = goldState.status === "idle" || goldState.status === "loading";

  useEffect(() => {
    setTimeout(() => {
      setAssets(loadPersonalAssets());
    }, 0);
  }, []);

  useEffect(() => {
    const onUpdated = () => {
      // Defer để tránh lint "set-state-in-effect".
      setTimeout(() => setAssets(loadPersonalAssets()), 0);
    };
    window.addEventListener(PERSONAL_ASSETS_EVENT, onUpdated);
    return () => window.removeEventListener(PERSONAL_ASSETS_EVENT, onUpdated);
  }, []);


  const computed = useMemo(() => {
    const entries = prices.map((p) => ({
      code: p.code,
      name: p.name,
      qtyLuong: assets[p.code] ?? 0,
      sellVndPerLuong: p.sell,
    }));
    const nonZero = entries.filter((e) => e.qtyLuong > 0);
    const totalVnd = entries.reduce(
      (sum, e) => sum + e.qtyLuong * e.sellVndPerLuong,
      0,
    );
    const top =
      nonZero.length === 0
        ? undefined
        : nonZero
            .map((e) => ({
              ...e,
              valueVnd: e.qtyLuong * e.sellVndPerLuong,
            }))
            .sort((a, b) => b.valueVnd - a.valueVnd)[0];

    return { totalVnd, top, nonZeroCount: nonZero.length };
  }, [assets, prices]);

  const totalDisplay = useMemo(() => {
    if (currency === "USD") {
      const totalUsd = computed.totalVnd / usdVndRate;
      return `$${totalUsd.toLocaleString(
        intlLocaleForApp(language),
        {
          maximumFractionDigits: 0,
        },
      )}`;
    }
    return formatVnd(computed.totalVnd);
  }, [computed.totalVnd, currency, language, usdVndRate]);

  const topLabel = useMemo(() => {
    if (!computed.top) return null;
    const qtyDisplay = displayQtyLuongToUnit(computed.top.qtyLuong, goldUnit);
    return `${computed.top.name} · ${formatQty(qtyDisplay)} ${
      goldUnit === "chi" ? t.unitChi : t.unitLuong
    }`;
  }, [computed.top, goldUnit, t.unitChi, t.unitLuong]);

  return (
    <div className="mb-4 mx-3">
      <Link
        href="/assets"
        className="block cursor-pointer"
        aria-label="Personal assets"
      >
        <Card className="rounded-xl">
          <CardContent className="p-3">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-[#F59E0B]" />
                <span className="text-xs text-[var(--text-muted)]">
                  {t.assetsTitle}
                </span>
              </div>
              <Badge variant="neutral" className="text-[10px]">
                {loading ? "~" : `${computed.nonZeroCount} ${t.assetsItems}`}
              </Badge>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="text-lg font-bold font-mono text-[var(--text-primary)] truncate">
                  {totalDisplay}
                </div>
                <div className="text-xs text-[var(--text-muted)] font-mono mt-0.5 truncate">
                  {topLabel ?? t.assetsEmpty}
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs text-[#F59E0B]">
                <ArrowUpRight className="h-4 w-4" />
                <Coins className="h-0 w-0" />
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
