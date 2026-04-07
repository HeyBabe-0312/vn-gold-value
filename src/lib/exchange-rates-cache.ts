/** Client-only cache: one fetch per calendar day (local TZ) unless forced refresh. */

export const FX_LOCAL_STORAGE_KEY = "vn-gold-exchange-rates-v1";

export type FxLocalCacheV1 = {
  v: 1;
  /** `YYYY-MM-DD` in the user's local timezone when rates were saved. */
  calendarDay: string;
  vndPerUnit: Record<string, number>;
  lastUpdatedAt: string | null;
};

export function getLocalCalendarDayString(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function readFxCacheRaw(): FxLocalCacheV1 | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(FX_LOCAL_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    const o = parsed as Record<string, unknown>;
    if (o.v !== 1) return null;
    if (typeof o.calendarDay !== "string") return null;
    if (!o.vndPerUnit || typeof o.vndPerUnit !== "object") return null;
    return {
      v: 1,
      calendarDay: o.calendarDay,
      vndPerUnit: o.vndPerUnit as Record<string, number>,
      lastUpdatedAt:
        typeof o.lastUpdatedAt === "string" ? o.lastUpdatedAt : null,
    };
  } catch {
    return null;
  }
}

/** Cache entry only if it was saved for today's local calendar date. */
export function readValidFxCacheForToday(): FxLocalCacheV1 | null {
  const c = readFxCacheRaw();
  if (!c) return null;
  if (c.calendarDay !== getLocalCalendarDayString()) return null;
  if (Object.keys(c.vndPerUnit).length === 0) return null;
  if (typeof c.vndPerUnit.USD !== "number" || c.vndPerUnit.USD <= 0) {
    return null;
  }
  return c;
}

export function writeFxCache(payload: {
  vndPerUnit: Record<string, number>;
  lastUpdatedAt: string | null;
}): void {
  if (typeof window === "undefined") return;
  try {
    const entry: FxLocalCacheV1 = {
      v: 1,
      calendarDay: getLocalCalendarDayString(),
      vndPerUnit: payload.vndPerUnit,
      lastUpdatedAt: payload.lastUpdatedAt,
    };
    localStorage.setItem(FX_LOCAL_STORAGE_KEY, JSON.stringify(entry));
  } catch {
    /* quota / private mode */
  }
}
