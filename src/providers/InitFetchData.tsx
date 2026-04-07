"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/store/hooks";
import {
  fetchExchangeRates,
  FX_REDUX_STALE_MS,
} from "@/store/exchangeRatesSlice";
import { fetchGoldPrices } from "@/store/goldPricesSlice";

/**
 * Invisible component mounted once at the app root (inside ReduxProvider).
 * Centralises all "initial load + periodic refresh" logic so individual pages
 * never need to dispatch these themselves.
 *
 * Strategy:
 *  1. Dispatch FX + gold fetches; thunk conditions skip if data is already fresh (in Redux only).
 *  2. Re-dispatch every FX_REDUX_STALE_MS (10 min); conditions still guard redundant calls.
 */
export function InitFetchData() {
  const dispatch = useAppDispatch();

  useEffect(() => {
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
