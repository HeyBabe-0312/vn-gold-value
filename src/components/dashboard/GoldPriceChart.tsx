"use client";

import { useEffect, useMemo, useRef } from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import {
  type TradingViewAdvancedChartConfig,
  TRADINGVIEW_ADVANCED_CHART_SCRIPT,
  TV_CHART_SURFACE,
  resolveTradingViewTheme,
  useTradingViewChartLayoutBucket,
} from "@/lib/tradingview-advanced-chart";

const DEFAULT_CHART_CONFIG: TradingViewAdvancedChartConfig = {
  autosize: true,
  symbol: "FX_IDC:XAUUSD",
  interval: "5",
  timezone: "Asia/Ho_Chi_Minh",
  theme: "light",
  backgroundColor: "rgba(255, 255, 255, 1)",
  style: "1",
  locale: "en",
  support_host: "https://www.tradingview.com",
  withdateranges: true,
  hide_side_toolbar: true,
  allow_symbol_change: true,
  save_image: false,
  show_popup_button: true,
  calendar: false,
};

export type { TradingViewAdvancedChartConfig };

export interface GoldPriceChartProps {
  className?: string;
  /**
   * Merged onto defaults. `theme`, `backgroundColor`, and `hide_side_toolbar`
   * are always taken from app theme / product choice (not overridable here).
   */
  chartConfig?: Partial<TradingViewAdvancedChartConfig>;
}

export function GoldPriceChart({
  className,
  chartConfig,
}: GoldPriceChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const layoutBucket = useTradingViewChartLayoutBucket();
  const { resolvedTheme } = useTheme();
  const configKey = useMemo(
    () => JSON.stringify(chartConfig ?? {}),
    [chartConfig],
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const overrides = JSON.parse(
      configKey,
    ) as Partial<TradingViewAdvancedChartConfig>;
    const tvTheme = resolveTradingViewTheme(resolvedTheme);
    const config: TradingViewAdvancedChartConfig = {
      ...DEFAULT_CHART_CONFIG,
      ...overrides,
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
      script.remove();
      const widgetHost = container.querySelector(
        ".tradingview-widget-container__widget",
      );
      if (widgetHost) widgetHost.innerHTML = "";
    };
  }, [configKey, resolvedTheme, layoutBucket]);

  return (
    <div
      className={cn(
        "h-full w-full min-h-0 min-w-0 max-w-full touch-manipulation",
        className,
      )}
    >
      <div
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
