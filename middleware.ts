import createMiddleware from "next-intl/middleware";

// No locale prefix in URL. Locale is read from cookie by next-intl.
export default createMiddleware({
  locales: ["vi", "en", "jp"],
  defaultLocale: "vi",
  localePrefix: "never",
});

export const config = {
  // Exclude API, _next, and static assets
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};

