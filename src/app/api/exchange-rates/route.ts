import { NextResponse } from "next/server";
import { EXCHANGE_API_CURRENCIES, FX_ORDER } from "@/lib/fx-currencies";

const UPSTREAM = "https://api.exchangerateapi.net/v1/latest";

/** Seconds — free tier: minimize upstream calls; CDN + Next cache still serve clients. */
const REVALIDATE_SEC = 6 * 60 * 60;

interface UpstreamLatest {
  data?: Record<string, { code?: string; value?: number }>;
  meta?: { last_updated_at?: string };
}

function buildVndPerUnit(data: Record<string, { value?: number }>): Record<string, number> {
  const vndPerUsd = data.VND?.value;
  if (vndPerUsd == null || !Number.isFinite(vndPerUsd) || vndPerUsd <= 0) {
    throw new Error("Invalid VND rate in upstream response");
  }
  const out: Record<string, number> = { USD: vndPerUsd };
  for (const code of FX_ORDER) {
    if (code === "USD") continue;
    const v = data[code]?.value;
    if (v == null || !Number.isFinite(v) || v <= 0) {
      throw new Error(`Missing or invalid rate for ${code}`);
    }
    out[code] = vndPerUsd / v;
  }
  return out;
}

export async function GET() {
  const apikey = process.env.EXCHANGE_RATE_API_KEY;
  if (!apikey) {
    return NextResponse.json(
      { success: false, error: "Server missing EXCHANGE_RATE_API_KEY" },
      { status: 500 },
    );
  }

  const url = `${UPSTREAM}?base=USD&currencies=${EXCHANGE_API_CURRENCIES}`;

  try {
    const res = await fetch(url, {
      headers: { apikey },
      next: { revalidate: REVALIDATE_SEC },
    });

    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: `Upstream ${res.status}` },
        { status: 502 },
      );
    }

    const json = (await res.json()) as UpstreamLatest;
    const data = json.data;
    if (!data || typeof data !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid upstream payload" },
        { status: 502 },
      );
    }

    const vndPerUnit = buildVndPerUnit(data);
    const lastUpdatedAt = json.meta?.last_updated_at ?? null;

    return NextResponse.json(
      {
        success: true,
        vndPerUnit,
        lastUpdatedAt,
      },
      {
        headers: {
          "Cache-Control": `public, s-maxage=${REVALIDATE_SEC}, stale-while-revalidate=3600`,
        },
      },
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "Fetch failed";
    return NextResponse.json({ success: false, error: message }, { status: 502 });
  }
}
