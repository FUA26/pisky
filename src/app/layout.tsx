import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/shared/components/theme-provider";
import { geistSans, geistMono } from "@/shared/config/fonts";

export const metadata: Metadata = {
  title: "Pisky Design System",
  description: "Attio-inspired UI design system for modern applications",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
