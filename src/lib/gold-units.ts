import type { VnLocale } from "@/lib/vn-setting";

/** Vàng VN: 1 lượng = 10 chỉ (quy ước hiển thị). API trả giá theo VND/lượng. */
export type GoldWeightUnit = "luong" | "chi";

export const CHI_PER_LUONG = 10;

/** Tỷ giá USD/VND dùng cho quy đổi hiển thị (ước lượng, không từ API). */
export const DISPLAY_USD_VND_RATE = 25_340;

/** Khối lượng vàng theo oz troy (quốc tế). */
export const GRAMS_PER_TROY_OZ = 31.1034768;

/** Lượng vàng trong nước (SJC): 37,5 g / lượng → 1 chỉ = 3,75 g. */
export const GRAMS_PER_LUONG_VN = 37.5;

/**
 * Từ giá spot VND/oz (đã nhân USD/oz × tỷ giá) → VND mỗi lượng VN,
 * rồi theo lựa chọn hiển thị lượng hoặc chỉ.
 */
export function vndPerOzSpotToVndDisplayUnit(
  vndPerOz: number,
  unit: GoldWeightUnit,
): number {
  const vndPerLuong = vndPerOz * (GRAMS_PER_LUONG_VN / GRAMS_PER_TROY_OZ);
  return unit === "chi" ? vndPerLuong / CHI_PER_LUONG : vndPerLuong;
}

export function vndLuongToDisplayAmount(
  vndPerLuong: number,
  unit: GoldWeightUnit,
): number {
  return unit === "chi" ? vndPerLuong / CHI_PER_LUONG : vndPerLuong;
}

/** Giá spot USD/oz → VND/oz (gần đúng). */
export function usdOzToApproxVndPerOz(
  usdPerOz: number,
  vndPerUsd: number = DISPLAY_USD_VND_RATE,
): number {
  return usdPerOz * vndPerUsd;
}

/** Hiển thị giá VND thế giới đã quy theo lượng/chỉ (số VND tuyệt đối cho 1 đơn vị đó). */
export function formatWorldGoldVndByUnit(
  vndInUnit: number,
  currency: "VND" | "USD",
  unit: GoldWeightUnit,
  language: VnLocale,
  usdRate: number = DISPLAY_USD_VND_RATE,
): string {
  const sep = /\B(?=(\d{3})+(?!\d))/g;
  const unitJp = unit === "luong" ? "両" : "銭";
  if (currency === "USD") {
    const usd = vndInUnit / usdRate;
    const s = `~$${usd.toFixed(0).replace(sep, ",")}`;
    if (language === "vi") {
      return `${s}/${unit === "luong" ? "lượng" : "chỉ"}`;
    }
    if (language === "jp") {
      return `${s}/${unitJp}`;
    }
    return `${s}/${unit === "luong" ? "tael" : "mace"}`;
  }
  if (language === "vi") {
    if (vndInUnit >= 1_000_000_000) {
      return `~${(vndInUnit / 1_000_000_000).toFixed(2)} tỷ VND/${unit === "luong" ? "lượng" : "chỉ"}`;
    }
    return `~${(vndInUnit / 1_000_000).toFixed(2)} triệu VND/${unit === "luong" ? "lượng" : "chỉ"}`;
  }
  if (language === "jp") {
    if (vndInUnit >= 100_000_000) {
      return `~${(vndInUnit / 100_000_000).toFixed(2)}億VND/${unitJp}`;
    }
    return `~${(vndInUnit / 1_000_000).toFixed(2)}百万VND/${unitJp}`;
  }
  if (vndInUnit >= 1_000_000_000) {
    return `~${(vndInUnit / 1_000_000_000).toFixed(2)}B VND/${unit === "luong" ? "tael" : "mace"}`;
  }
  return `~${(vndInUnit / 1_000_000).toFixed(2)}M VND/${unit === "luong" ? "tael" : "mace"}`;
}
