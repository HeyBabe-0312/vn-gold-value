import type { FxCode } from "@/lib/fx-currencies";
import type { GoldPriceRow } from "@/lib/vang-today";

/**
 * Mã ngoại tệ hiển thị ở ô cuối dashboard (VND / 1 đơn vị).
 * Đổi thành `JPY`, `EUR`, … (trong `FX_ORDER`) nếu cần.
 */
export const DASHBOARD_FX_CODE: FxCode = "USD";

function percentFromChange(current: number, delta: number): number {
  const prev = current - delta;
  if (Math.abs(prev) < 1e-9) return 0;
  return (delta / prev) * 100;
}

/** Trung bình giá mua / bán và % biến động trung bình theo từng dòng trong nước (VND/lượng). */
export function averageVndDomesticBuySell(rows: GoldPriceRow[]): {
  avgBuy: number;
  avgSell: number;
  avgBuyPct: number;
  avgSellPct: number;
} | null {
  if (!rows.length) return null;
  const n = rows.length;
  let sumBuy = 0;
  let sumSell = 0;
  let sumBuyPct = 0;
  let sumSellPct = 0;
  for (const r of rows) {
    sumBuy += r.buy;
    sumSell += r.sell;
    sumBuyPct += percentFromChange(r.buy, r.changeBuy);
    sumSellPct += percentFromChange(r.sell, r.changeSell);
  }
  return {
    avgBuy: sumBuy / n,
    avgSell: sumSell / n,
    avgBuyPct: sumBuyPct / n,
    avgSellPct: sumSellPct / n,
  };
}
