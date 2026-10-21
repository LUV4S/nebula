
export type ExtractedMemoryFact = {
  content: string;
  evidence: string;
};

export type MemoryExtractionResult = {
  facts: ExtractedMemoryFact[];
  narrativeEvents: string;
};

export function parseMemoryExtraction(
  text: string
): MemoryExtractionResult {
  const cleaned = text
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");

  if (start === -1 || end <= start) {
    throw new Error("JSON incompleto.");
  }

  const parsed: unknown = JSON.parse(
    cleaned.slice(start, end + 1)
  );

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !("facts" in parsed) ||
    !Array.isArray(parsed.facts) ||
    !("narrativeEvents" in parsed) ||
    typeof parsed.narrativeEvents !== "string"
  ) {
    throw new Error("Formato de extração inválido.");
  }

  const facts: ExtractedMemoryFact[] = [];

  for (const item of parsed.facts) {
    if (
      typeof item !== "object" ||
      item === null ||
      typeof item.content !== "string" ||
      typeof item.evidence !== "string"
    ) {
      throw new Error("Fato com formato inválido.");
    }

    const content = item.content.trim();
    const evidence = item.evidence.trim();

    if (!content || !evidence) {
      continue;
    }

    facts.push({ content, evidence });
  }

  return {
    facts,
    narrativeEvents: parsed.narrativeEvents.trim(),
  };
}
