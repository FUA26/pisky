import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pisky Boilerplate",
  description: "A personalized Next.js 16+ boilerplate",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
