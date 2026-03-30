import { Fira_Code, Inter, Merriweather } from "next/font/google";

export const interSans = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const merriweatherSerif = Merriweather({
  variable: "--font-merriweather",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "700"],
});

export const firaMono = Fira_Code({
  variable: "--font-fira-code",
  subsets: ["latin"],
  display: "swap",
});
