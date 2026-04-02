import { configureStore } from "@reduxjs/toolkit";
import { goldPricesReducer } from "./goldPricesSlice";

export const store = configureStore({
  reducer: {
    goldPrices: goldPricesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

