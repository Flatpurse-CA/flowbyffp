"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Upload, FileText, X, Check, Undo2, ChevronDown, ChevronUp } from "lucide-react";
import { parseCsv } from "@/lib/migrate/csv";
import { parseXlsx } from "@/lib/migrate/xlsx";
import { PLATFORMS, type PlatformId } from "@/lib/migrate/platforms";
import { autoMap, detectKind, normalizeRows, FIELDS, KIND_LABELS, type ColumnMap, type ImportKind, type NAppointment } from "@/lib/migrate/normalize";
import { startImport, importChunk, finishImport, undoImport, type ImportSummary } from "./actions";

type LoadedFile = { id: string; name: string; headers: string[]; rows: string[][]; kind: ImportKind; map: ColumnMap };

const ORDER: ImportKind[] = ["staff", "services", "clients", "appointments"];
const CHUNK = 400;
const KIND_LINKS: Record<ImportKind, string> = {
  clients: "/dashboard/clients",
  services: "/dashboard/services",
  staff: "/dashboard/team",
  appointments: "/dashboard/appointments",
};

const card: React.CSSProperties = { background: "var(--dsurface1)", border: "1px solid var(--dw07)", borderRadius: 16 };
const select: React.CSSProperties = { background: "var(--dsurface2)", border: "1px solid var(--dw07)", borderRadius: 8, color: "var(--dtext)", fontSize: 12.5, padding: "6px 8px", maxWidth: "100%" };

function platformName(id: string) {
  return PLATFORMS.find(p => p.id === id)?.name ?? id;
}

export function MigrateClient({ imports }: { imports: ImportSummary[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const [platform, setPlatform] = useState<PlatformId | null>(null);
  const [files, setFiles] = useState<LoadedFile[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number; label: string } | null>(null);
  const [result, setResult] = useState<{ id: string; counts: Record<string, number>; duplicates: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [undoing, setUndoing] = useState<string | null>(null);

  const normalized = useMemo(
    () => files.map(f => ({ file: f, ...normalizeRows(f.kind, f.rows, f.map) })),
    [files],
  );
  const totalRecords = normalized.reduce((s, n) => s + n.ok.length, 0);
  const selected = PLATFORMS.find(p => p.id === platform);

  const addFiles = async (list: FileList | null) => {
    if (!list) return;
    setError(null);
    const loaded: LoadedFile[] = [];
    for (const file of Array.from(list)) {
      const isXlsx = /\.xlsx$/i.test(file.name);
      if (!isXlsx && !/\.(csv|txt)$/i.test(file.name)) {
        setError(`${file.name}: we read CSV and .xlsx files. Open it in Excel or Numbers, save as CSV or .xlsx, and drop it again.`);
        continue;
      }
      let parsed: { headers: string[]; rows: string[][] };
      try {
        parsed = isXlsx ? await parseXlsx(file) : parseCsv(await file.text());
      } catch {
        setError(`${file.name}: couldn't read this file. Try saving it as CSV and dropping it again.`);
        continue;
      }
      const { headers, rows } = parsed;
      if (!headers.length || !rows.length) { setError(`${file.name} looks empty.`); continue; }
      const kind = detectKind(headers, file.name);
      loaded.push({ id: `${file.name}-${file.size}-${Date.now()}`, name: file.name, headers, rows, kind, map: autoMap(kind, headers) });
    }
    setFiles(prev => [...prev, ...loaded]);
  };

  const updateFile = (id: string, patch: Partial<LoadedFile>) =>
    setFiles(prev => prev.map(f => (f.id === id ? { ...f, ...patch } : f)));

  const runImport = async () => {
    if (!platform || totalRecords === 0) return;
    setError(null);
    setProgress({ done: 0, total: totalRecords, label: "Starting" });
    try {
      const importId = await startImport(platform);
      const counts: Record<string, number> = {};
      let duplicates = 0;
      let done = 0;
      for (const kind of ORDER) {
        let rows = normalized.filter(n => n.file.kind === kind).flatMap(n => n.ok);
        // Date-sorted chunks keep each chunk's duplicate check to a narrow window.
        if (kind === "appointments") rows = [...(rows as NAppointment[])].sort((a, b) => a.startsAt.localeCompare(b.startsAt));
        for (let i = 0; i < rows.length; i += CHUNK) {
          const slice = rows.slice(i, i + CHUNK);
          setProgress({ done, total: totalRecords, label: `Importing ${KIND_LABELS[kind].toLowerCase()}` });
          const r = await importChunk(importId, kind, slice);
          counts[kind] = (counts[kind] ?? 0) + r.inserted;
          duplicates += r.duplicates;
          done += slice.length;
        }
      }
      await finishImport(importId, counts);
      setResult({ id: importId, counts, duplicates });
      setFiles([]);
      startTransition(() => router.refresh());
    } catch (e) {
      setError(e instanceof Error ? e.message : "The import stopped. Nothing after the last saved chunk was written; you can undo it below.");
      startTransition(() => router.refresh());
    } finally {
      setProgress(null);
    }
  };

  const undo = async (id: string) => {
    setUndoing(id);
    setError(null);
    try {
      await undoImport(id);
      if (result?.id === id) setResult(null);
      startTransition(() => router.refresh());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't undo that import");
    } finally {
      setUndoing(null);
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", flexDirection: "column", gap: 22 }}>
      <div>
        <h1 style={{ color: "var(--dtext)", fontSize: 22, fontWeight: 800, margin: "0 0 3px", letterSpacing: "-0.03em" }}>Switch to Flow</h1>
        <p style={{ color: "var(--dw35)", fontSize: 13, margin: 0 }}>Bring your clients, services, team and booking history over in a few minutes.</p>
      </div>

      {error && (
        <div style={{ padding: "10px 14px", borderRadius: 10, background: "var(--dsurface2)", border: "1px solid rgb(239,68,68)", color: "var(--dred-text)", fontSize: 12.5 }}>
          {error}
        </div>
      )}

      {result && (
        <div style={{ ...card, padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 28, height: 28, borderRadius: 999, background: "rgb(22,163,74)", display: "grid", placeItems: "center" }}>
              <Check size={16} color="white" strokeWidth={3} />
            </span>
            <span style={{ color: "var(--dtext)", fontSize: 15, fontWeight: 700 }}>Import complete</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
            {ORDER.filter(k => result.counts[k] !== undefined).map(k => (
              <Link key={k} href={KIND_LINKS[k]} style={{ ...card, background: "var(--dsurface2)", padding: "12px 14px", textDecoration: "none" }}>
                <div style={{ color: "var(--dtext)", fontSize: 20, fontWeight: 800 }}>{result.counts[k]}</div>
                <div style={{ color: "var(--dw35)", fontSize: 12 }}>{KIND_LABELS[k]} added</div>
              </Link>
            ))}
          </div>
          {result.duplicates > 0 && (
            <p style={{ color: "var(--dw35)", fontSize: 12.5, margin: 0 }}>{result.duplicates} already in Flow, so they were skipped.</p>
          )}
          <button onClick={() => undo(result.id)} disabled={undoing === result.id} style={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 10, background: "var(--dsurface3)", border: "1px solid var(--dw07)", color: "var(--dtext)", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>
            <Undo2 size={14} /> {undoing === result.id ? "Undoing..." : "Undo this import"}
          </button>
        </div>
      )}

      {/* Step 1: platform */}
      <div style={{ ...card, padding: 20 }}>
        <div style={{ color: "var(--dtext)", fontSize: 14, fontWeight: 700, marginBottom: 12 }}>1. Where are you coming from?</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 8 }}>
          {PLATFORMS.map(p => {
            const on = p.id === platform;
            return (
              <button key={p.id} onClick={() => setPlatform(p.id)} style={{ padding: "12px 10px", borderRadius: 12, cursor: "pointer", fontSize: 13, fontWeight: 600, background: on ? "rgb(109,40,217)" : "var(--dsurface2)", color: on ? "white" : "var(--dtext)", border: on ? "1px solid rgb(109,40,217)" : "1px solid var(--dw07)" }}>
                {p.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2: export + upload */}
      {selected && (
        <div style={{ ...card, padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <div style={{ color: "var(--dtext)", fontSize: 14, fontWeight: 700, marginBottom: 8 }}>2. Export from {selected.name}, then drop the files here</div>
            <ul style={{ margin: 0, paddingLeft: 18, color: "var(--dw5)", fontSize: 12.5, lineHeight: 1.8 }}>
              {selected.steps.map(s => <li key={s}>{s}</li>)}
            </ul>
            <p style={{ color: "var(--dw35)", fontSize: 12, margin: "8px 0 0" }}>
              Can&apos;t find the export? Email your files to <a href="mailto:support@flatpurse.com" style={{ color: "var(--dpurple-text)" }}>support@flatpurse.com</a> and we&apos;ll import them for you.
            </p>
          </div>

          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
            style={{ border: `2px dashed ${dragging ? "rgb(109,40,217)" : "var(--dw12)"}`, borderRadius: 14, padding: "28px 16px", textAlign: "center", cursor: "pointer", background: "var(--dsurface2)" }}
          >
            <Upload size={22} color="var(--dw5)" style={{ margin: "0 auto 8px" }} />
            <div style={{ color: "var(--dtext)", fontSize: 13.5, fontWeight: 600 }}>Drop CSV or Excel files, or click to choose</div>
            <div style={{ color: "var(--dw35)", fontSize: 12, marginTop: 4 }}>Drop them all at once. We work out which file is which.</div>
            <input ref={inputRef} type="file" accept=".csv,.txt,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" multiple hidden onChange={e => { addFiles(e.target.files); e.target.value = ""; }} />
          </div>

          {normalized.map(({ file, ok, skipped }) => {
            const open = expanded === file.id;
            const fields = FIELDS[file.kind];
            return (
              <div key={file.id} style={{ ...card, background: "var(--dsurface2)", padding: 14, display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <FileText size={16} color="var(--dw5)" />
                  <span style={{ color: "var(--dtext)", fontSize: 13, fontWeight: 600, flex: "1 1 160px", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</span>
                  <select value={file.kind} onChange={e => { const kind = e.target.value as ImportKind; updateFile(file.id, { kind, map: autoMap(kind, file.headers) }); }} style={select}>
                    {ORDER.map(k => <option key={k} value={k}>{KIND_LABELS[k]}</option>)}
                  </select>
                  <span style={{ color: "var(--dw35)", fontSize: 12 }}>{ok.length} ready{skipped ? `, ${skipped} skipped` : ""}</span>
                  <button onClick={() => setExpanded(open ? null : file.id)} style={{ background: "none", border: "none", color: "var(--dpurple-text)", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 3 }}>
                    Columns {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  </button>
                  <button aria-label="Remove file" onClick={() => setFiles(prev => prev.filter(f => f.id !== file.id))} style={{ background: "none", border: "none", color: "var(--dw35)", cursor: "pointer", display: "flex" }}>
                    <X size={16} />
                  </button>
                </div>

                {open && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 8 }}>
                    {fields.map(f => (
                      <label key={f.key} style={{ display: "flex", flexDirection: "column", gap: 4, color: "var(--dw35)", fontSize: 11.5 }}>
                        {f.label}
                        <select value={file.map[f.key]} onChange={e => updateFile(file.id, { map: { ...file.map, [f.key]: Number(e.target.value) } })} style={select}>
                          <option value={-1}>Not in this file</option>
                          {file.headers.map((h, i) => <option key={i} value={i}>{h || `Column ${i + 1}`}</option>)}
                        </select>
                      </label>
                    ))}
                  </div>
                )}

                {ok.length > 0 && (
                  <div style={{ color: "var(--dw5)", fontSize: 12, lineHeight: 1.6 }}>
                    {ok.slice(0, 3).map((r, i) => <div key={i} style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{previewLine(file.kind, r)}</div>)}
                  </div>
                )}
              </div>
            );
          })}

          {files.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <button onClick={runImport} disabled={!!progress || totalRecords === 0} style={{ padding: "11px 20px", borderRadius: 11, background: "rgb(109,40,217)", border: "none", color: "white", fontSize: 13.5, fontWeight: 700, cursor: progress ? "default" : "pointer", opacity: totalRecords === 0 ? 0.5 : 1 }}>
                {progress ? "Importing..." : `Import ${totalRecords.toLocaleString()} records`}
              </button>
              <span style={{ color: "var(--dw35)", fontSize: 12 }}>Anything already in Flow is skipped. You can undo the whole import.</span>
            </div>
          )}

          {progress && (
            <div>
              <div style={{ height: 8, borderRadius: 99, background: "var(--dsurface3)", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${Math.round((progress.done / Math.max(1, progress.total)) * 100)}%`, background: "rgb(109,40,217)", transition: "width 0.3s" }} />
              </div>
              <div style={{ color: "var(--dw35)", fontSize: 12, marginTop: 6 }}>{progress.label}: {progress.done.toLocaleString()} of {progress.total.toLocaleString()}</div>
            </div>
          )}
        </div>
      )}

      {imports.length > 0 && (
        <div style={{ ...card, padding: 20 }}>
          <div style={{ color: "var(--dtext)", fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Past imports</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {imports.map(imp => {
              const total = Object.values(imp.counts ?? {}).reduce((s, n) => s + Number(n), 0);
              return (
                <div key={imp.id} style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", fontSize: 12.5 }}>
                  <span style={{ color: "var(--dtext)", fontWeight: 600 }}>{platformName(imp.source)}</span>
                  <span style={{ color: "var(--dw35)" }}>{new Date(imp.created_at).toLocaleDateString()} · {total.toLocaleString()} records</span>
                  <span style={{ padding: "2px 8px", borderRadius: 99, fontSize: 11, fontWeight: 700, color: "white", background: imp.status === "completed" ? "rgb(22,163,74)" : imp.status === "undone" ? "rgb(107,114,128)" : "rgb(217,119,6)" }}>
                    {imp.status === "completed" ? "Done" : imp.status === "undone" ? "Undone" : "Incomplete"}
                  </span>
                  {imp.status !== "undone" && (
                    <button onClick={() => undo(imp.id)} disabled={undoing === imp.id} style={{ marginLeft: "auto", background: "none", border: "none", color: "var(--dpurple-text)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                      {undoing === imp.id ? "Undoing..." : "Undo"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function previewLine(kind: ImportKind, r: Record<string, unknown>): string {
  const money = (n: unknown) => `$${Number(n).toFixed(2)}`;
  if (kind === "clients") return [r.name, r.email, r.phone].filter(Boolean).join(" · ");
  if (kind === "services") return `${r.name} · ${money(r.price)} · ${r.duration} min${r.category ? ` · ${r.category}` : ""}`;
  if (kind === "staff") return [r.name, r.role, r.email].filter(Boolean).join(" · ");
  return `${new Date(String(r.startsAt)).toLocaleString()} · ${r.clientName} · ${r.service}${r.staff ? ` with ${r.staff}` : ""} · ${r.status}`;
}
