import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

/**
 * In-memory TTL: 10 min.
 * Thunk `condition` skip-guard and InitFetchData interval use this.
 */
export const FX_REDUX_STALE_MS = 10 * 60 * 1000;

export interface ExchangeRatesState {
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  lastFetchedAt: number | null;
  vndPerUnit: Record<string, number>;
  lastUpdatedAt: string | null;
}

const initialState: ExchangeRatesState = {
  status: "idle",
  error: null,
  lastFetchedAt: null,
  vndPerUnit: {},
  lastUpdatedAt: null,
};

export function isExchangeRatesFresh(state: ExchangeRatesState): boolean {
  return (
    state.status === "succeeded" &&
    state.lastFetchedAt != null &&
    Date.now() - state.lastFetchedAt < FX_REDUX_STALE_MS &&
    Object.keys(state.vndPerUnit).length > 0
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

    return {
      vndPerUnit: json.vndPerUnit,
      lastUpdatedAt: json.lastUpdatedAt ?? null,
    };
  },
  {
    condition: (arg, { getState }) => {
      const force =
        (arg && typeof arg === "object" ? !!arg.force : false) || false;
      if (force) return true;
      return !isExchangeRatesFresh(getState().exchangeRates);
    },
  },
);

const exchangeRatesSlice = createSlice({
  name: "exchangeRates",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchExchangeRates.pending, (state, action) => {
        const force =
          action.meta.arg &&
          typeof action.meta.arg === "object" &&
          !!action.meta.arg.force;
        const hasRates = Object.keys(state.vndPerUnit).length > 0;
        if (force || (!hasRates && !isExchangeRatesFresh(state))) {
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

export const exchangeRatesReducer = exchangeRatesSlice.reducer;
