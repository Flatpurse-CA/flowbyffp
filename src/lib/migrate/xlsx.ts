// Reads the first sheet of an .xlsx export (Vagaro and Mindbody default to
// Excel) into the same headers/rows shape parseCsv returns. The parser is
// loaded on demand, so it only downloads when someone drops an Excel file.

const pad = (n: number) => String(n).padStart(2, "0");

// Excel cells carry wall-clock time with no timezone; the library hands them
// back as UTC Dates, so read them with UTC getters.
function cellToString(v: unknown): string {
  if (v == null) return "";
  if (v instanceof Date) {
    // Excel stores times as fractions of a day; float error turns 10:00 into 09:59:59.
    const d = new Date(Math.round(v.getTime() / 60_000) * 60_000);
    const time = `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
    // Time-only cells come back on Excel's 1899-12-30 epoch day.
    if (d.getUTCFullYear() < 1901) return time;
    const date = `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
    return time === "00:00" ? date : `${date} ${time}`;
  }
  return String(v);
}

export async function parseXlsx(file: File): Promise<{ headers: string[]; rows: string[][] }> {
  const { readSheet } = await import("read-excel-file/browser");
  const data = await readSheet(file);
  const rows = data.map(r => r.map(cellToString)).filter(r => r.some(c => c.trim() !== ""));
  const [headers = [], ...rest] = rows;
  return { headers: headers.map(h => h.trim()), rows: rest };
}
