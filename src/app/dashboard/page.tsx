"use client";

import { useEffect, useMemo, useState } from "react";
import { CircleArrowDown, CircleArrowUp, Coins, DollarSign } from "lucide-react";
import { PriceChart } from "@/components/dashboard/PriceChart";
import { GoldPriceChart } from "@/components/dashboard/GoldPriceChart";
import { PriceTicker } from "@/components/dashboard/PriceTicker";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { useApp } from "@/providers/AppProvider";
import { vndLuongToDisplayAmount } from "@/lib/gold-units";
import {
  DASHBOARD_FX_CODE,
  averageVndDomesticBuySell,
} from "@/lib/dashboard-stats-config";
import type { VnCurrency, VnWeightUnit } from "@/lib/vn-setting";
import { intlLocaleForApp } from "@/lib/vn-setting";
import { useAppSelector, useUsdVndRate } from "@/store/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function formatDomesticMain(
  vndPerLuong: number,
  goldUnit: VnWeightUnit,
  displayCurrency: VnCurrency,
  usdRate: number,
  intlLocale: string,
): string {
  const v = vndLuongToDisplayAmount(vndPerLuong, goldUnit);
  if (displayCurrency === "USD") {
    const usd = v / usdRate;
    return `$${usd.toLocaleString(intlLocale, { maximumFractionDigits: 0 })}`;
  }
  const m = v / 1_000_000;
  return `${m.toLocaleString(intlLocale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}M VND`;
}

function formatFxRateVnd(
  rate: number | undefined,
  intlLocale: string,
): string {
  if (rate == null || !Number.isFinite(rate) || rate <= 0) return "—";
  if (rate >= 1000) {
    return Math.round(rate).toLocaleString(intlLocale);
  }
  return rate.toLocaleString(intlLocale, {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  });
}

export default function DashboardPage() {
  const { t, currency, language, goldUnit } = useApp();
  const [dateLine, setDateLine] = useState("");
  const usdRate = useUsdVndRate();
  const intlLocale = intlLocaleForApp(language);

  const goldState = useAppSelector((s) => s.goldPrices);
  const fxState = useAppSelector((s) => s.exchangeRates);

  const world = goldState.worldGold;
  const vndRows = goldState.vndRows;
  const goldLoading =
    goldState.status === "idle" || goldState.status === "loading";
  const fxLoading =
    fxState.status === "idle" || fxState.status === "loading";

  useEffect(() => {
    const id = setTimeout(() => {
      setDateLine(
        new Date().toLocaleDateString(intlLocaleForApp(language), {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
      );
    }, 0);
    return () => clearTimeout(id);
  }, [language]);

  const worldCard = useMemo(() => {
    if (!world) {
      return {
        value: goldLoading ? t.loading : "—",
        change: undefined as number | undefined,
      };
    }
    return {
      value: `$${world.buy.toLocaleString(intlLocale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      change: world.changePercent,
    };
  }, [world, goldLoading, intlLocale, t.loading]);

  const domesticAvg = useMemo(
    () => averageVndDomesticBuySell(vndRows),
    [vndRows],
  );

  const avgBuyCard = useMemo(() => {
    if (!domesticAvg) {
      return {
        value: goldLoading ? t.loading : "—",
        change: undefined as number | undefined,
      };
    }
    return {
      value: formatDomesticMain(
        domesticAvg.avgBuy,
        goldUnit,
        currency,
        usdRate,
        intlLocale,
      ),
      change: domesticAvg.avgBuyPct,
    };
  }, [domesticAvg, goldLoading, goldUnit, currency, usdRate, intlLocale, t.loading]);

  const avgSellCard = useMemo(() => {
    if (!domesticAvg) {
      return {
        value: goldLoading ? t.loading : "—",
        change: undefined as number | undefined,
      };
    }
    return {
      value: formatDomesticMain(
        domesticAvg.avgSell,
        goldUnit,
        currency,
        usdRate,
        intlLocale,
      ),
      change: domesticAvg.avgSellPct,
    };
  }, [domesticAvg, goldLoading, goldUnit, currency, usdRate, intlLocale, t.loading]);

  const fxCard = useMemo(() => {
    const code = DASHBOARD_FX_CODE;
    const rate = fxState.vndPerUnit[code];
    return {
      value:
        rate != null && rate > 0
          ? formatFxRateVnd(rate, intlLocale)
          : fxLoading
            ? t.loading
            : "—",
      subValue: t.dashboardStatVndPer1.replace("{code}", code),
    };
  }, [fxState.vndPerUnit, fxLoading, intlLocale, t.loading, t.dashboardStatVndPer1]);

  const unitSub = goldUnit === "chi" ? t.perChi : t.perLuong;

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 pb-24 md:pb-6">
      <div>
        <h1 className="text-xl font-bold text-[var(--text-primary)]">
          {t.dashboard}
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-0.5 break-words leading-snug">
          {t.realtime}
          {dateLine ? ` · ${dateLine}` : ""}
        </p>
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          label={t.worldGold}
          value={worldCard.value}
          subValue="XAU/USD"
          change={worldCard.change}
          changeLabel={world ? t.vsPrevSession : undefined}
          icon={DollarSign}
          iconColor="#8B5CF6"
          glowGold
        />
        <StatsCard
          label={t.dashboardStatAvgBuy}
          value={avgBuyCard.value}
          subValue={unitSub}
          change={avgBuyCard.change}
          changeLabel={domesticAvg ? t.vsPrevSession : undefined}
          icon={CircleArrowDown}
          iconColor="#0EA5E9"
        />
        <StatsCard
          label={t.dashboardStatAvgSell}
          value={avgSellCard.value}
          subValue={unitSub}
          change={avgSellCard.change}
          changeLabel={domesticAvg ? t.vsPrevSession : undefined}
          icon={CircleArrowUp}
          iconColor="#10B981"
        />
        <StatsCard
          label={t.currency}
          value={fxCard.value}
          subValue={fxCard.subValue}
          icon={Coins}
          iconColor="#3B82F6"
        />
      </div>

      <Card className="min-w-0 max-w-full overflow-x-clip overflow-y-visible">
        <CardHeader className="pb-2 px-4 sm:px-5">
          <div className="flex items-center gap-2 flex-wrap">
            <CardTitle className="text-sm font-semibold text-[var(--text-primary)]">
              {t.spotGoldChartTitle}
            </CardTitle>
            <Badge variant="live">
              <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-[#10B981]" />
              {t.live}
            </Badge>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            {t.spotGoldChartSubtitle}
          </p>
        </CardHeader>
        <CardContent className="p-0 px-2 pb-4 sm:px-3">
          <div className="h-[min(62dvh,560px)] w-full min-h-[min(280px,55dvh)] sm:min-h-[300px]">
            <GoldPriceChart />
          </div>
        </CardContent>
      </Card>

      <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-3">
        <PriceChart />
        <PriceTicker />
      </div>
    </div>
  );
}
