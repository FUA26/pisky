import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { firaMono, interSans, merriweatherSerif } from "@/config/fonts";

export const metadata: Metadata = {
  title: "Pisky Boilerplate",
  description: "A personalized Next.js 16+ boilerplate",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${interSans.variable} ${merriweatherSerif.variable} ${firaMono.variable}`}
    >
      <body className="font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
