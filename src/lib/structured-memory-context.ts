
type MemoryFactInput = {
  id: string;
  content: string;
  category: string;
  certainty: string;
};

type MemoryContextOptions = {
  maxChars?: number;
  query?: string;
  essentialFactIds?: string[];
  essentialRatio?: number;
};

const STOP_WORDS = new Set([
  "a", "o", "as", "os", "um", "uma",
  "de", "do", "da", "dos", "das",
  "em", "no", "na", "nos", "nas",
  "e", "ou", "com", "para", "por",
  "que", "se", "eu", "voce", "ele",
  "ela", "eles", "elas", "me", "te",
  "meu", "minha", "seu", "sua",
  "foi", "era", "esta", "estava",
  "sobre", "como", "qual", "quando",
  "onde", "porque", "mais", "muito",
  "aconteceu",
]);

function tokenize(text: string): string[] {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .match(/[a-z0-9]+/g)
    ?.filter(
      (word) => word.length > 2 && !STOP_WORDS.has(word)
    ) ?? [];
}

function relevanceScore(
  content: string,
  queryTokens: Set<string>
): number {
  const factTokens = new Set(tokenize(content));

  let score = 0;

  for (const token of queryTokens) {
    if (factTokens.has(token)) score++;
  }

  return score;
}

export function buildStructuredMemoryContext(
  facts: MemoryFactInput[],
  options: MemoryContextOptions = {}
): string {
  const {
    maxChars = 3000,
    query = "",
    essentialFactIds = [],
    essentialRatio = 0.3,
  } = options;
  // Apenas fatos explicitamente confirmados podem
  // ser utilizados como contexto do personagem.
  const trustedFacts = facts.filter(
    (fact) => fact.certainty === "confirmed"
  );

  const safeLimit = Math.max(0, Math.floor(maxChars));
  const safeRatio = Math.max(
    0,
    Math.min(1, essentialRatio)
  );

  const essentialBudget = Math.floor(
    safeLimit * safeRatio
  );

  const essentialIds = new Set(essentialFactIds);
  const selectedIds = new Set<string>();
  const selected: string[] = [];

  let usedChars = 0;

  function addFact(
    fact: MemoryFactInput,
    budget: number
  ): boolean {
    if (selectedIds.has(fact.id)) return false;

    const content = fact.content.trim();
    if (!content) return false;

    const line = `- ${content}`;
    const cost = line.length + (selected.length ? 1 : 0);

    if (usedChars + cost > budget) {
      return false;
    }

    selected.push(line);
    selectedIds.add(fact.id);
    usedChars += cost;

    return true;
  }

  // Primeiro: fatos fundamentais explicitamente escolhidos.
  for (const fact of trustedFacts) {
    if (essentialIds.has(fact.id)) {
      addFact(fact, essentialBudget);
    }
  }

  // Segundo: fatos relacionados à pergunta.
  const queryTokens = new Set(tokenize(query));

  const ranked = trustedFacts
    .filter((fact) => !selectedIds.has(fact.id))
    .map((fact, index) => ({
      fact,
      index,
      score: relevanceScore(
        fact.content,
        queryTokens
      ),
    }))
    .filter((item) => item.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        a.index - b.index
    );

  for (const item of ranked) {
    addFact(item.fact, safeLimit);
  }

  return selected.join("\n");
}
