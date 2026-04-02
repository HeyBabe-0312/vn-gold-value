import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

type Locale = "vi" | "en";

async function getLocaleFromCookie(): Promise<Locale> {
  const jar = await cookies();
  const raw = jar.get("vn-gold-setting")?.value;
  if (!raw) return "vi";

  // Cookie value is expected to be JSON, but might be urlencoded.
  const decoded = (() => {
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  })();

  try {
    const parsed = JSON.parse(decoded) as { locale?: string } | null;
    if (parsed?.locale === "en" || parsed?.locale === "vi")
      return parsed.locale;
  } catch {
    /* ignore */
  }
  return "vi";
}

export default getRequestConfig(async () => {
  const locale = await getLocaleFromCookie();

  const messages = (await import(`../messages/${locale}.json`)).default;
  return { locale, messages };
});
