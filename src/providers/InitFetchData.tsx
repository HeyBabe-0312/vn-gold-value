"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/store/hooks";
import {
  fetchExchangeRates,
  hydrateExchangeRatesFromStorage,
  FX_REDUX_STALE_MS,
} from "@/store/exchangeRatesSlice";
import { fetchGoldPrices } from "@/store/goldPricesSlice";

/**
 * Invisible component mounted once at the app root (inside ReduxProvider).
 * Centralises all "initial load + periodic refresh" logic so individual pages
 * never need to dispatch these themselves.
 *
 * Strategy:
 *  1. Synchronously hydrate exchange-rate Redux state from localStorage
 *     (instant, no network — UI immediately shows cached numbers).
 *  2. Dispatch both fetches; thunk conditions skip them if data is already fresh.
 *  3. Re-dispatch every FX_REDUX_STALE_MS (10 min); conditions still guard
 *     against redundant network calls if data updated by another trigger.
 */
export function InitFetchData() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(hydrateExchangeRatesFromStorage());
    void dispatch(fetchExchangeRates());
    void dispatch(fetchGoldPrices({ force: false }));

    const id = setInterval(() => {
      void dispatch(fetchExchangeRates());
      void dispatch(fetchGoldPrices({ force: false }));
    }, FX_REDUX_STALE_MS);

    return () => clearInterval(id);
  }, [dispatch]);

  return null;
}
