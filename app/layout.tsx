import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Scent Company — Fragrance Catalog",
  description: "The Essence of Identity — Luxury olfactory design.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Editorial serif + modern sans */}
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Source+Sans+3:wght@300;400;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-bg text-ink">
        {/* Institutional header */}
        <header className="sticky top-0 z-30 bg-header border-b border-line">
          <div className="mx-auto max-w-6xl px-6 md:px-10 py-5 text-center">
            <h1 className="font-serif text-3xl md:text-4xl tracking-tight text-ink-strong">
              Scent Company
            </h1>
            <p className="mt-1 text-xxs md:text-xs tracking-[0.25em] uppercase text-ink-soft">
              The Essence of Identity
            </p>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-6 md:px-10 py-10">{children}</main>

        <footer className="border-t border-line mt-12">
          <div className="mx-auto max-w-6xl px-6 md:px-10 py-8 text-center text-xxs tracking-[0.22em] uppercase text-ink-soft font-serif">
            © {new Date().getFullYear()} Scent Company USA — Crafted in Italy
          </div>
        </footer>
      </body>
    </html>
  );
}

