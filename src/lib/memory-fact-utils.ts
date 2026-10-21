
import { createHash } from "node:crypto";

export function normalizeMemoryFact(text: string): string {
  return text
    .normalize("NFC")
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleLowerCase("pt-BR");
}

export function getMemoryFactHash(text: string): string {
  const normalized = normalizeMemoryFact(text);

  return createHash("sha256")
    .update(normalized, "utf8")
    .digest("hex");
}
