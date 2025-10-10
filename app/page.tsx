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
    return rows.filter(r => {
      if (family !== "All" && r.Family !== family) return false;
      if (status !== "Any" && r.Status !== status) return false;
      if (!nq) return true;
      const hay = [r.Name, r.Family, r["Top Notes"], r["Heart Notes"], r["Base Notes"], r["Key Ingredients"]]
        .map(normalize).join(" ");
      return hay.includes(nq);
    });
  }, [rows, q, family, status]);

  return (
    <main className="min-h-screen px-6 py-10">
      <h1 className="text-2xl font-semibold mb-4">Fragrance Catalog — Live Search</h1>

      <div className="flex flex-wrap gap-3 mb-4">
        <input
          className="border rounded px-3 py-2 min-w-[280px]"
          placeholder="Search name or ingredients (e.g., bergamot, lavender)"
          value={q} onChange={e => setQ(e.target.value)}
        />
        <select className="border rounded px-3 py-2" value={family} onChange={e => setFamily(e.target.value)}>
          {families.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
        <select className="border rounded px-3 py-2" value={status} onChange={e => setStatus(e.target.value)}>
          {["Any","Active","Test","Archived"].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loading && <p className="text-gray-500">Loading…</p>}
      {err && <p className="text-red-600">Error: {err}</p>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {result.map(r => (
          <div key={r.ID} className="border rounded-xl p-4 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold">{r.Name}</h3>
              <span className="text-xs bg-gray-100 rounded-full px-2 py-1">{r.Family}</span>
            </div>
            {r["Short Description"] && <p className="text-sm text-gray-600 mb-3">{r["Short Description"]}</p>}
            <div className="text-sm">
              <p><b>Top:</b> {splitNotes(r["Top Notes"]).join(", ")}</p>
              <p><b>Heart:</b> {splitNotes(r["Heart Notes"]).join(", ")}</p>
              <p><b>Base:</b> {splitNotes(r["Base Notes"]).join(", ")}</p>
            </div>
            <div className="flex justify-between items-center mt-3 text-xs text-gray-500">
              <span>{r.Status || "Unknown"}</span>
              <span>{r["Origin Country"] || ""}</span>
            </div>
          </div>
        ))}
      </div>

      {!loading && !err && result.length === 0 && (
        <p className="text-center text-gray-500 mt-8">No scents found for the current filters.</p>
      )}
    </main>
  );
}
