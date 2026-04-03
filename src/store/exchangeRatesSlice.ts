import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const STORAGE_KEY = "vn-gold-fx-v1";

/** localStorage TTL: 24h. Cross-session bootstrap — UI shows cached data while fresh fetch runs. */
const FX_STORAGE_STALE_MS = 24 * 60 * 60 * 1000;

/**
 * Redux in-memory TTL: 10 min.
 * This is the boundary for the thunk's `condition` skip-guard and for InitFetchData's
 * auto-refresh interval. A rate fetch is skipped while data is younger than this.
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

function readLocalCache(): {
  fetchedAt: number;
  vndPerUnit: Record<string, number>;
  lastUpdatedAt: string | null;
} | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const c = JSON.parse(raw) as {
      fetchedAt?: number;
      vndPerUnit?: Record<string, number>;
      lastUpdatedAt?: string | null;
    };
    if (
      typeof c.fetchedAt !== "number" ||
      !c.vndPerUnit ||
      typeof c.vndPerUnit !== "object"
    ) {
      return null;
    }
    if (Date.now() - c.fetchedAt >= FX_STORAGE_STALE_MS) return null;
    return {
      fetchedAt: c.fetchedAt,
      vndPerUnit: c.vndPerUnit,
      lastUpdatedAt: c.lastUpdatedAt ?? null,
    };
  } catch {
    return null;
  }
}

function writeLocalCache(payload: {
  fetchedAt: number;
  vndPerUnit: Record<string, number>;
  lastUpdatedAt: string | null;
}) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* quota / private mode */
  }
}

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
  reducers: {
    /** Call once on client mount (before fetching) to preload cached data into Redux. */
    hydrateExchangeRatesFromStorage(state) {
      const cached = readLocalCache();
      if (!cached) return;
      state.status = "succeeded";
      state.error = null;
      state.lastFetchedAt = cached.fetchedAt;
      state.vndPerUnit = cached.vndPerUnit;
      state.lastUpdatedAt = cached.lastUpdatedAt;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExchangeRates.pending, (state, action) => {
        const force =
          action.meta.arg &&
          typeof action.meta.arg === "object" &&
          !!action.meta.arg.force;
        if (force || !isExchangeRatesFresh(state)) {
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
        writeLocalCache({
          fetchedAt: now,
          vndPerUnit: action.payload.vndPerUnit,
          lastUpdatedAt: action.payload.lastUpdatedAt,
        });
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

export const { hydrateExchangeRatesFromStorage } = exchangeRatesSlice.actions;
export const exchangeRatesReducer = exchangeRatesSlice.reducer;
