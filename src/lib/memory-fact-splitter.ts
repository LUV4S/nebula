
export function splitMemoryFacts(text: string): string[] {
  const parts = text
    .split(/\n|;/)
    .map((part) =>
      part
        .trim()
        .replace(/^[-*]\s+/, "")
        .trim()
    )
    .filter(Boolean);

  const unique = new Set<string>();

  for (const part of parts) {
    unique.add(part);
  }

  return [...unique];
}
