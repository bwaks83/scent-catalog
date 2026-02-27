import { NextResponse } from "next/server";

const HEADERS = [
  "ID","Name","Family","Short Description","Top Notes","Heart Notes",
  "Base Notes","Key Ingredients","Origin Country","Status","Notes", "Price 500ml", "Price 150ml", "Price 60ml"
] as const;

type ScentRow = Record<(typeof HEADERS)[number], string>;

function csvToRows(csv: string): string[][] {
  csv = csv.replace(/\r\n?/g, "\n");
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < csv.length; i++) {
    const c = csv[i];
    if (inQuotes) {
      if (c === '"') {
        if (csv[i + 1] === '"') { field += '"'; i++; } else { inQuotes = false; }
      } else field += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ",") { row.push(field); field = ""; }
      else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
      else field += c;
    }
  }
  row.push(field); rows.push(row);
  return rows.filter(r => r.length && r.some(v => v.trim() !== ""));
}

function rowsToObjects(rows: string[][]): ScentRow[] {
  const header = rows[0]?.map(h => h.trim().toLowerCase()) || [];
  const idxMap: Record<string, number> = {};
  HEADERS.forEach(h => {
    idxMap[h] = header.findIndex(x => x === h.toLowerCase());
  });
  return rows.slice(1).map((r) => {
    const obj: any = {};
    HEADERS.forEach(h => {
      const idx = idxMap[h];
      obj[h] = idx >= 0 ? (r[idx] ?? "") : "";
    });
    return obj as ScentRow;
  });
}

export async function GET() {
  const url = process.env.SCENTS_CSV_URL;
  if (!url) return NextResponse.json({ error: "Missing SCENTS_CSV_URL" }, { status: 500 });
  const r = await fetch(url, { cache: "no-store" });
  if (!r.ok) return NextResponse.json({ error: `Fetch failed: ${r.status}` }, { status: 502 });
  const text = await r.text();
  const rows = csvToRows(text);
  if (!rows.length) return NextResponse.json({ error: "Empty CSV" }, { status: 422 });
  const data = rowsToObjects(rows);
  return NextResponse.json({ data });
}
