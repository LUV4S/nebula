
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

const CONVERSATION_ID = "cmv5mf38s00004suzi2jh5mw8";

async function main() {
  const { prisma } = await import("../lib/prisma");

  const { saveStructuredMemoryFacts } = await import(
    "../lib/structured-memory-storage"
  );

  try {
    const before = await prisma.memoryFact.count({
      where: {
        conversationId: CONVERSATION_ID,
      },
    });

    const result = await saveStructuredMemoryFacts(
      CONVERSATION_ID,
      [
        {
          content:
            "Elara Voss é uma viajante de Aetheria puxada para fora do seu reino por um cristal que a conectava a ele.",
          category: "identity",
          subject: "Elara Voss",
          certainty: "confirmed",
        },
        {
          content:
            "Elara e Otto decidiram trabalhar juntos para entender o que aconteceu com Aetheria.",
          category: "event",
          subject: "Elara e Otto",
          certainty: "confirmed",
        },
      ]
    );

    const after = await prisma.memoryFact.count({
      where: {
        conversationId: CONVERSATION_ID,
      },
    });

    console.log("\n========== TESTE DE ARMAZENAMENTO ==========\n");

    console.log("Antes:", before);
    console.log("Inseridos:", result.inserted);
    console.log("Depois:", after);

    if (result.inserted !== 0 || before !== after) {
      throw new Error(
        "O teste deveria apenas identificar duplicatas existentes."
      );
    }

    console.log(
      "\n✅ Duplicatas identificadas corretamente."
    );

    console.log(
      "🔒 Nenhum fato existente foi modificado."
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("❌ Erro:", error);
  process.exitCode = 1;
});
