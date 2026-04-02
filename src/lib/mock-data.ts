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
  { type: "SJC", buy: 118_500_000, sell: 120_500_000, change: 500_000, changePercent: 0.42, updatedAt: "10:15" },
  { type: "DOJI", buy: 118_200_000, sell: 120_200_000, change: 300_000, changePercent: 0.25, updatedAt: "10:14" },
  { type: "PNJ", buy: 117_800_000, sell: 119_800_000, change: -200_000, changePercent: -0.17, updatedAt: "10:13" },
  { type: "24K", buy: 112_000_000, sell: 114_000_000, change: 400_000, changePercent: 0.36, updatedAt: "10:15" },
  { type: "18K", buy: 84_000_000, sell: 86_000_000, change: 250_000, changePercent: 0.30, updatedAt: "10:12" },
];

function generateChartData(basePrice: number, points: number): ChartDataPoint[] {
  const data: ChartDataPoint[] = [];
  const now = new Date();
  let price = basePrice;

  for (let i = points - 1; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 5 * 60 * 1000);
    const change = (Math.random() - 0.48) * 200_000;
    price = Math.max(price + change, basePrice * 0.98);
    data.push({
      time: time.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
      price: Math.round(price),
      volume: Math.round(Math.random() * 500 + 100),
    });
  }
  return data;
}

export const CHART_DATA = generateChartData(118_000_000, 48);

export const CURRENCY_RATES: CurrencyRate[] = [
  { code: "USD", name: "US Dollar", flag: "🇺🇸", rate: 25_340, change: 0.12 },
  { code: "EUR", name: "Euro", flag: "🇪🇺", rate: 27_850, change: -0.08 },
  { code: "GBP", name: "British Pound", flag: "🇬🇧", rate: 32_100, change: 0.21 },
  { code: "JPY", name: "Japanese Yen", flag: "🇯🇵", rate: 169, change: -0.15 },
  { code: "CNY", name: "Chinese Yuan", flag: "🇨🇳", rate: 3_490, change: 0.05 },
  { code: "SGD", name: "Singapore Dollar", flag: "🇸🇬", rate: 18_750, change: 0.09 },
  { code: "KRW", name: "South Korean Won", flag: "🇰🇷", rate: 17.8, change: -0.22 },
  { code: "THB", name: "Thai Baht", flag: "🇹🇭", rate: 697, change: 0.03 },
];

export const WORLD_GOLD_PRICE_USD = 3_124.5;
export const WORLD_GOLD_CHANGE = 12.3;
export const WORLD_GOLD_CHANGE_PERCENT = 0.40;

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
  },
};
