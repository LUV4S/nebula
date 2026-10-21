
import { loadEnvConfig } from "@next/env";
import { getMemoryFactHash } from "../lib/memory-fact-utils";

loadEnvConfig(process.cwd());

async function main() {
  const { prisma } = await import("../lib/prisma");

  try {
    const facts = await prisma.memoryFact.findMany({
      select: {
        id: true,
        conversationId: true,
        originalText: true,
        contentHash: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    let updated = 0;
    let duplicates = 0;

    for (const fact of facts) {
      const hash = getMemoryFactHash(fact.originalText);

      if (fact.contentHash === hash) {
        continue;
      }

      const existing = await prisma.memoryFact.findFirst({
        where: {
          conversationId: fact.conversationId,
          contentHash: hash,
          id: {
            not: fact.id,
          },
        },
      });

      if (existing) {
        console.log(
          `⚠️ Duplicata identificada: ${fact.id}`
        );

        duplicates++;
        continue;
      }

      await prisma.memoryFact.update({
        where: {
          id: fact.id,
        },
        data: {
          contentHash: hash,
        },
      });

      updated++;
    }

    console.log("\n========== RESULTADO ==========\n");
    console.log("Registros encontrados:", facts.length);
    console.log("Hashes atualizados:", updated);
    console.log("Duplicatas identificadas:", duplicates);
    console.log(
      "🔒 Nenhum fato foi excluído ou reescrito."
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("❌ Erro:", error);
  process.exitCode = 1;
});
