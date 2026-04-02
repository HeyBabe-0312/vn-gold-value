import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { GoldPriceRow } from "@/lib/vang-today";
import type { VangTodayPricesResponse } from "@/lib/vang-today";
import {
  normalizeVangTodayPrices,
  filterDomesticVnd,
  findWorldGold,
  findReferenceSjc,
} from "@/lib/vang-today";

const STALE_MS = 10 * 60 * 1000;

export interface GoldPricesMeta {
  time?: string;
  date?: string;
  timestamp?: number;
}

export interface GoldPricesState {
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  lastFetchedAt: number | null;

  meta: GoldPricesMeta;
  // Normalized rows for UI
  vndRows: GoldPriceRow[];
  worldGold: GoldPriceRow | undefined;
  sjcRef: GoldPriceRow | undefined;
}

const initialState: GoldPricesState = {
  status: "idle",
  error: null,
  lastFetchedAt: null,
  meta: {},
  vndRows: [],
  worldGold: undefined,
  sjcRef: undefined,
};

export const fetchGoldPrices = createAsyncThunk<
  {
    meta: GoldPricesMeta;
    vndRows: GoldPriceRow[];
    worldGold: GoldPriceRow | undefined;
    sjcRef: GoldPriceRow | undefined;
  },
  { force?: boolean } | void,
  { state: { goldPrices: GoldPricesState } }
>(
  "goldPrices/fetch",
  async (arg) => {
    const force = (arg && typeof arg === "object" ? !!arg.force : false) || false;
    const url = force ? "/api/gold-prices?refresh=1" : "/api/gold-prices";
    const res = await fetch(url);
    const json = (await res.json()) as VangTodayPricesResponse & { error?: string };

    if (!res.ok || !json.success) {
      const err =
        typeof (json as { error?: unknown }).error === "string"
          ? ((json as { error: string }).error ?? undefined)
          : undefined;
      throw new Error(err ?? "Không tải được dữ liệu");
    }

    const normalized = normalizeVangTodayPrices(json);
    const vndRows = filterDomesticVnd(normalized);
    const worldGold = findWorldGold(normalized);
    const sjcRef = findReferenceSjc(normalized);

    const current_time = (json as { current_time?: number }).current_time;
    const meta: GoldPricesMeta = {
      time: json.time,
      date: json.date,
      timestamp: json.timestamp ?? current_time,
    };

    return { meta, vndRows, worldGold, sjcRef };
  },
  {
    condition: (arg, { getState }) => {
      const force = (arg && typeof arg === "object" ? !!arg.force : false) || false;
      if (force) return true;
      const state = getState().goldPrices;
      if (!state.lastFetchedAt) return true;
      return Date.now() - state.lastFetchedAt > STALE_MS;
    },
  }
);

const goldPricesSlice = createSlice({
  name: "goldPrices",
  initialState,
  reducers: {
    clearGoldPrices(state) {
      state.status = "idle";
      state.error = null;
      state.lastFetchedAt = null;
      state.meta = {};
      state.vndRows = [];
      state.worldGold = undefined;
      state.sjcRef = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGoldPrices.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        fetchGoldPrices.fulfilled,
        (state, action) => {
          state.status = "succeeded";
          state.error = null;
          state.lastFetchedAt = Date.now();
          state.meta = action.payload.meta;
          state.vndRows = action.payload.vndRows;
          state.worldGold = action.payload.worldGold;
          state.sjcRef = action.payload.sjcRef;
        },
      )
      .addCase(fetchGoldPrices.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Lỗi tải dữ liệu";
      });
  },
});

export const { clearGoldPrices } = goldPricesSlice.actions;
export const goldPricesReducer = goldPricesSlice.reducer;

