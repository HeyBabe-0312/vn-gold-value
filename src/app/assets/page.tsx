"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Minus, Save, Wallet, Coins } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/providers/AppProvider";
import { intlLocaleForApp } from "@/lib/vn-setting";
import { CHI_PER_LUONG } from "@/lib/gold-units";
import {
  deltaLuongForUnitStep,
  displayQtyLuongToUnit,
  formatQty,
  loadPersonalAssets,
  savePersonalAssets,
  type PersonalAssetsMap,
} from "@/lib/personal-assets";

import { useAppSelector, useUsdVndRate } from "@/store/hooks";

function formatVnd(value: number) {
  if (!Number.isFinite(value)) return "—";
  if (value >= 1_000_000_000)
    return `${(value / 1_000_000_000).toFixed(2)}B VND`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M VND`;
  return `${Math.round(value).toLocaleString("vi-VN")} VND`;
}

export default function AssetsPage() {
  const { t, language, currency, goldUnit, setGoldUnit } = useApp();

  const [assetsDraft, setAssetsDraft] = useState<PersonalAssetsMap>({});
  const goldState = useAppSelector((s) => s.goldPrices);
  const usdVndRate = useUsdVndRate();
  const prices = goldState.vndRows;
  const loadingPrices =
    goldState.status === "idle" || goldState.status === "loading";
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  useEffect(() => {
    setTimeout(() => {
      setAssetsDraft(loadPersonalAssets());
    }, 0);
  }, []);

  const unitLabel = goldUnit === "chi" ? t.unitChi : t.unitLuong;
  const stepInUnit = 1;
  const stepLuong = deltaLuongForUnitStep(stepInUnit, goldUnit);

  const rows = useMemo(() => {
    const list = [...prices];
    // Sort theo giá bán giảm dần.
    list.sort((a, b) => b.sell - a.sell);
    return list;
  }, [prices]);

  const totalVnd = useMemo(() => {
    return rows.reduce(
      (sum, r) => sum + (assetsDraft[r.code] ?? 0) * r.sell,
      0,
    );
  }, [rows, assetsDraft]);

  const totalDisplay = useMemo(() => {
    if (currency === "USD") {
      const totalUsd = totalVnd / usdVndRate;
      return `$${totalUsd.toLocaleString(
        intlLocaleForApp(language),
        {
          maximumFractionDigits: 0,
        },
      )}`;
    }
    return formatVnd(totalVnd);
  }, [currency, totalVnd, language, usdVndRate]);

  const onChangeQty = (code: string, deltaLuong: number) => {
    setAssetsDraft((prev) => {
      const cur = prev[code] ?? 0;
      const next = cur + deltaLuong;
      if (next <= 0) {
        const nextMap = { ...prev };
        delete nextMap[code];
        return nextMap;
      }
      return { ...prev, [code]: next };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      savePersonalAssets(assetsDraft);
      setSavedMsg(t.savedOk);
      setTimeout(() => setSavedMsg(null), 1200);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 pb-24 md:pb-6">
      <div className="flex flex-col gap-3">
        <h1 className="text-xl font-bold text-[var(--text-primary)]">
          {t.assetsTitle}
        </h1>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Card className="w-full">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                    <Wallet className="h-4 w-4 text-[#F59E0B]" />
                    <span>{t.assetsTotal}</span>
                  </div>
                  <div className="text-2xl font-bold font-mono text-[var(--text-primary)] mt-1">
                    {totalDisplay}
                  </div>
                  <div className="text-xs text-[var(--text-muted)] font-mono mt-1">
                    {unitLabel && t.assetsUnitHint.replace("{unit}", unitLabel)}
                  </div>
                </div>
                <Badge variant="neutral" className="text-[10px]">
                  {loadingPrices ? "~" : "API"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <div className="flex w-full flex-wrap items-center gap-2 justify-end">
            {/* Reuse existing unit state (luong/chi) so this page matches other gold UI. */}
            <div
              className="flex rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] p-0.5"
              role="group"
              aria-label={t.unitDisplay}
            >
              <Button
                type="button"
                variant={goldUnit === "luong" ? "default" : "ghost"}
                size="sm"
                className="h-7 px-2.5 text-xs"
                onClick={() => setGoldUnit("luong")}
              >
                {t.unitLuong}
              </Button>
              <Button
                type="button"
                variant={goldUnit === "chi" ? "default" : "ghost"}
                size="sm"
                className="h-7 px-2.5 text-xs"
                onClick={() => setGoldUnit("chi")}
              >
                {t.unitChi}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="px-4 pt-4 pb-2">
            <div className="text-sm font-semibold text-[var(--text-primary)]">
              {t.assetsListTitle}
            </div>
            <div className="text-xs text-[var(--text-muted)] mt-1 font-mono">
              {t.assetsPerUnitHint}
            </div>
          </div>

          <div className="divide-y border-t border-[var(--border-default)]">
            {rows.map((r) => {
              const qtyLuong = assetsDraft[r.code] ?? 0;
              const qtyDisplay = displayQtyLuongToUnit(qtyLuong, goldUnit);
              const pricePerDisplayUnitVnd =
                goldUnit === "chi" ? r.sell / CHI_PER_LUONG : r.sell;

              const pricePerDisplayUnit =
                currency === "USD"
                  ? pricePerDisplayUnitVnd / usdVndRate
                  : pricePerDisplayUnitVnd;

              return (
                <div
                  key={r.code}
                  className="px-4 py-3 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[var(--text-primary)] truncate">
                      {r.name}
                    </div>
                    <div className="text-xs text-[var(--text-muted)] font-mono mt-0.5">
                      {currency === "USD" ? (
                        <>
                          ~${pricePerDisplayUnit.toFixed(2)}/
                          {unitLabel.toLowerCase()}
                        </>
                      ) : (
                        <>
                          {t.buy}: {formatVnd(pricePerDisplayUnit)} /{" "}
                          {unitLabel}
                        </>
                      )}
                      <span className="text-[10px] text-[var(--text-muted)]">
                        {" "}
                        · {r.code}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onChangeQty(r.code, -stepLuong)}
                      disabled={qtyLuong <= 0}
                      aria-label={t.decrease}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>

                    <div className="min-w-[72px] text-center">
                      <div className="text-base font-bold font-mono text-[var(--text-primary)]">
                        {formatQty(qtyDisplay)}
                      </div>
                      <div className="text-[11px] text-[var(--text-muted)]">
                        {unitLabel}
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="secondary"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onChangeQty(r.code, stepLuong)}
                      aria-label={t.increase}
                    >
                      <Plus className="h-4 w-4 text-[#F59E0B]" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {!loadingPrices && rows.length === 0 && (
            <div className="py-12 text-center text-[var(--text-muted)] text-sm">
              {t.assetsEmpty}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-4">
          <div>
            <div className="text-xs text-[var(--text-muted)]">
              {t.assetsTotalLabel}
            </div>
            <div className="text-lg font-bold font-mono text-[var(--text-primary)] mt-1">
              {totalDisplay}
            </div>
          </div>
          <div className="flex items-center gap-2 text-[#F59E0B]">
            <Coins className="h-4 w-4" />
            <span className="text-xs font-medium font-mono">
              {goldUnit === "chi" ? t.perChi : t.perLuong}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 justify-between">
          {savedMsg ? (
            <Badge variant="up" className="justify-center">
              {savedMsg}
            </Badge>
          ) : (
            <div />
          )}
          <Button
            type="button"
            variant="purple"
            className="h-11"
            onClick={() => void handleSave()}
            disabled={saving}
          >
            <Save className="h-4 w-4" />
            {saving ? t.saving : t.save}
          </Button>
        </div>
      </div>
    </div>
  );
}
