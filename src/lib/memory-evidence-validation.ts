
export type EvidenceValidationResult = {
  accepted: boolean;
  reason: string;
};

function normalize(text: string): string {
  return text
    .normalize("NFC")
    .replace(/\s+/g, " ")
    .trim();
}

export function validateMemoryEvidence(
  evidence: string,
  originalMessages: string[]
): EvidenceValidationResult {
  const normalizedEvidence = normalize(evidence);

  if (normalizedEvidence.length < 15) {
    return {
      accepted: false,
      reason: "Evidência muito curta.",
    };
  }

  if (normalizedEvidence.length > 500) {
    return {
      accepted: false,
      reason: "Evidência muito longa.",
    };
  }

  const found = originalMessages.some((message) =>
    normalize(message).includes(normalizedEvidence)
  );

  if (!found) {
    return {
      accepted: false,
      reason:
        "A evidência não foi encontrada literalmente nas mensagens originais.",
    };
  }

  return {
    accepted: true,
    reason: "Evidência encontrada nas mensagens originais.",
  };
}
