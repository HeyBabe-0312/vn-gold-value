"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { VnSetting, VnLocale, VnCurrency, VnWeightUnit } from "@/lib/vn-setting";
import {
  defaultVnSetting,
  readVnSettingFromLocalStorage,
  writeVnSettingCookie,
  writeVnSettingToLocalStorage
} from "@/lib/vn-setting";
import { useRouter } from "next/navigation";

interface VnSettingContextValue {
  setting: VnSetting;
  setLocale: (l: VnLocale) => void;
  setCurrency: (c: VnCurrency) => void;
  setWeightUnit: (u: VnWeightUnit) => void;
}

const VnSettingContext = createContext<VnSettingContextValue>({
  setting: defaultVnSetting,
  setLocale: () => {},
  setCurrency: () => {},
  setWeightUnit: () => {},
});

export function useVnSetting() {
  return useContext(VnSettingContext);
}

export function VnSettingProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [setting, setSetting] = useState<VnSetting>(defaultVnSetting);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Load from localStorage once on mount (client only).
    // Defer to avoid lint rule "set-state-in-effect".
    setTimeout(() => {
      const loaded = readVnSettingFromLocalStorage();
      setSetting(loaded);
      setHydrated(true);
    }, 0);
  }, []);

  // Persist to localStorage + cookie whenever setting changes (after hydration).
  useEffect(() => {
    if (!hydrated) return;
    writeVnSettingToLocalStorage(setting);
    // Cookie is used by next-intl middleware + server request config
    writeVnSettingCookie(setting);
  }, [setting, hydrated]);

  const api = useMemo<VnSettingContextValue>(() => {
    return {
      setting,
      setLocale: (l) => {
        const next = { ...setting, locale: l };
        // Write cookie immediately so the subsequent refresh reads the new locale.
        // (Otherwise router.refresh() may run before the persistence effect.)
        writeVnSettingToLocalStorage(next);
        writeVnSettingCookie(next);
        setSetting(next);
        // next-intl reads locale on server; refresh to re-render with new messages.
        setTimeout(() => router.refresh(), 0);
      },
      setCurrency: (c) => setSetting((prev) => ({ ...prev, currency: c })),
      setWeightUnit: (u) => setSetting((prev) => ({ ...prev, weightUnit: u })),
    };
  }, [router, setting]);

  return <VnSettingContext.Provider value={api}>{children}</VnSettingContext.Provider>;
}

