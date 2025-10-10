import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fragrance Catalog — Scent Company",
  description: "Live search on fragrances with notes and families.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
