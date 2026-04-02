export type VnLocale = "vi" | "en";
export type VnCurrency = "VND" | "USD";
export type VnWeightUnit = "luong" | "chi";

export interface VnSetting {
  locale: VnLocale;
  currency: VnCurrency;
  weightUnit: VnWeightUnit;
}

export const VN_SETTING_KEY = "vn-gold-setting";

export const defaultVnSetting: VnSetting = {
  locale: "vi",
  currency: "VND",
  weightUnit: "luong",
};

export function parseVnSetting(
  raw: string | null | undefined,
): VnSetting | null {
  if (!raw) return null;
  try {
    const decoded = (() => {
      try {
        return decodeURIComponent(raw);
      } catch {
        return raw;
      }
    })();
    const parsed = JSON.parse(decoded) as Partial<VnSetting> | null;
    if (!parsed || typeof parsed !== "object") return null;
    const locale =
      parsed.locale === "en" || parsed.locale === "vi"
        ? parsed.locale
        : defaultVnSetting.locale;
    const currency =
      parsed.currency === "USD" || parsed.currency === "VND"
        ? parsed.currency
        : defaultVnSetting.currency;

    const weightUnit =
      parsed.weightUnit === "chi" || parsed.weightUnit === "luong"
        ? parsed.weightUnit
        : defaultVnSetting.weightUnit;

    return { locale, currency, weightUnit };
  } catch {
    return null;
  }
}

export function readVnSettingFromLocalStorage(): VnSetting {
  if (typeof window === "undefined") return defaultVnSetting;
  const parsed = parseVnSetting(localStorage.getItem(VN_SETTING_KEY));
  return parsed ?? defaultVnSetting;
}

export function writeVnSettingToLocalStorage(setting: VnSetting) {
  if (typeof window === "undefined") return;
  localStorage.setItem(VN_SETTING_KEY, JSON.stringify(setting));
}

export function writeVnSettingCookie(setting: VnSetting) {
  if (typeof document === "undefined") return;
  const value = encodeURIComponent(JSON.stringify(setting));
  // 1 year
  document.cookie = `${VN_SETTING_KEY}=${value}; path=/; max-age=${60 * 60 * 24 * 365}`;
}
