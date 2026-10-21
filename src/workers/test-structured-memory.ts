
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

const CONVERSATION_ID = "cmv5mf38s00004suzi2jh5mw8";

async function main() {
  const { prisma } = await import("../lib/prisma");

  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: CONVERSATION_ID },
      select: { id: true },
    });

    if (!conversation) {
      throw new Error("Conversa não encontrada.");
    }

    const content =
      "Elara Voss é uma viajante de Aetheria puxada para fora do seu reino por um cristal que a conectava a ele.";

    const existing = await prisma.memoryFact.findFirst({
      where: {
        conversationId: CONVERSATION_ID,
        originalText: content,
      },
    });

    if (existing) {
      console.log("ℹ️ Fato já registrado.");
    } else {
      await prisma.memoryFact.create({
        data: {
          conversationId: CONVERSATION_ID,
          category: "identity",
          subject: "Elara Voss",
          content,
          originalText: content,
          certainty: "confirmed",
          source: "manual-test",
        },
      });

      console.log("✅ Fato registrado com sucesso.");
    }

    const facts = await prisma.memoryFact.findMany({
      where: {
        conversationId: CONVERSATION_ID,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    console.log("\n========== MEMÓRIA ESTRUTURADA ==========\n");

    for (const fact of facts) {
      console.log(`ID: ${fact.id}`);
      console.log(`Categoria: ${fact.category}`);
      console.log(`Sujeito: ${fact.subject}`);
      console.log(`Conteúdo: ${fact.content}`);
      console.log(`Certeza: ${fact.certainty}`);
      console.log(`Origem: ${fact.source}`);
      console.log("");
    }

    console.log("Total de fatos:", facts.length);
    console.log(
      "🔒 Memória permanente antiga não foi modificada."
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("❌ Erro:", error);
  process.exitCode = 1;
});
