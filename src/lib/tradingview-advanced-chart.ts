import { useEffect, useState } from "react";

export const TRADINGVIEW_ADVANCED_CHART_SCRIPT =
  "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";

/** Config JSON for `embed-widget-advanced-chart.js` (script body). */
export interface TradingViewAdvancedChartConfig {
  autosize: boolean;
  symbol: string;
  interval: string;
  timezone: string;
  theme: "light" | "dark";
  backgroundColor: string;
  style: string;
  locale: string;
  support_host: string;
  withdateranges: boolean;
  hide_side_toolbar: boolean;
  allow_symbol_change: boolean;
  save_image: boolean;
  show_popup_button: boolean;
  calendar: boolean;
  studies?: string[];
  popup_width?: string;
  popup_height?: string;
}

/** Matches `globals.css` `--bg-card` for light / dark. */
export const TV_CHART_SURFACE: Record<"light" | "dark", string> = {
  light: "rgba(255, 255, 255, 1)",
  dark: "rgba(30, 41, 59, 1)",
};

export function resolveTradingViewTheme(
  resolvedTheme: string | undefined,
): "light" | "dark" {
  if (resolvedTheme === "dark") return "dark";
  if (resolvedTheme === "light") return "light";
  if (
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("dark")
  ) {
    return "dark";
  }
  return "light";
}

/**
 * Coarse width bucket so the TradingView iframe is re-created when crossing breakpoints.
 * The embed picks touch vs compact layout mainly at init time.
 */
export function useTradingViewChartLayoutBucket(): number {
  const [bucket, setBucket] = useState(0);

  useEffect(() => {
    const compute = () => {
      const w = window.innerWidth;
      const b = w < 640 ? 0 : w < 1024 ? 1 : 2;
      setBucket((prev) => (prev !== b ? b : prev));
    };
    compute();
    window.addEventListener("resize", compute);
    window.addEventListener("orientationchange", compute);
    return () => {
      window.removeEventListener("resize", compute);
      window.removeEventListener("orientationchange", compute);
    };
  }, []);

  return bucket;
}

/**
 * Remove scripts and iframe/content left by TradingView embed so a new config
 * (e.g. theme) can load without stale widgets.
 */
export function purgeTradingViewEmbedContainer(container: HTMLElement): void {
  container.querySelectorAll("script").forEach((s) => {
    s.remove();
  });
  const widgetHost = container.querySelector(
    ".tradingview-widget-container__widget",
  );
  if (widgetHost) {
    widgetHost.replaceChildren();
  }
}
