import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { firaMono, interSans, merriweatherSerif } from "@/config/fonts";

export const metadata: Metadata = {
  title: "Pisky Design System",
  description: "Attio-inspired UI design system for modern applications",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${interSans.variable} ${merriweatherSerif.variable} ${firaMono.variable}`}
    >
      <body className="font-sans">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
