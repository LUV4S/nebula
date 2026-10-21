
export type FactValidationResult = {
  accepted: boolean;
  reason: string;
  unknownNames: string[];
};

const IGNORED_WORDS = new Set([
  "Identidade",
  "Relacionamento",
  "Localização",
  "Personagem",
  "Memória",
  "Fato",
  "Usuário",
  "Assistente",
  "Narrativa",
]);

function extractNames(text: string): string[] {
  const matches = text.match(
    /\b[A-ZÁÀÂÃÉÊÍÓÔÕÚÇ][a-záàâãéêíóôõúç]+(?:\s+[A-ZÁÀÂÃÉÊÍÓÔÕÚÇ][a-záàâãéêíóôõúç]+)*/g
  ) ?? [];

  return matches.filter(
    (name) => !IGNORED_WORDS.has(name)
  );
}

function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function validateMemoryFact(
  fact: string,
  originalMessages: string
): FactValidationResult {
  const names = extractNames(fact);

  const source = normalize(originalMessages);

  const unknownNames = names.filter(
    (name) => !source.includes(normalize(name))
  );

  if (unknownNames.length > 0) {
    return {
      accepted: false,
      reason: "Possíveis nomes não encontrados nas mensagens.",
      unknownNames,
    };
  }

  return {
    accepted: true,
    reason: "Nenhum nome desconhecido identificado.",
    unknownNames: [],
  };
}
