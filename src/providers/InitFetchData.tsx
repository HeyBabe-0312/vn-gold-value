"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/store/hooks";
import {
  fetchExchangeRates,
  FX_REDUX_STALE_MS,
  hydrateExchangeRatesFromLocalCache,
} from "@/store/exchangeRatesSlice";
import { readValidFxCacheForToday } from "@/lib/exchange-rates-cache";
import { fetchGoldPrices } from "@/store/goldPricesSlice";

/**
 * Invisible component mounted once at the app root (inside ReduxProvider).
 * Centralises all "initial load + periodic refresh" logic so individual pages
 * never need to dispatch these themselves.
 *
 * Strategy:
 *  1. FX: hydrate from localStorage if cache is for today (local date); else fetch. Daily cache
 *     avoids repeat /api/exchange-rates calls until the next calendar day (or force refresh).
 *  2. Re-dispatch on interval; FX thunk skips network when Redux already holds today’s rates.
 */
export function InitFetchData() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const cached = readValidFxCacheForToday();
    if (cached) {
      dispatch(
        hydrateExchangeRatesFromLocalCache({
          vndPerUnit: cached.vndPerUnit,
          lastUpdatedAt: cached.lastUpdatedAt,
          calendarDay: cached.calendarDay,
        }),
      );
    }
    void dispatch(fetchExchangeRates());
    /** One forced fetch per tab session so the first visit bypasses Next’s ~5m gold cache (`?refresh=1`). */
    let goldForce = false;
    if (typeof sessionStorage !== "undefined") {
      goldForce = !sessionStorage.getItem("vn-gold-gold-prices-session");
      if (goldForce) sessionStorage.setItem("vn-gold-gold-prices-session", "1");
    }
    void dispatch(fetchGoldPrices({ force: goldForce }));

    const id = setInterval(() => {
      void dispatch(fetchExchangeRates());
      void dispatch(fetchGoldPrices({ force: false }));
    }, FX_REDUX_STALE_MS);

    return () => clearInterval(id);
  }, [dispatch]);

  return null;
}
