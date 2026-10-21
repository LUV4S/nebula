
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

const CONVERSATION_ID = "cmv5mf38s00004suzi2jh5mw8";

async function main() {
  const { prisma } = await import("../lib/prisma");

  try {
    const fact = await prisma.memoryFact.findFirst({
      where: {
        conversationId: CONVERSATION_ID,
        content: {
          startsWith: "Elara Voss é uma viajante de Aetheria",
        },
      },
    });

    if (!fact) {
      throw new Error("Memória de identidade não encontrada.");
    }

    await prisma.memoryFact.update({
      where: { id: fact.id },
      data: { isEssential: true },
    });

    const essentialFacts = await prisma.memoryFact.findMany({
      where: {
        conversationId: CONVERSATION_ID,
        isEssential: true,
      },
      select: {
        id: true,
        content: true,
      },
    });

    console.log("\n========== MEMÓRIAS ESSENCIAIS ==========\n");

    for (const item of essentialFacts) {
      console.log("ID:", item.id);
      console.log("Conteúdo:", item.content);
      console.log("");
    }

    console.log("Total:", essentialFacts.length);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("❌ Erro:", error);
  process.exitCode = 1;
});
