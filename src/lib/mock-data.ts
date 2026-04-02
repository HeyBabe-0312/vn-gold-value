export type GoldType = "SJC" | "DOJI" | "PNJ" | "24K" | "18K";

export interface GoldPrice {
  type: GoldType;
  buy: number;
  sell: number;
  change: number;
  changePercent: number;
  updatedAt: string;
}

export interface ChartDataPoint {
  time: string;
  price: number;
  volume: number;
}

export interface CurrencyRate {
  code: string;
  name: string;
  flag: string;
  rate: number;
  change: number;
}

export const GOLD_PRICES: GoldPrice[] = [
  {
    type: "SJC",
    buy: 118_500_000,
    sell: 120_500_000,
    change: 500_000,
    changePercent: 0.42,
    updatedAt: "10:15",
  },
  {
    type: "DOJI",
    buy: 118_200_000,
    sell: 120_200_000,
    change: 300_000,
    changePercent: 0.25,
    updatedAt: "10:14",
  },
  {
    type: "PNJ",
    buy: 117_800_000,
    sell: 119_800_000,
    change: -200_000,
    changePercent: -0.17,
    updatedAt: "10:13",
  },
  {
    type: "24K",
    buy: 112_000_000,
    sell: 114_000_000,
    change: 400_000,
    changePercent: 0.36,
    updatedAt: "10:15",
  },
  {
    type: "18K",
    buy: 84_000_000,
    sell: 86_000_000,
    change: 250_000,
    changePercent: 0.3,
    updatedAt: "10:12",
  },
];

/** Deterministic series so SSR và client khớp (không dùng Date/Math.random tại import). */
function generateChartData(
  basePrice: number,
  points: number,
): ChartDataPoint[] {
  const data: ChartDataPoint[] = [];
  let price = basePrice;

  for (let i = points - 1; i >= 0; i--) {
    const idx = points - 1 - i;
    const minutesFromStart = idx * 5;
    const total = 6 * 60 + minutesFromStart;
    const h = Math.floor(total / 60) % 24;
    const m = total % 60;
    const wave =
      Math.sin(idx * 0.35) * 130_000 + Math.cos(idx * 0.21) * 70_000;
    price = Math.max(
      Math.round(price + wave * 0.11),
      Math.floor(basePrice * 0.98),
    );
    data.push({
      time: `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`,
      price,
      volume: 110 + ((idx * 37) % 390),
    });
  }
  return data;
}

export const CHART_DATA = generateChartData(118_000_000, 48);

export const CURRENCY_RATES: CurrencyRate[] = [
  { code: "USD", name: "US Dollar", flag: "🇺🇸", rate: 25_340, change: 0.12 },
  { code: "EUR", name: "Euro", flag: "🇪🇺", rate: 27_850, change: -0.08 },
  {
    code: "GBP",
    name: "British Pound",
    flag: "🇬🇧",
    rate: 32_100,
    change: 0.21,
  },
  { code: "JPY", name: "Japanese Yen", flag: "🇯🇵", rate: 169, change: -0.15 },
  { code: "CNY", name: "Chinese Yuan", flag: "🇨🇳", rate: 3_490, change: 0.05 },
  {
    code: "SGD",
    name: "Singapore Dollar",
    flag: "🇸🇬",
    rate: 18_750,
    change: 0.09,
  },
  {
    code: "KRW",
    name: "South Korean Won",
    flag: "🇰🇷",
    rate: 17.8,
    change: -0.22,
  },
  { code: "THB", name: "Thai Baht", flag: "🇹🇭", rate: 697, change: 0.03 },
];

export const WORLD_GOLD_PRICE_USD = 3_124.5;
export const WORLD_GOLD_CHANGE = 12.3;
export const WORLD_GOLD_CHANGE_PERCENT = 0.4;

export const STATS = {
  totalVolume: "1,247",
  avgPrice: 118_750_000,
  highPrice: 121_200_000,
  lowPrice: 117_800_000,
  marketCap: "45.2T VND",
};

export const TRANSLATIONS = {
  vi: {
    dashboard: "Tổng quan",
    goldPrice: "Giá Vàng",
    converter: "Đổi tiền",
    realtime: "Thời gian thực",
    buy: "Mua",
    sell: "Bán",
    change: "Thay đổi",
    updatedAt: "Cập nhật",
    volume: "Khối lượng",
    high: "Cao nhất",
    low: "Thấp nhất",
    worldGold: "Vàng thế giới",
    currency: "Ngoại tệ",
    from: "Từ",
    to: "Đến",
    amount: "Số tiền",
    result: "Kết quả",
    exchangeRate: "Tỷ giá",
    marketOverview: "Tổng quan thị trường",
    priceChart: "Biểu đồ giá",
    goldTypes: "Loại vàng",
    todayStats: "Thống kê hôm nay",
    darkMode: "Chế độ tối",
    lightMode: "Chế độ sáng",
    language: "Ngôn ngữ",
    unitLuong: "Lượng",
    unitChi: "Chỉ",
    unitDisplay: "Đơn vị",
    perLuong: "VNĐ/lượng",
    perChi: "VNĐ/chỉ",
    apiPerLuongNote: "API: VND/lượng",
    assetsTitle: "Tài sản cá nhân",
    assetsItems: "món",
    assetsEmpty: "Chưa có dữ liệu",
    assetsTotal: "Tổng giá trị",
    assetsUnitHint: "Giá trị quy đổi theo {unit}",
    assetsListTitle: "Danh sách vàng",
    assetsPerUnitHint: "Giá mỗi đơn vị (API: VND/lượng) + nút +/− để cập nhật số lượng",
    assetsTotalLabel: "Tổng tiền",
    decrease: "Giảm",
    increase: "Tăng",
    save: "Lưu",
    saving: "Đang lưu...",
    savedOk: "Đã lưu!",
    menu: "Menu",
    market: "Thị trường",
    marketOpen: "Mở cửa",
    live: "Trực tiếp",
    api: "API",
    loading: "Đang tải…",
    updatedPrefix: "Cập nhật:",
    reference: "tham chiếu",
    spreadLabel: "Chênh lệch",
    volatilitySell: "Biến động (bán)",
    vsPrevSession: "so với phiên trước",
    sourceType: "Nguồn / loại",
    trend: "Xu hướng",
    noVndRecords: "Không có bản ghi VND.",
    loadingDomestic: "Đang tải giá trong nước…",
    worldGoldCardTitle: "Vàng thế giới (XAU/USD)",
    worldGoldPricesTitle: "Giá vàng thế giới",
    increaseLabel: "Tăng",
    decreaseLabel: "Giảm",
    retailPrice: "Giá bán lẻ",
    today: "hôm nay",
    vsYesterday: "vs hôm qua",
    amountUnit: "lượng",
    tradeVolumeUnit: "lượng giao dịch",
    currencyRatesTitle: "Tỷ giá ngoại tệ (VND)",
    assetsVndPerUnit: "VND/lượng",
  },
  en: {
    dashboard: "Dashboard",
    goldPrice: "Gold Price",
    converter: "Converter",
    realtime: "Real-time",
    buy: "Buy",
    sell: "Sell",
    change: "Change",
    updatedAt: "Updated",
    volume: "Volume",
    high: "High",
    low: "Low",
    worldGold: "World Gold",
    currency: "Currency",
    from: "From",
    to: "To",
    amount: "Amount",
    result: "Result",
    exchangeRate: "Exchange Rate",
    marketOverview: "Market Overview",
    priceChart: "Price Chart",
    goldTypes: "Gold Types",
    todayStats: "Today's Stats",
    darkMode: "Dark Mode",
    lightMode: "Light Mode",
    language: "Language",
    unitLuong: "Tael",
    unitChi: "Mace",
    unitDisplay: "Unit",
    perLuong: "VND/tael",
    perChi: "VND/mace",
    apiPerLuongNote: "API: VND per tael",
    assetsTitle: "My Assets",
    assetsItems: "items",
    assetsEmpty: "No data yet",
    assetsTotal: "Total value",
    assetsUnitHint: "Value shown per {unit}",
    assetsListTitle: "Gold list",
    assetsPerUnitHint: "Price per unit (API: VND per tael) + use +/− to update quantity",
    assetsTotalLabel: "Total",
    decrease: "Decrease",
    increase: "Increase",
    save: "Save",
    saving: "Saving...",
    savedOk: "Saved!",
    menu: "Menu",
    market: "Market",
    marketOpen: "Open",
    live: "Live",
    api: "API",
    loading: "Loading…",
    updatedPrefix: "Updated:",
    reference: "reference",
    spreadLabel: "Spread",
    volatilitySell: "Volatility (sell)",
    vsPrevSession: "vs previous session",
    sourceType: "Source / type",
    trend: "Trend",
    noVndRecords: "No VND records.",
    loadingDomestic: "Loading domestic prices…",
    worldGoldCardTitle: "World Gold (XAU/USD)",
    worldGoldPricesTitle: "World gold prices",
    increaseLabel: "Up",
    decreaseLabel: "Down",
    retailPrice: "Retail price",
    today: "today",
    vsYesterday: "vs yesterday",
    amountUnit: "tael",
    tradeVolumeUnit: "trades",
    currencyRatesTitle: "FX rates (VND)",
    assetsVndPerUnit: "VND/tael",
  },
};
