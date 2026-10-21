
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

async function main() {
  const conversationId = process.argv[2];

  if (!conversationId) {
    throw new Error(
      "Informe o ID da conversa de teste."
    );
  }

  const { prisma } = await import("../lib/prisma");

  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: {
        memoryUpdatedAt: true,
        permanentMemory: true,
        memory: true,
        memoryProcessingUntil: true,
        _count: {
          select: {
            messages: true,
            memoryFacts: true,
            memoryVersions: true,
          },
        },
      },
    });

    if (!conversation) {
      throw new Error("Conversa não encontrada.");
    }

    const facts = await prisma.memoryFact.findMany({
      where: { conversationId },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        content: true,
        certainty: true,
        source: true,
        isEssential: true,
      },
    });

    console.log("\n========== ESTADO DA MEMÓRIA ==========\n");

    console.log(
      "Mensagens:",
      conversation._count.messages
    );

    console.log(
      "Fatos estruturados:",
      conversation._count.memoryFacts
    );

    console.log(
      "Versões históricas:",
      conversation._count.memoryVersions
    );

    console.log(
      "Última atualização:",
      conversation.memoryUpdatedAt
    );

    console.log(
      "Processamento bloqueado até:",
      conversation.memoryProcessingUntil
    );

    console.log(
      "Memória permanente:",
      conversation.permanentMemory.length,
      "caracteres"
    );

    console.log(
      "Memória narrativa:",
      conversation.memory.length,
      "caracteres"
    );

    console.log("\n========== ÚLTIMOS FATOS ==========\n");

    for (const fact of facts) {
      console.log({
        content: fact.content,
        certainty: fact.certainty,
        source: fact.source,
        isEssential: fact.isEssential,
      });
    }

    console.log("\n🔒 Consulta somente de leitura.");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("❌ Erro:", error);
  process.exitCode = 1;
});
