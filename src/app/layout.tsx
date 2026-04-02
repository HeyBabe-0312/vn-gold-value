import type { Metadata } from "next";
import { Be_Vietnam_Pro, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/providers/AppProvider";
import { ReduxProvider } from "@/providers/ReduxProvider";
import { Header } from "@/components/Header";
import { Sidebar, MobileNav } from "@/components/Sidebar";

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
  title: "VN Gold Value — Giá vàng & Ngoại tệ",
  description:
    "Theo dõi giá vàng SJC, DOJI, PNJ và tỷ giá ngoại tệ theo thời gian thực.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${vnSans.variable} ${vnMono.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="h-full antialiased">
        <ReduxProvider>
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
      </body>
    </html>
  );
}
