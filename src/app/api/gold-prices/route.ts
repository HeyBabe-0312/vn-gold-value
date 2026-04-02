import { NextResponse } from "next/server";
import type { VangTodayPricesResponse } from "@/lib/vang-today";

const UPSTREAM = "https://www.vang.today/api/prices";

export async function GET(request: Request) {
  const refresh = new URL(request.url).searchParams.get("refresh") === "1";

  try {
    const res = await fetch(UPSTREAM, {
      headers: { Accept: "application/json" },
      ...(refresh
        ? { cache: "no-store" as const }
        : { next: { revalidate: 300 } }),
    });

    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: `Upstream ${res.status}` },
        { status: 502 }
      );
    }

    const data = (await res.json()) as VangTodayPricesResponse;
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": refresh ? "no-store" : "public, s-maxage=300, stale-while-revalidate=60",
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Fetch failed";
    return NextResponse.json({ success: false, error: message }, { status: 502 });
  }
}
