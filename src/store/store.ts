import { configureStore } from "@reduxjs/toolkit";
import { goldPricesReducer } from "./goldPricesSlice";
import { exchangeRatesReducer } from "./exchangeRatesSlice";

export const store = configureStore({
  reducer: {
    goldPrices: goldPricesReducer,
    exchangeRates: exchangeRatesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

