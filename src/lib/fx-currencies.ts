/** Metadata for FX pairs shown on the converter (rates come from API). */

export const FX_ORDER = [
  "USD",
  "EUR",
  "GBP",
  "JPY",
  "CNY",
  "SGD",
  "KRW",
  "THB",
] as const;

export type FxCode = (typeof FX_ORDER)[number];

export const FX_CURRENCY_META: Record<
  FxCode,
  { name: string; nameVi: string; nameJp: string; flag: string }
> = {
  USD: { name: "US Dollar", nameVi: "Đô la Mỹ", nameJp: "米ドル", flag: "🇺🇸" },
  EUR: { name: "Euro", nameVi: "Euro", nameJp: "ユーロ", flag: "🇪🇺" },
  GBP: { name: "British Pound", nameVi: "Bảng Anh", nameJp: "英ポンド", flag: "🇬🇧" },
  JPY: { name: "Japanese Yen", nameVi: "Yên Nhật", nameJp: "日本円", flag: "🇯🇵" },
  CNY: { name: "Chinese Yuan", nameVi: "Nhân dân tệ", nameJp: "人民元", flag: "🇨🇳" },
  SGD: {
    name: "Singapore Dollar",
    nameVi: "Đô la Singapore",
    nameJp: "シンガポールドル",
    flag: "🇸🇬",
  },
  KRW: { name: "South Korean Won", nameVi: "Won Hàn Quốc", nameJp: "韓国ウォン", flag: "🇰🇷" },
  THB: { name: "Thai Baht", nameVi: "Baht Thái", nameJp: "タイバーツ", flag: "🇹🇭" },
};

/** `currencies` query for CurrencyAPI `latest` (USD base; VND required to derive ₫/unit). */
export const EXCHANGE_API_CURRENCIES = [
  "VND",
  ...FX_ORDER.filter((c) => c !== "USD"),
].join(",");
