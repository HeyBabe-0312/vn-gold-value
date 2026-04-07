"use client";

import { useEffect, useMemo, useRef } from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import {
  type TradingViewAdvancedChartConfig,
  TRADINGVIEW_ADVANCED_CHART_SCRIPT,
  TV_CHART_SURFACE,
  purgeTradingViewEmbedContainer,
  resolveTradingViewTheme,
  useTradingViewChartLayoutBucket,
} from "@/lib/tradingview-advanced-chart";

/** JPY per VND (inverse of VND/JPY quote). */
const SYMBOL = "FX_IDC:JPYVND";

const DEFAULT_CHART_CONFIG: TradingViewAdvancedChartConfig = {
  autosize: true,
  symbol: SYMBOL,
  interval: "5",
  timezone: "Asia/Ho_Chi_Minh",
  theme: "light",
  backgroundColor: "rgba(255, 255, 255, 1)",
  /** `3` = area chart (TradingView Advanced Chart widget). */
  style: "3",
  locale: "en",
  support_host: "https://www.tradingview.com",
  withdateranges: true,
  hide_side_toolbar: true,
  allow_symbol_change: true,
  save_image: false,
  show_popup_button: true,
  calendar: false,
};

export interface JpyVndChartProps {
  className?: string;
  /**
   * Merged onto defaults. `theme`, `backgroundColor`, `hide_side_toolbar`, `symbol`,
   * and `style` are forced for this embed (not overridable).
   */
  chartConfig?: Partial<TradingViewAdvancedChartConfig>;
}

export function JpyVndChart({ className, chartConfig }: JpyVndChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const layoutBucket = useTradingViewChartLayoutBucket();
  const { resolvedTheme, theme } = useTheme();
  const configKey = useMemo(
    () => JSON.stringify(chartConfig ?? {}),
    [chartConfig],
  );

  const tvThemeKey = resolveTradingViewTheme(resolvedTheme);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    purgeTradingViewEmbedContainer(container);

    const overrides = JSON.parse(
      configKey,
    ) as Partial<TradingViewAdvancedChartConfig>;
    const tvTheme = resolveTradingViewTheme(resolvedTheme);
    const config: TradingViewAdvancedChartConfig = {
      ...DEFAULT_CHART_CONFIG,
      ...overrides,
      symbol: SYMBOL,
      style: "3",
      hide_side_toolbar: true,
      theme: tvTheme,
      backgroundColor: TV_CHART_SURFACE[tvTheme],
    };

    const script = document.createElement("script");
    script.src = TRADINGVIEW_ADVANCED_CHART_SCRIPT;
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify(config);

    container.appendChild(script);

    return () => {
      purgeTradingViewEmbedContainer(container);
    };
  }, [configKey, resolvedTheme, theme, layoutBucket]);

  return (
    <div
      className={cn(
        "h-full w-full min-h-0 min-w-0 max-w-full touch-manipulation",
        className,
      )}
    >
      <div
        key={`jpyvnd-${tvThemeKey}-${layoutBucket}`}
        ref={containerRef}
        className="tradingview-widget-container h-full w-full max-w-full"
        style={{ height: "100%", width: "100%", minHeight: 0 }}
      >
        <div
          className="tradingview-widget-container__widget min-h-0 max-w-full"
          style={{ height: "calc(100% - 32px)", width: "100%" }}
        />
      </div>
    </div>
  );
}
