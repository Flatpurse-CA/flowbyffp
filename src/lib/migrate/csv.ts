// Small RFC 4180 CSV parser: quoted fields, escaped quotes, CRLF, a UTF-8
// BOM, and semicolon/tab-delimited exports (European locales of Fresha and
// Phorest export with ";"). No dependency, runs in the browser.

function detectDelimiter(firstLine: string): string {
  const counts = [",", ";", "\t"].map(d => ({ d, n: firstLine.split(d).length }));
  counts.sort((a, b) => b.n - a.n);
  return counts[0].n > 1 ? counts[0].d : ",";
}

export function parseCsv(text: string): { headers: string[]; rows: string[][] } {
  const src = text.replace(/^﻿/, "");
  const delim = detectDelimiter(src.slice(0, src.indexOf("\n") === -1 ? src.length : src.indexOf("\n")));

  const out: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += ch;
      continue;
    }
    if (ch === '"') inQuotes = true;
    else if (ch === delim) { row.push(field); field = ""; }
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && src[i + 1] === "\n") i++;
      row.push(field); field = "";
      out.push(row); row = [];
    } else field += ch;
  }
  if (field !== "" || row.length > 0) { row.push(field); out.push(row); }

  const nonEmpty = out.filter(r => r.some(c => c.trim() !== ""));
  const [headers = [], ...rows] = nonEmpty;
  return { headers: headers.map(h => h.trim()), rows };
}
