"use client";

import { useState, useCallback, useMemo } from "react";
import {
  ArrowLeftRight,
  RefreshCw,
  AlertCircle,
  ChevronDown,
  Check,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApp } from "@/providers/AppProvider";
import { cn, formatNumber } from "@/lib/utils";
import * as SelectPrimitive from "@radix-ui/react-select";
import { FX_ORDER, FX_CURRENCY_META } from "@/lib/fx-currencies";
import type { VnLocale } from "@/lib/vn-setting";
import { intlLocaleForApp } from "@/lib/vn-setting";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchExchangeRates } from "@/store/exchangeRatesSlice";

type CurrencyRow = {
  code: string;
  name: string;
  flag: string;
  rate: number;
};

function fxLabelForLocale(
  meta: (typeof FX_CURRENCY_META)[keyof typeof FX_CURRENCY_META],
  language: VnLocale,
): string {
  if (language === "vi") return meta.nameVi;
  if (language === "jp") return meta.nameJp;
  return meta.name;
}

function buildCurrencyList(
  vndPerUnit: Record<string, number>,
  language: VnLocale,
  vndDisplayName: string,
): CurrencyRow[] {
  const fx: CurrencyRow[] = FX_ORDER.map((code) => {
    const meta = FX_CURRENCY_META[code];
    const rate = vndPerUnit[code];
    return {
      code,
      name: fxLabelForLocale(meta, language),
      flag: meta.flag,
      rate: rate ?? 0,
    };
  });
  return [
    { code: "VND", name: vndDisplayName, flag: "🇻🇳", rate: 1 },
    ...fx,
  ];
}

function CurrencySelect({
  value,
  onChange,
  exclude,
  options,
}: {
  value: string;
  onChange: (val: string) => void;
  exclude?: string;
  options: CurrencyRow[];
}) {
  const selectable = options.filter((c) => c.code !== exclude);
  const selected = options.find((c) => c.code === value);

  return (
    <SelectPrimitive.Root value={value} onValueChange={onChange}>
      <SelectPrimitive.Trigger className="flex h-10 w-full items-center justify-between rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] cursor-pointer transition-colors hover:bg-[var(--bg-card-hover)]">
        <div className="flex items-center gap-2">
          <span className="text-base">{selected?.flag}</span>
          <span className="font-mono font-semibold">{selected?.code}</span>
          <span className="text-[var(--text-muted)] text-xs hidden sm:block">{selected?.name}</span>
        </div>
        <ChevronDown className="h-4 w-4 text-[var(--text-muted)] shrink-0" />
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          className="z-50 max-h-72 w-[280px] overflow-hidden rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] shadow-[var(--shadow-lg)] animate-in fade-in-0 zoom-in-95"
          position="popper"
          sideOffset={8}
        >
          <SelectPrimitive.Viewport className="p-1">
            {selectable.map((opt) => (
              <SelectPrimitive.Item
                key={opt.code}
                value={opt.code}
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm outline-none cursor-pointer transition-colors hover:bg-[var(--bg-card-hover)] focus:bg-[var(--bg-card-hover)] text-[var(--text-primary)] data-[state=checked]:bg-[#F59E0B]/10 data-[state=checked]:text-[#F59E0B]"
              >
                <span className="text-base">{opt.flag}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold">{opt.code}</span>
                    <SelectPrimitive.ItemText className="sr-only">{opt.code}</SelectPrimitive.ItemText>
                    <span className="text-xs text-[var(--text-muted)] truncate">{opt.name}</span>
                  </div>
                </div>
                <SelectPrimitive.ItemIndicator>
                  <Check className="h-3.5 w-3.5 text-[#F59E0B]" />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}

function convertAmount(
  amount: number,
  from: string,
  to: string,
  currencies: CurrencyRow[],
): number {
  const fromCur = currencies.find((c) => c.code === from);
  const toCur = currencies.find((c) => c.code === to);
  if (!fromCur || !toCur || fromCur.rate <= 0 || toCur.rate <= 0) return 0;
  const inVnd = from === "VND" ? amount : amount * fromCur.rate;
  return to === "VND" ? inVnd : inVnd / toCur.rate;
}

function formatFxMeta(iso: string | null, locale: string) {
  if (!iso) return null;
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString(locale, {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function ConverterPage() {
  const { t, language } = useApp();
  const vndLabel = t.currencyNameVnd;
  const dispatch = useAppDispatch();
  const fxState = useAppSelector((s) => s.exchangeRates);

  const [fromCur, setFromCur] = useState("VND");
  const [toCur, setToCur] = useState("USD");
  const [amount, setAmount] = useState("1000000");
  const [isSwapping, setIsSwapping] = useState(false);


  const currencies = useMemo(
    () => buildCurrencyList(fxState.vndPerUnit, language, vndLabel),
    [fxState.vndPerUnit, language, vndLabel],
  );

  const ready =
    fxState.status === "succeeded" &&
    FX_ORDER.every((c) => (fxState.vndPerUnit[c] ?? 0) > 0);

  const numAmount = parseFloat(amount.replace(/,/g, "")) || 0;
  const result = ready
    ? convertAmount(numAmount, fromCur, toCur, currencies)
    : 0;
  const crossRate = ready ? convertAmount(1, fromCur, toCur, currencies) : 0;

  const handleSwap = useCallback(() => {
    if (!ready) return;
    setIsSwapping(true);
    setTimeout(() => {
      setFromCur(toCur);
      setToCur(fromCur);
      setAmount(result.toFixed(0));
      setIsSwapping(false);
    }, 200);
  }, [fromCur, toCur, result, ready]);

  const handleAmountChange = (val: string) => {
    const cleaned = val.replace(/[^0-9.]/g, "");
    setAmount(cleaned);
  };

  const handleRefresh = () => {
    void dispatch(fetchExchangeRates({ force: true }));
  };

  const locale = intlLocaleForApp(language);
  const updatedLabel = formatFxMeta(fxState.lastUpdatedAt, locale);

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 pb-24 md:pb-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">{t.converter}</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            {t.converterSubtitle}
          </p>
          {updatedLabel && (
            <p className="text-[11px] text-[var(--text-muted)] mt-1 font-mono">
              {t.converterLastUpdatedUtc}: {updatedLabel}
            </p>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 font-mono text-xs"
          onClick={handleRefresh}
          disabled={fxState.status === "loading"}
        >
          <RefreshCw
            className={cn("h-3.5 w-3.5", fxState.status === "loading" && "animate-spin")}
          />
          {t.refresh}
        </Button>
      </div>

      {fxState.status === "failed" && Object.keys(fxState.vndPerUnit).length === 0 && (
        <div className="flex items-center gap-2 rounded-xl border border-[#EF4444]/30 bg-[#EF4444]/5 px-4 py-3 text-sm text-[#EF4444]">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <div>
            <p className="font-medium">{fxState.error}</p>
            <p className="text-xs mt-1 opacity-90">
              {t.converterEnvKeyHint}
            </p>
          </div>
        </div>
      )}

      {fxState.error && fxState.status === "succeeded" && (
        <div className="flex items-center gap-2 rounded-xl border border-[#F59E0B]/30 bg-[#F59E0B]/5 px-4 py-2 text-xs text-[var(--text-secondary)]">
          <AlertCircle className="h-3.5 w-3.5 shrink-0 text-[#F59E0B]" />
          {fxState.error}
        </div>
      )}

      <Card glowGold className="max-w-2xl">
        <CardContent className="p-6 relative">
          {fxState.status === "loading" && !ready && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-[var(--bg-card)]/80 backdrop-blur-sm">
              <p className="text-sm text-[var(--text-muted)] font-mono">
                {t.converterLoadingRates}
              </p>
            </div>
          )}

          <div className="space-y-2 mb-4">
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              {t.from}
            </label>
            <div className="flex gap-3">
              <div className="flex-1">
                <Input
                  type="text"
                  inputMode="numeric"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  className="text-lg font-mono font-semibold h-12"
                  placeholder="0"
                  disabled={!ready}
                />
              </div>
              <div className="w-48 shrink-0">
                <CurrencySelect
                  value={fromCur}
                  onChange={setFromCur}
                  exclude={toCur}
                  options={currencies}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center my-4">
            <div className="flex-1 h-px bg-[var(--border-default)]" />
            <Button
              variant="secondary"
              size="icon"
              onClick={handleSwap}
              disabled={!ready}
              className="mx-4 h-10 w-10 rounded-full border-2 border-[#F59E0B]/30 hover:border-[#F59E0B]/60 hover:bg-[#F59E0B]/5 transition-all"
            >
              <ArrowLeftRight className={cn("h-4 w-4 text-[#F59E0B] transition-transform duration-200", isSwapping && "rotate-180")} />
            </Button>
            <div className="flex-1 h-px bg-[var(--border-default)]" />
          </div>

          <div className="space-y-2 mb-6">
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              {t.to}
            </label>
            <div className="flex gap-3">
              <div className="flex-1">
                <div className="flex h-12 w-full items-center rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)] px-3 py-2">
                  <span className="text-lg font-mono font-bold text-[var(--text-primary)] truncate">
                    {ready
                      ? formatNumber(
                          result,
                          toCur === "VND" ? 0 : toCur === "JPY" || toCur === "KRW" ? 2 : 4,
                        )
                      : "—"}
                  </span>
                </div>
              </div>
              <div className="w-48 shrink-0">
                <CurrencySelect
                  value={toCur}
                  onChange={setToCur}
                  exclude={fromCur}
                  options={currencies}
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs text-[var(--text-muted)] mb-1">{t.exchangeRate}</p>
                {ready && crossRate > 0 ? (
                  <>
                    <p className="text-sm font-mono font-semibold text-[var(--text-primary)]">
                      1 {fromCur} = {formatNumber(crossRate, 6)} {toCur}
                    </p>
                    <p className="text-xs font-mono text-[var(--text-muted)] mt-0.5">
                      1 {toCur} = {formatNumber(1 / crossRate, 6)} {fromCur}
                    </p>
                  </>
                ) : (
                  <p className="text-sm font-mono text-[var(--text-muted)]">—</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-base font-semibold text-[var(--text-primary)] mb-3">
          {t.currencyRatesTitle}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {FX_ORDER.map((code) => {
            const meta = FX_CURRENCY_META[code];
            const vnd = fxState.vndPerUnit[code];
            const name = fxLabelForLocale(meta, language);
            const has = vnd != null && vnd > 0;
            return (
              <Card
                key={code}
                className={cn(
                  "transition-all",
                  has && "hover:bg-[var(--bg-card-hover)] cursor-pointer hover:border-[#F59E0B]/30 hover:shadow-[0_0_0_1px_rgba(245,158,11,0.2)]",
                )}
                onClick={() => {
                  if (!has) return;
                  setFromCur("VND");
                  setToCur(code);
                  setAmount("1000000");
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{meta.flag}</span>
                    <div>
                      <p className="text-sm font-mono font-bold text-[var(--text-primary)]">{code}</p>
                      <p className="text-xs text-[var(--text-muted)]">{name}</p>
                    </div>
                  </div>
                  <p className="text-base font-mono font-semibold text-[var(--text-primary)]">
                    {has ? (
                      <>
                        {Math.round(vnd).toLocaleString(locale)} ₫
                        <span className="block text-[10px] font-normal text-[var(--text-muted)] mt-0.5">
                          / 1 {code}
                        </span>
                      </>
                    ) : (
                      <span className="text-[var(--text-muted)]">—</span>
                    )}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
