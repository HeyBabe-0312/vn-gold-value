"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { JpyVndChart } from "@/components/dashboard/JpyVndChart";
import { useApp } from "@/providers/AppProvider";

export function PriceChart() {
  const { t } = useApp();

  return (
    <Card className="col-span-full min-w-0 max-w-full overflow-x-clip overflow-y-visible lg:col-span-2">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <CardTitle className="text-sm font-semibold text-[var(--text-primary)]">
            {t.priceChart} — JPY/VND
          </CardTitle>
          <Badge variant="live">
            <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-[#10B981]" />
            {t.live}
          </Badge>
        </div>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          {t.jpyVndChartSubtitle}
        </p>
      </CardHeader>
      <CardContent className="p-0 px-2 pb-4 sm:px-3">
        <div className="h-[min(62dvh,420px)] w-full min-h-[min(240px,50dvh)] sm:min-h-[280px]">
          <JpyVndChart />
        </div>
      </CardContent>
    </Card>
  );
}
