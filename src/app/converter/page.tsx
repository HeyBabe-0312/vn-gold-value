"use client";

import { useState, useCallback } from "react";
import { ArrowLeftRight, TrendingUp, TrendingDown, ChevronDown, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CURRENCY_RATES } from "@/lib/mock-data";
import { useApp } from "@/providers/AppProvider";
import { cn, formatNumber } from "@/lib/utils";
import * as SelectPrimitive from "@radix-ui/react-select";

const ALL_CURRENCIES = [
  { code: "VND", name: "Việt Nam Đồng", flag: "🇻🇳", rate: 1 },
  ...CURRENCY_RATES.map((r) => ({ code: r.code, name: r.name, flag: r.flag, rate: r.rate })),
];

function CurrencySelect({
  value,
  onChange,
  exclude,
}: {
  value: string;
  onChange: (val: string) => void;
  exclude?: string;
}) {
  const options = ALL_CURRENCIES.filter((c) => c.code !== exclude);
  const selected = ALL_CURRENCIES.find((c) => c.code === value);

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
            {options.map((opt) => (
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

function convertAmount(amount: number, from: string, to: string): number {
  const fromCur = ALL_CURRENCIES.find((c) => c.code === from);
  const toCur = ALL_CURRENCIES.find((c) => c.code === to);
  if (!fromCur || !toCur) return 0;
  const inVnd = from === "VND" ? amount : amount * fromCur.rate;
  return to === "VND" ? inVnd : inVnd / toCur.rate;
}

export default function ConverterPage() {
  const { t } = useApp();
  const [fromCur, setFromCur] = useState("VND");
  const [toCur, setToCur] = useState("USD");
  const [amount, setAmount] = useState("1000000");
  const [isSwapping, setIsSwapping] = useState(false);

  const numAmount = parseFloat(amount.replace(/,/g, "")) || 0;
  const result = convertAmount(numAmount, fromCur, toCur);

  const fromData = ALL_CURRENCIES.find((c) => c.code === fromCur);
  const toData = ALL_CURRENCIES.find((c) => c.code === toCur);

  const rate = convertAmount(1, fromCur, toCur);

  const handleSwap = useCallback(() => {
    setIsSwapping(true);
    setTimeout(() => {
      setFromCur(toCur);
      setToCur(fromCur);
      setAmount(result.toFixed(0));
      setIsSwapping(false);
    }, 200);
  }, [fromCur, toCur, result]);

  const handleAmountChange = (val: string) => {
    const cleaned = val.replace(/[^0-9.]/g, "");
    setAmount(cleaned);
  };

  const rateData = CURRENCY_RATES.find((r) => r.code === toCur || r.code === fromCur);
  const rateChange = rateData?.change ?? 0;

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 pb-24 md:pb-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[var(--text-primary)]">{t.converter}</h1>
        <p className="text-sm text-[var(--text-muted)] mt-0.5">Chuyển đổi nhanh các loại tiền tệ</p>
      </div>

      {/* Converter card */}
      <Card glowGold className="max-w-2xl">
        <CardContent className="p-6">
          {/* From */}
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
                />
              </div>
              <div className="w-48 shrink-0">
                <CurrencySelect value={fromCur} onChange={setFromCur} exclude={toCur} />
              </div>
            </div>
          </div>

          {/* Swap button */}
          <div className="flex items-center justify-center my-4">
            <div className="flex-1 h-px bg-[var(--border-default)]" />
            <Button
              variant="secondary"
              size="icon"
              onClick={handleSwap}
              className="mx-4 h-10 w-10 rounded-full border-2 border-[#F59E0B]/30 hover:border-[#F59E0B]/60 hover:bg-[#F59E0B]/5 transition-all"
            >
              <ArrowLeftRight className={cn("h-4 w-4 text-[#F59E0B] transition-transform duration-200", isSwapping && "rotate-180")} />
            </Button>
            <div className="flex-1 h-px bg-[var(--border-default)]" />
          </div>

          {/* To */}
          <div className="space-y-2 mb-6">
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              {t.to}
            </label>
            <div className="flex gap-3">
              <div className="flex-1">
                <div className="flex h-12 w-full items-center rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)] px-3 py-2">
                  <span className="text-lg font-mono font-bold text-[var(--text-primary)] truncate">
                    {formatNumber(result, toCur === "VND" ? 0 : toCur === "JPY" || toCur === "KRW" ? 2 : 4)}
                  </span>
                </div>
              </div>
              <div className="w-48 shrink-0">
                <CurrencySelect value={toCur} onChange={setToCur} exclude={fromCur} />
              </div>
            </div>
          </div>

          {/* Rate info */}
          <div className="rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[var(--text-muted)] mb-1">{t.exchangeRate}</p>
                <p className="text-sm font-mono font-semibold text-[var(--text-primary)]">
                  1 {fromCur} = {formatNumber(rate, 4)} {toCur}
                </p>
                <p className="text-xs font-mono text-[var(--text-muted)] mt-0.5">
                  1 {toCur} = {formatNumber(1 / rate, 4)} {fromCur}
                </p>
              </div>
              {rateData && (
                <div className={cn(
                  "flex items-center gap-1 text-sm font-mono font-medium",
                  rateChange >= 0 ? "text-[#10B981]" : "text-[#EF4444]"
                )}>
                  {rateChange >= 0
                    ? <TrendingUp className="h-4 w-4" />
                    : <TrendingDown className="h-4 w-4" />
                  }
                  {rateChange >= 0 ? "+" : ""}{rateChange.toFixed(2)}%
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exchange rates table */}
      <div>
        <h2 className="text-base font-semibold text-[var(--text-primary)] mb-3">Tỷ giá ngoại tệ (VND)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {CURRENCY_RATES.map((rate) => {
            const isUp = rate.change >= 0;
            return (
              <Card
                key={rate.code}
                className="hover:bg-[var(--bg-card-hover)] transition-all cursor-pointer hover:border-[#F59E0B]/30 hover:shadow-[0_0_0_1px_rgba(245,158,11,0.2)]"
                onClick={() => {
                  setFromCur("VND");
                  setToCur(rate.code);
                  setAmount("1000000");
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{rate.flag}</span>
                      <div>
                        <p className="text-sm font-mono font-bold text-[var(--text-primary)]">{rate.code}</p>
                        <p className="text-xs text-[var(--text-muted)]">{rate.name}</p>
                      </div>
                    </div>
                    <div className={cn(
                      "flex items-center gap-0.5 text-xs font-mono font-medium",
                      isUp ? "text-[#10B981]" : "text-[#EF4444]"
                    )}>
                      {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {isUp ? "+" : ""}{rate.change.toFixed(2)}%
                    </div>
                  </div>
                  <p className="text-base font-mono font-semibold text-[var(--text-primary)]">
                    {rate.rate.toLocaleString("vi-VN")} ₫
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
