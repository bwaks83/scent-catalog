"use client";
import { useEffect, useMemo, useState } from "react";

type ScentRow = {
  ID: string;
  Name: string;
  Family: string;
  "Short Description": string;
  "Top Notes": string;
  "Heart Notes": string;
  "Base Notes": string;
  "Key Ingredients": string;
  "Origin Country": string;
  Status: string;
  Notes: string;
  "Price 500ml": string;
  "Price 150ml": string;
  "Price 60ml": string;
};

function splitNotes(s: string) {
  return s.split(";").map(x => x.trim()).filter(Boolean);
}
function normalize(t: string) {
  return t.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

function familyToken(f: string) {
  return (f || "")
    .toUpperCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, ""); // removes accents (e.g., “CIPRÉE” → “CIPREE”)
}

function formatUSD(value: string) {
  if (!value) return "—";
  const number = Number(value);
  if (isNaN(number)) return value;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(number);
}


export default function Home() {
  const [rows, setRows] = useState<ScentRow[]>([]);
  const [q, setQ] = useState("");
  const [family, setFamily] = useState("All");
  const [status, setStatus] = useState("Any");
  const [searchIn, setSearchIn] = useState<"Any" | "Top" | "Heart" | "Base">("Any");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const res = await fetch("/api/scents");
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "Failed");
        setRows(json.data || []);
      } catch (e: any) {
        setErr(e.message || "Error");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const families = useMemo(() => {
    return ["All", ...Array.from(new Set(rows.map(r => r.Family))).sort()];
  }, [rows]);

  const result = useMemo(() => {
    const nq = normalize(q.trim());

    function fieldsForSearch(r: ScentRow): string[] {
      if (searchIn === "Top") return [r["Top Notes"]];
      if (searchIn === "Heart") return [r["Heart Notes"]];
      if (searchIn === "Base") return [r["Base Notes"]];
      return [
        r.Name,
        r.Family,
        r["Top Notes"],
        r["Heart Notes"],
        r["Base Notes"],
        r["Key Ingredients"],
      ];
    }

    return rows.filter(r => {
      if (family !== "All" && r.Family !== family) return false;
      if (status !== "Any" && r.Status !== status) return false;
      if (!nq) return true;
      const hay = fieldsForSearch(r).map(normalize).join(" ");
      return hay.includes(nq);
    });
  }, [rows, q, family, status, searchIn]); // ⬅️ certifique-se de manter este fecha-parênteses e ponto-e-vírgula

  return (
    <main className="min-h-screen py-10">
<section className="rounded-2xl bg-[#f9f6f1] border border-line p-6 mb-12">
  <h1 className="text-3xl md:text-4xl mb-2 text-ink-strong">Fragrance Catalog</h1>
  <p className="text-sm text-ink-soft mb-6">
    Explore the Scent Company collection. Search by notes, family or status.
  </p>

        {/* Controls */}
        <div className="flex flex-wrap gap-3">
          <input
            className="input min-w-[280px] w-full sm:w-96"
            placeholder={
              searchIn === "Top"
                ? "Search in Top notes (e.g., bergamot)"
                : searchIn === "Heart"
                ? "Search in Heart notes (e.g., rose)"
                : searchIn === "Base"
                ? "Search in Base notes (e.g., musk)"
                : "Search any (name, family, notes, key ingredients)"
            }
            value={q}
            onChange={e => setQ(e.target.value)}
          />

          <select
            className="select"
            value={family}
            onChange={e => setFamily(e.target.value)}
          >
            {families.map(f => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>

          <select
            className="select"
            value={status}
            onChange={e => setStatus(e.target.value)}
          >
            {["Any", "Active", "Test", "Archived"].map(s => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            className="select"
            value={searchIn}
            onChange={e => setSearchIn(e.target.value as any)}
          >
            <option value="Any">Search in: Any</option>
            <option value="Top">Search in: Top notes</option>
            <option value="Heart">Search in: Heart notes</option>
            <option value="Base">Search in: Base notes</option>
          </select>
        </div>

        {/* Results */}
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
  {result.map((r) => (
    <div key={r.ID} className="card px-8 pt-8 pb-6">
      {/* opcional: barra dourada sutil no topo */}
      {/* <div className="gold-bar mb-4"></div> */}

      <div className="flex items-start justify-between mb-3">
        <h3 className="text-2xl font-serif title-underline text-[var(--gold)]">{r.Name}</h3>
        <span className="badge" data-family={familyToken(r.Family)}>
  {r.Family}
</span>
      </div>

      {r["Short Description"] && (
        <p className="text-sm text-ink-soft mb-4 leading-relaxed">{r["Short Description"]}</p>
      )}

      <div className="space-y-3 text-sm leading-relaxed">
        <p><span className="font-semibold text-ink-strong">Top notes:</span> {splitNotes(r["Top Notes"]).join(", ")}</p>
        <p><span className="font-semibold text-ink-strong">Heart notes:</span> {splitNotes(r["Heart Notes"]).join(", ")}</p>
        <p><span className="font-semibold text-ink-strong">Base notes:</span> {splitNotes(r["Base Notes"]).join(", ")}</p>
      </div>

      <div className="mt-5 text-sm text-ink-soft">
  <span className="font-semibold text-ink-strong">Pricing:</span>{" "}
  500ml: {formatUSD(r["Price 500ml"])} ·{" "}
  150ml: {formatUSD(r["Price 150ml"])} ·{" "}
  60ml: {formatUSD(r["Price 60ml"])}
</div>



    </div>
  ))}
</div>


        {!loading && !err && result.length === 0 && (
          <p className="text-center text-[var(--ink-soft)] mt-10">
            No scents found for the current filters.
          </p>
        )}
      </section>
    </main>
  );
}

