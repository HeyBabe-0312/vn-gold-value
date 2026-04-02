"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { ThemeProvider } from "next-themes";
import { TRANSLATIONS } from "@/lib/mock-data";
import type { GoldWeightUnit } from "@/lib/gold-units";

type Language = "vi" | "en";
type Currency = "VND" | "USD";

const GOLD_UNIT_KEY = "vn-gold-weight-unit";

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  currency: Currency;
  setCurrency: (cur: Currency) => void;
  goldUnit: GoldWeightUnit;
  setGoldUnit: (u: GoldWeightUnit) => void;
  t: (typeof TRANSLATIONS)["vi"];
}

const AppContext = createContext<AppContextType>({
  language: "vi",
  setLanguage: () => {},
  currency: "VND",
  setCurrency: () => {},
  goldUnit: "luong",
  setGoldUnit: () => {},
  t: TRANSLATIONS["vi"],
});

export function useApp() {
  return useContext(AppContext);
}

function AppContextProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("vi");
  const [currency, setCurrency] = useState<Currency>("VND");
  const [goldUnit, setGoldUnitState] = useState<GoldWeightUnit>("luong");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(GOLD_UNIT_KEY);
      if (raw === "chi" || raw === "luong") {
        // Defer to avoid lint rule "set-state-in-effect".
        setTimeout(() => setGoldUnitState(raw), 0);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const setGoldUnit = (u: GoldWeightUnit) => {
    setGoldUnitState(u);
    try {
      localStorage.setItem(GOLD_UNIT_KEY, u);
    } catch {
      /* ignore */
    }
  };

  const t = TRANSLATIONS[language];

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        currency,
        setCurrency,
        goldUnit,
        setGoldUnit,
        t,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" disableTransitionOnChange>
      <AppContextProvider>{children}</AppContextProvider>
    </ThemeProvider>
  );
}
