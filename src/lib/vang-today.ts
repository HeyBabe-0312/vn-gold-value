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

/** API `time` / `date` are wall clock in Vietnam (ICT, +07, no DST). */
export interface VangTodayClockMeta {
  time?: string;
  date?: string;
  timestamp?: number;
}

/**
 * Prefer `timestamp` (Unix UTC from API). Otherwise parse `date` + `time` as Asia/Ho_Chi_Minh.
 */
export function goldPricesInstantFromMeta(meta: VangTodayClockMeta): Date | null {
  if (typeof meta.timestamp === "number" && Number.isFinite(meta.timestamp)) {
    return new Date(meta.timestamp * 1000);
  }
  return parseVietnamWallDateTime(meta.date, meta.time);
}

function parseVietnamWallDateTime(date?: string, time?: string): Date | null {
  if (!date?.trim() || !time?.trim()) return null;
  const d = date.trim();
  const t = time.trim();

  let y: string;
  let mo: string;
  let day: string;

  const isoYmd = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d);
  if (isoYmd) {
    y = isoYmd[1];
    mo = isoYmd[2];
    day = isoYmd[3];
  } else {
    const dmY = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(d);
    if (!dmY) return null;
    day = dmY[1].padStart(2, "0");
    mo = dmY[2].padStart(2, "0");
    y = dmY[3];
  }

  const tp = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(t);
  if (!tp) return null;
  const h = tp[1].padStart(2, "0");
  const mi = tp[2];
  const s = (tp[3] ?? "00").padStart(2, "0");

  const isoInstant = `${y}-${mo}-${day}T${h}:${mi}:${s}+07:00`;
  const out = new Date(isoInstant);
  return Number.isNaN(out.getTime()) ? null : out;
}

/** Renders the update instant in the user's local timezone (browser default). */
export function formatGoldPricesUpdatedLocal(
  meta: VangTodayClockMeta,
  intlLocale: string,
  options?: Intl.DateTimeFormatOptions,
): string | null {
  const instant = goldPricesInstantFromMeta(meta);
  if (!instant) return null;
  return instant.toLocaleString(intlLocale, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    ...options,
  });
}
