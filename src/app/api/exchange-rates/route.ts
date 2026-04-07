import { NextResponse } from "next/server";
import CurrencyAPI from "@everapi/currencyapi-js";
import { EXCHANGE_API_CURRENCIES, FX_ORDER } from "@/lib/fx-currencies";

/** Seconds — align with CurrencyAPI plan (free tier often daily); CDN + Next cache still help. */
const REVALIDATE_SEC = 6 * 60 * 60;

type CurrencyApiDataEntry = { code?: string; value?: number };

interface LatestResponseBody {
  meta?: { last_updated_at?: string };
  data?: Record<string, CurrencyApiDataEntry> | null;
  message?: string;
}

function buildVndPerUnit(
  data: Record<string, CurrencyApiDataEntry>,
): Record<string, number> {
  const vndPerUsd = data.VND?.value;
  if (vndPerUsd == null || !Number.isFinite(vndPerUsd) || vndPerUsd <= 0) {
    throw new Error("Invalid or missing VND rate in CurrencyAPI response");
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

function getApiKey(): string | undefined {
  return process.env.CURRENCY_API_KEY?.trim() || undefined;
}

export async function GET() {
  const apiKey = getApiKey();
  if (!apiKey) {
    return NextResponse.json(
      {
        success: false,
        error: "Server missing CURRENCY_API_KEY",
      },
      { status: 500 },
    );
  }

  try {
    const client = new CurrencyAPI(apiKey);
    const json = (await client.latest({
      base_currency: "USD",
      currencies: EXCHANGE_API_CURRENCIES,
    })) as LatestResponseBody;

    if (!json.data || typeof json.data !== "object") {
      const upstreamMsg =
        typeof json.message === "string" && json.message.trim()
          ? json.message.trim()
          : "Invalid CurrencyAPI response";
      const quotaLike =
        /quota|limit|upgrade|plan|subscription|401|unauthor/i.test(upstreamMsg);
      return NextResponse.json(
        { success: false, error: upstreamMsg },
        { status: quotaLike ? 429 : 502 },
      );
    }

    const vndPerUnit = buildVndPerUnit(json.data);
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
    return NextResponse.json(
      { success: false, error: message },
      { status: 502 },
    );
  }
}
