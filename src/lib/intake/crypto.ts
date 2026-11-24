import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

/** AES-256-GCM with INTAKE_ENCRYPTION_KEY (base64, 32 bytes). Output: v1.iv.tag.data (base64). */
function key(): Buffer {
  const raw = process.env.INTAKE_ENCRYPTION_KEY;
  if (!raw) throw new Error("INTAKE_ENCRYPTION_KEY is not set");
  const k = Buffer.from(raw, "base64");
  if (k.length !== 32) throw new Error("INTAKE_ENCRYPTION_KEY must be 32 bytes (base64)");
  return k;
}

export const intakeConfigured = () => Boolean(process.env.INTAKE_ENCRYPTION_KEY);

export function encryptAnswers(data: unknown): string {
  const iv = randomBytes(12);
  const c = createCipheriv("aes-256-gcm", key(), iv);
  const enc = Buffer.concat([c.update(JSON.stringify(data), "utf8"), c.final()]);
  return ["v1", iv.toString("base64"), c.getAuthTag().toString("base64"), enc.toString("base64")].join(".");
}

export function decryptAnswers<T = Record<string, string>>(blob: string): T {
  const [v, iv, tag, data] = blob.split(".");
  if (v !== "v1") throw new Error("Unknown format");
  const d = createDecipheriv("aes-256-gcm", key(), Buffer.from(iv, "base64"));
  d.setAuthTag(Buffer.from(tag, "base64"));
  return JSON.parse(Buffer.concat([d.update(Buffer.from(data, "base64")), d.final()]).toString("utf8")) as T;
}
