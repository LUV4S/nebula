
import { prisma } from "@/lib/prisma";
import { getMemoryFactHash } from "@/lib/memory-fact-utils";

export type NewMemoryFact = {
  content: string;
  category?: string;
  subject?: string;
  certainty?: string;
};

export async function saveStructuredMemoryFacts(
  conversationId: string,
  facts: NewMemoryFact[]
) {
  const uniqueFacts = new Map<string, NewMemoryFact>();

  for (const fact of facts) {
    const content = fact.content.trim();

    if (!content) continue;

    const hash = getMemoryFactHash(content);

    if (!uniqueFacts.has(hash)) {
      uniqueFacts.set(hash, {
        ...fact,
        content,
      });
    }
  }

  if (uniqueFacts.size === 0) {
    return {
      inserted: 0,
    };
  }

  const result = await prisma.memoryFact.createMany({
    data: [...uniqueFacts.entries()].map(
      ([hash, fact]) => ({
        conversationId,
        content: fact.content,
        originalText: fact.content,
        contentHash: hash,
        category: fact.category ?? "general",
        subject: fact.subject ?? "",
        certainty: fact.certainty ?? "uncertain",
        source: "memory-worker",
        isEssential: false,
      })
    ),
    skipDuplicates: true,
  });

  return {
    inserted: result.count,
  };
}
