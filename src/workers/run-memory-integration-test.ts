
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

const CONVERSATION_ID = "cmv5zacye0001awuzxrbvn60c";

async function main() {
  const { prisma } = await import("../lib/prisma");

  const { updateConversationMemory } = await import(
    "../lib/conversation-memory"
  );

  const ollamaUrl =
    process.env.OLLAMA_BASE_URL ??
    "http://localhost:11434";

  const model =
    process.env.OLLAMA_MODEL ??
    "llama3.2:3b";

  try {
    console.log(
      "\n========== TESTE DO WORKER ==========\n"
    );

    console.log("Conversa:", CONVERSATION_ID);
    console.log("Modelo:", model);
    console.log("Ollama:", ollamaUrl);

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
      before.memoryUpdatedAt !== null ||
      before._count.messages !== 6 ||
      before._count.memoryFacts !== 0 ||
      before._count.memoryVersions !== 0
    ) {
      throw new Error(
        "A conversa não está no estado inicial esperado. Teste cancelado."
      );
    }

    console.log("\n🧠 Iniciando processamento...\n");

    await updateConversationMemory(
      CONVERSATION_ID,
      ollamaUrl,
      model
    );

    const after = await prisma.conversation.findUniqueOrThrow({
      where: { id: CONVERSATION_ID },
      select: {
        memoryUpdatedAt: true,
        permanentMemory: true,
        memory: true,
        _count: {
          select: {
            memoryFacts: true,
            memoryVersions: true,
          },
        },
      },
    });

    console.log(
      "\n========== RESULTADO ==========\n"
    );

    console.log(
      "Cursor atualizado:",
      after.memoryUpdatedAt !== null
    );

    console.log(
      "Fatos estruturados:",
      after._count.memoryFacts
    );

    console.log(
      "Versões históricas:",
      after._count.memoryVersions
    );

    console.log(
      "\nMemória permanente:\n",
      after.permanentMemory
    );

    console.log(
      "\nMemória narrativa:\n",
      after.memory
    );

    if (!after.memoryUpdatedAt) {
      throw new Error(
        "O cursor não foi atualizado. Verifique os logs do worker."
      );
    }

    if (after._count.memoryVersions !== 1) {
      throw new Error(
        "Era esperada uma versão histórica."
      );
    }

    console.log(
      "\n✅ Processamento concluído."
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("\n❌ Erro:", error);
  process.exitCode = 1;
});
