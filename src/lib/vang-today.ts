/** Types & parsing for https://www.vang.today/api/prices (see https://www.vang.today/vi/api) */

export interface VangTodayPriceEntry {
  name: string;
  buy: number;
  sell: number;
  change_buy: number;
  change_sell: number;
  currency: string;
}

export interface VangTodayPricesResponse {
  success: boolean;
  timestamp?: number;
  time?: string;
  date?: string;
  count?: number;
  prices?: Record<string, VangTodayPriceEntry>;
  /** Legacy shape from docs */
  current_time?: number;
  data?: Array<{
    type_code: string;
    buy: number;
    sell: number;
    change_buy: number;
    change_sell: number;
    update_time: number;
  }>;
}

/** Normalized row for UI (domestic VND + world USD) */
export interface GoldPriceRow {
  code: string;
  name: string;
  buy: number;
  sell: number;
  changeBuy: number;
  changeSell: number;
  currency: "VND" | "USD" | string;
  changePercent: number;
}

function percentFromChange(current: number, delta: number): number {
  const prev = current - delta;
  if (Math.abs(prev) < 1e-9) return 0;
  return (delta / prev) * 100;
}

export function normalizeVangTodayPrices(json: VangTodayPricesResponse): GoldPriceRow[] {
  if (json.prices && typeof json.prices === "object") {
    return Object.entries(json.prices).map(([code, p]) => {
      const isUsd = p.currency === "USD";
      const ref = isUsd && (!p.sell || p.sell === 0) ? p.buy : p.sell;
      const delta = isUsd && (!p.sell || p.sell === 0) ? p.change_buy : p.change_sell;
      return {
        code,
        name: p.name,
        buy: p.buy,
        sell: p.sell,
        changeBuy: p.change_buy,
        changeSell: p.change_sell,
        currency: p.currency,
        changePercent: percentFromChange(ref, delta),
      };
    });
  }

  if (Array.isArray(json.data)) {
    return json.data.map((d) => ({
      code: d.type_code,
      name: d.type_code,
      buy: d.buy,
      sell: d.sell,
      changeBuy: d.change_buy,
      changeSell: d.change_sell,
      currency: "VND",
      changePercent: percentFromChange(d.sell, d.change_sell),
    }));
  }

  return [];
}

export function filterDomesticVnd(rows: GoldPriceRow[]): GoldPriceRow[] {
  return rows.filter((r) => r.currency === "VND");
}

export function findWorldGold(rows: GoldPriceRow[]): GoldPriceRow | undefined {
  return rows.find((r) => r.code === "XAUUSD");
}

/** Prefer SJC 9999 per vang.today code list */
export function findReferenceSjc(rows: GoldPriceRow[]): GoldPriceRow | undefined {
  return (
    rows.find((r) => r.code === "SJL1L10") ??
    rows.find((r) => r.code === "VNGSJC") ??
    filterDomesticVnd(rows).sort((a, b) => b.sell - a.sell)[0]
  );
}
