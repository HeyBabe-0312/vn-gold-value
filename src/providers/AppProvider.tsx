"use client";

import React, { createContext, useContext } from "react";
import { ThemeProvider } from "next-themes";
import { useMessages } from "next-intl";
import type { VnLocale } from "@/lib/vn-setting";
import { VnSettingProvider, useVnSetting } from "@/providers/VnSettingProvider";

interface AppContextType {
  language: VnLocale;
  setLanguage: (lang: VnLocale) => void;
  currency: "VND" | "USD";
  setCurrency: (cur: "VND" | "USD") => void;
  goldUnit: "luong" | "chi";
  setGoldUnit: (u: "luong" | "chi") => void;
  t: Record<string, string>;
}

const AppContext = createContext<AppContextType>({
  language: "vi",
  setLanguage: () => {},
  currency: "VND",
  setCurrency: () => {},
  goldUnit: "luong",
  setGoldUnit: () => {},
  t: {},
});

export function useApp() {
  return useContext(AppContext);
}

function AppContextProvider({ children }: { children: React.ReactNode }) {
  const { setting, setLocale, setCurrency, setWeightUnit } = useVnSetting();
  const messages = useMessages() as unknown as Record<string, string>;

  return (
    <AppContext.Provider
      value={{
        language: setting.locale,
        setLanguage: setLocale,
        currency: setting.currency,
        setCurrency,
        goldUnit: setting.weightUnit,
        setGoldUnit: setWeightUnit,
        t: messages,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" disableTransitionOnChange>
      <VnSettingProvider>
        <AppContextProvider>{children}</AppContextProvider>
      </VnSettingProvider>
    </ThemeProvider>
  );
}
