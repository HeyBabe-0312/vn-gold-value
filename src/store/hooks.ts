import { useDispatch, useSelector, type TypedUseSelectorHook } from "react-redux";
import type { AppDispatch, RootState } from "./store";
import { DISPLAY_USD_VND_RATE } from "@/lib/gold-units";

// react-redux v9: prefer withTypes for correct thunk typing
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> =
  useSelector.withTypes<RootState>();

/**
 * Returns the live USD→VND rate from the exchange-rates Redux slice.
 * Falls back to the compiled-in constant while the first fetch is in flight.
 */
export function useUsdVndRate(): number {
  const rate = useAppSelector((s) => s.exchangeRates.vndPerUnit["USD"]);
  return typeof rate === "number" && rate > 0 ? rate : DISPLAY_USD_VND_RATE;
}

