import type { GoldWeightUnit } from "@/lib/gold-units";
import { CHI_PER_LUONG } from "@/lib/gold-units";

export type PersonalAssetsMap = Record<string, number>;

/** localStorage giữ số lượng theo "lượng" (API: VND/lượng). */
export const PERSONAL_ASSETS_KEY = "vn-gold-personal-assets";
export const PERSONAL_ASSETS_EVENT = "vn-gold-personal-assets-updated";

export function loadPersonalAssets(): PersonalAssetsMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(PERSONAL_ASSETS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};

    const out: PersonalAssetsMap = {};
    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
      const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN;
      if (!Number.isFinite(n) || n <= 0) continue;
      out[k] = n;
    }
    return out;
  } catch {
    return {};
  }
}

export function savePersonalAssets(map: PersonalAssetsMap) {
  if (typeof window === "undefined") return;
  const cleaned: PersonalAssetsMap = {};
  for (const [k, v] of Object.entries(map)) {
    const n = Number(v);
    if (!Number.isFinite(n) || n <= 0) continue;
    cleaned[k] = n;
  }
  localStorage.setItem(PERSONAL_ASSETS_KEY, JSON.stringify(cleaned));
  try {
    window.dispatchEvent(new Event(PERSONAL_ASSETS_EVENT));
  } catch {
    /* ignore */
  }
}

export function displayQtyLuongToUnit(qtyLuong: number, unit: GoldWeightUnit) {
  return unit === "chi" ? qtyLuong * CHI_PER_LUONG : qtyLuong;
}

export function deltaLuongForUnitStep(stepInUnit: number, unit: GoldWeightUnit) {
  // Step hiển thị: 1 "lượng" hoặc 1 "chỉ" -> quy về lượng.
  return unit === "chi" ? stepInUnit / CHI_PER_LUONG : stepInUnit;
}

export function formatQty(value: number) {
  // Không làm tròn thừa; giữ tối đa 2 chữ số sau dấu cho lượng kiểu 0.1 khi đang ở chế độ "chỉ".
  const v = Math.max(0, value);
  const s = v.toString();
  if (s.includes(".")) return v.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
  return v.toString();
}

