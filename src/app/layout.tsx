import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/providers/AppProvider";
import { ReduxProvider } from "@/providers/ReduxProvider";
import { InitFetchData } from "@/providers/InitFetchData";
import { Header } from "@/components/Header";
import { Sidebar, MobileNav } from "@/components/Sidebar";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

const vnSans = Be_Vietnam_Pro({
  variable: "--font-vn-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const vnMono = JetBrains_Mono({
  variable: "--font-vn-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "VN Gold Prices - Giá vàng & Ngoại tệ",
  description:
    "Track SJC, DOJI, PNJ gold prices and foreign exchange rates in near real time.",
  icons: {
    icon: "/favicon.ico",
  },
};

/** Ensures embedded widgets (e.g. TradingView) get a correct initial layout on phones. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html
      lang="vi"
      className={`${vnSans.variable} ${vnMono.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="h-full antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ReduxProvider>
            <InitFetchData />
            <AppProvider>
              <div className="flex h-full flex-col">
                <Header />
                <div className="flex flex-1 overflow-hidden">
                  <Sidebar />
                  <main className="min-w-0 flex-1 overflow-y-auto bg-[var(--bg-secondary)]">
                    {children}
                  </main>
                </div>
                <MobileNav />
              </div>
            </AppProvider>
          </ReduxProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
