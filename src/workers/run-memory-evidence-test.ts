
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

const CONVERSATION_ID = "cmv5zacye0001awuzxrbvn60c";

async function main() {
  const { prisma } = await import("../lib/prisma");
  const { updateConversationMemory } = await import(
    "../lib/conversation-memory"
  );

  try {
    const before = await prisma.conversation.findUniqueOrThrow({
      where: { id: CONVERSATION_ID },
      select: {
        memoryUpdatedAt: true,
        _count: {
          select: {
            messages: true,
            memoryFacts: true,
            memoryVersions: true,
          },
        },
      },
    });

    if (
      !before.memoryUpdatedAt ||
      before._count.messages !== 12 ||
      before._count.memoryFacts !== 1 ||
      before._count.memoryVersions !== 1
    ) {
      throw new Error(
        "Estado inicial inesperado. Teste cancelado."
      );
    }

    const pending = await prisma.message.count({
      where: {
        conversationId: CONVERSATION_ID,
        createdAt: {
          gt: before.memoryUpdatedAt,
        },
      },
    });

    if (pending !== 6) {
      throw new Error(
        `Esperadas 6 mensagens pendentes; encontradas ${pending}.`
      );
    }

    console.log("\n========== TESTE COM EVIDÊNCIAS ==========\n");

    await updateConversationMemory(
      CONVERSATION_ID,
      process.env.OLLAMA_BASE_URL ??
        "http://localhost:11434",
      process.env.OLLAMA_MODEL ??
        "llama3.2:3b"
    );

    const after = await prisma.conversation.findUniqueOrThrow({
      where: { id: CONVERSATION_ID },
      select: {
        memoryUpdatedAt: true,
        _count: {
          select: {
            memoryFacts: true,
            memoryVersions: true,
          },
        },
      },
    });

    const newFacts = await prisma.memoryFact.findMany({
      where: {
        conversationId: CONVERSATION_ID,
        source: "memory-worker",
        createdAt: { gte: new Date(Date.now() - 120000) },
      },
      select: {
        content: true,
        originalText: true,
        certainty: true,
      },
    });

    console.log("Fatos totais:", after._count.memoryFacts);
    console.log("Versões:", after._count.memoryVersions);
    console.log(
      "Cursor avançou:",
      !!after.memoryUpdatedAt &&
        after.memoryUpdatedAt > before.memoryUpdatedAt
    );

    console.log("\n========== FATOS E EVIDÊNCIAS ==========\n");

    for (const fact of newFacts) {
      console.log("Fato:", fact.content);
      console.log("Evidência:", fact.originalText);
      console.log("Certeza:", fact.certainty);
      console.log("");
    }

    if (
      !after.memoryUpdatedAt ||
      after.memoryUpdatedAt <= before.memoryUpdatedAt ||
      after._count.memoryVersions !== 2
    ) {
      throw new Error(
        "O processamento não atualizou cursor e histórico como esperado."
      );
    }

    console.log("✅ Processamento concluído.");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("❌ Erro:", error);
  process.exitCode = 1;
});
