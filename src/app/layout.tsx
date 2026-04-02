import type { Metadata } from "next";
import { Fira_Code, Fira_Sans } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/providers/AppProvider";
import { Header } from "@/components/Header";
import { Sidebar, MobileNav } from "@/components/Sidebar";

const firaSans = Fira_Sans({
  variable: "--font-fira-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const firaCode = Fira_Code({
  variable: "--font-fira-code",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "VN Gold Value — Giá vàng & Ngoại tệ",
  description: "Theo dõi giá vàng SJC, DOJI, PNJ và tỷ giá ngoại tệ theo thời gian thực.",
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
      className={`${firaSans.variable} ${firaCode.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="h-full antialiased">
        <AppProvider>
          <div className="flex h-full flex-col">
            <Header />
            <div className="flex flex-1 overflow-hidden">
              <Sidebar />
              <main className="flex-1 overflow-y-auto bg-[var(--bg-secondary)]">
                {children}
              </main>
            </div>
            <MobileNav />
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
