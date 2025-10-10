"use client";
import { useEffect, useMemo, useState } from "react";

type ScentRow = {
  ID: string; Name: string; Family: string; "Short Description": string;
  "Top Notes": string; "Heart Notes": string; "Base Notes": string;
  "Key Ingredients": string; "Origin Country": string; Status: string; Notes: string;
};

function splitNotes(s: string) { return s.split(";").map(x => x.trim()).filter(Boolean); }
function normalize(t: string) { return t.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, ""); }

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
        setLoading(true); setErr(null);
        const res = await fetch("/api/scents");
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "Failed");
        setRows(json.data || []);
      } catch (e:any) { setErr(e.message || "Error"); }
      finally { setLoading(false); }
    })();
  }, []);

  const families = useMemo(() => ["All", ...Array.from(new Set(rows.map(r => r.Family))).sort()], [rows]);

  const result = useMemo(() => {
    const nq = normalize(q.trim());

    function fieldsForSearch(r: ScentRow): string[] {
      if (searchIn === "Top")   return [r["Top Notes"]];
      if (searchIn === "Heart") return [r["Heart Notes"]];
      if (searchIn === "Base")  return [r["Base Notes"]];
      return [r.Name, r.Family, r["Top Notes"], r["Heart Notes"], r["Base Notes"], r["Key Ingredients"]];
    }

    return rows.filter(r => {
      if (family !== "All" && r.Family !== family) return false;
      if (status !== "Any" && r.Status !== status) return false;
      if (!nq) return true;
      const hay = fieldsForSearch(r).map(normalize).join(" ");
      return hay.includes(nq);
    });
  }, [rows, q, family, status, searchIn]);

  return (
    <main className="min-h-screen py-10">
      <section className="section">
        <h1 className="text-3xl md:text-4xl mb-2">Fragrance Catalog</h1>
        <p className="text-sm text-[var(--ink-soft)] mb-6">
          Explore the Scent Company collection. Search by notes, family or status.
        </p>

        {/* Controls */}
        <div className="flex flex-wrap gap-3 mb-6">
          <input
            className="input min-w-[280px] w-full sm:w-96"
            placeholder={
              searchIn === "Top" ? "Search in Top notes (e.g., bergamot)"
              : searchIn === "Heart" ? "Search in Heart notes (e.g., rose)"
              : searchIn === "Base" ? "Search in Base notes (e.g., musk)"
              : "Search any (name, family, notes, key ingredients)"
            }
            value={q} onChange={e => setQ(e.target.value)}
          />

          <select className="select" value={family} onChange={e => setFamily(e.target.value)}>
            {families.map(f => <option key={f} value={f}>{f}</option>)}
          </select>

          <select className="select" value={status} onChange={e => setStatus(e.target.value)}>
            {["Any","Active","Test","Archived"].map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <select className="select" value={searchIn} onChange={(e) => setSearchIn(e.target.value as any)}>
            <option value="Any">Search in: Any</option>
            <option value="Top">Search in: Top notes</option>
            <option value="Heart">Search in: Heart notes</option>
            <option value="Base">Search in: Base notes</option>
          </select>
        </div>

        {loading && <p className="text-[var(--ink-soft)]">Loading…</p>}
        {err && <p className="text-red-600">Error: {err}</p>}

        {/* Results */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {result.map(r => (
            <div key={r.ID} className="card p-6 transition-shadow hover:shadow-md">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg md:text-xl font-medium tracking-tight">{r.Name}</h3>
                <span className="badge">{r.Family}</span>
              </div>

              {r["Short Description"] && (
                <p className="text-sm text-[var(--ink-soft)] mb-4">
                  {r["Short Description"]}
                </p>
              )}

              <div className="space-y-2 text-sm">
  <div>
    <p className="text-[var(--ink)] font-medium">Top notes:</p>
    <p className="text-[var(--ink-soft)]">
      {splitNotes(r["Top Notes"]).join(", ")}
    </p>
  </div>
  <div>
    <p className="text-[var(--ink)] font-medium">Heart notes:</p>
    <p className="text-[var(--ink-soft)]">
      {splitNotes(r["Heart Notes"]).join(", ")}
    </p>
  </div>
  <div>
    <p className="text-[var(--ink)] font-medium">Base notes:</p>
    <p className="text-[var(--ink-soft)]">
      {splitNotes(r["Base Notes"]).join(", ")}
    </p>
  </div>
</div>


              <div className="flex justify-between items-center mt-5 text-xs text-[var(--ink-soft)]">
                <span>{r.Status || "Unknown"}</span>
                <span>{r["Origin Country"] || ""}</span>
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
