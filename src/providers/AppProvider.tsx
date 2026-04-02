"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { ThemeProvider } from "next-themes";
import { TRANSLATIONS } from "@/lib/mock-data";

type Language = "vi" | "en";
type Currency = "VND" | "USD";

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  currency: Currency;
  setCurrency: (cur: Currency) => void;
  t: (typeof TRANSLATIONS)["vi"];
}

const AppContext = createContext<AppContextType>({
  language: "vi",
  setLanguage: () => {},
  currency: "VND",
  setCurrency: () => {},
  t: TRANSLATIONS["vi"],
});

export function useApp() {
  return useContext(AppContext);
}

function AppContextProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("vi");
  const [currency, setCurrency] = useState<Currency>("VND");

  const t = TRANSLATIONS[language];

  return (
    <AppContext.Provider value={{ language, setLanguage, currency, setCurrency, t }}>
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
