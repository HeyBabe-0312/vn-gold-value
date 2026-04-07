import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
  getLocalCalendarDayString,
  writeFxCache,
} from "@/lib/exchange-rates-cache";

/**
 * Interval for re-checking gold + FX (FX network skipped when cache day matches today).
 */
export const FX_REDUX_STALE_MS = 10 * 60 * 1000;

export interface ExchangeRatesState {
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  lastFetchedAt: number | null;
  /** Local calendar day (`YYYY-MM-DD`) for which `vndPerUnit` is valid; drives daily cache. */
  cacheCalendarDay: string | null;
  vndPerUnit: Record<string, number>;
  lastUpdatedAt: string | null;
}

const initialState: ExchangeRatesState = {
  status: "idle",
  error: null,
  lastFetchedAt: null,
  cacheCalendarDay: null,
  vndPerUnit: {},
  lastUpdatedAt: null,
};

function hasTodayRatesInState(state: ExchangeRatesState): boolean {
  const today = getLocalCalendarDayString();
  return (
    state.cacheCalendarDay === today &&
    Object.keys(state.vndPerUnit).length > 0 &&
    typeof state.vndPerUnit.USD === "number" &&
    state.vndPerUnit.USD > 0 &&
    state.status === "succeeded"
  );
}

export const fetchExchangeRates = createAsyncThunk<
  { vndPerUnit: Record<string, number>; lastUpdatedAt: string | null },
  { force?: boolean } | void,
  { state: { exchangeRates: ExchangeRatesState } }
>(
  "exchangeRates/fetch",
  async () => {
    const res = await fetch("/api/exchange-rates");
    const json = (await res.json()) as {
      success?: boolean;
      vndPerUnit?: Record<string, number>;
      lastUpdatedAt?: string | null;
      error?: string;
    };

    if (!res.ok || !json.success || !json.vndPerUnit) {
      throw new Error(
        typeof json.error === "string" ? json.error : "Không tải được tỷ giá",
      );
    }

    const payload = {
      vndPerUnit: json.vndPerUnit,
      lastUpdatedAt: json.lastUpdatedAt ?? null,
    };
    writeFxCache(payload);
    return payload;
  },
  {
    condition: (arg, { getState }) => {
      const force =
        (arg && typeof arg === "object" ? !!arg.force : false) || false;
      if (force) return true;
      if (hasTodayRatesInState(getState().exchangeRates)) return false;
      return true;
    },
  },
);

const exchangeRatesSlice = createSlice({
  name: "exchangeRates",
  initialState,
  reducers: {
    hydrateExchangeRatesFromLocalCache(
      state,
      action: PayloadAction<{
        vndPerUnit: Record<string, number>;
        lastUpdatedAt: string | null;
        calendarDay: string;
      }>,
    ) {
      state.status = "succeeded";
      state.error = null;
      state.vndPerUnit = action.payload.vndPerUnit;
      state.lastUpdatedAt = action.payload.lastUpdatedAt;
      state.cacheCalendarDay = action.payload.calendarDay;
      state.lastFetchedAt = Date.now();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExchangeRates.pending, (state, action) => {
        const force =
          action.meta.arg &&
          typeof action.meta.arg === "object" &&
          !!action.meta.arg.force;
        const hasRates = Object.keys(state.vndPerUnit).length > 0;
        if (force || (!hasRates && !hasTodayRatesInState(state))) {
          state.status = "loading";
        }
        state.error = null;
      })
      .addCase(fetchExchangeRates.fulfilled, (state, action) => {
        const now = Date.now();
        state.status = "succeeded";
        state.error = null;
        state.vndPerUnit = action.payload.vndPerUnit;
        state.lastUpdatedAt = action.payload.lastUpdatedAt;
        state.lastFetchedAt = now;
        state.cacheCalendarDay = getLocalCalendarDayString();
      })
      .addCase(fetchExchangeRates.rejected, (state, action) => {
        const hadData = Object.keys(state.vndPerUnit).length > 0;
        if (hadData) {
          state.status = "succeeded";
          state.error =
            action.error.message ?? "Không cập nhật được tỷ giá mới nhất";
          return;
        }
        state.status = "failed";
        state.error = action.error.message ?? "Lỗi tải tỷ giá";
      });
  },
});

export const { hydrateExchangeRatesFromLocalCache } =
  exchangeRatesSlice.actions;
export const exchangeRatesReducer = exchangeRatesSlice.reducer;
