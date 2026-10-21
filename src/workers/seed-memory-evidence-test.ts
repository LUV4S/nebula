
import { loadEnvConfig } from "@next/env";
import { MessageRole } from "../generated/prisma/client";

loadEnvConfig(process.cwd());

const CONVERSATION_ID = "cmv5zacye0001awuzxrbvn60c";

async function main() {
  const { prisma } = await import("../lib/prisma");

  try {
    const conversation = await prisma.conversation.findUniqueOrThrow({
      where: { id: CONVERSATION_ID },
      select: {
        memoryUpdatedAt: true,
        _count: {
          select: { messages: true },
        },
      },
    });

    if (
      !conversation.memoryUpdatedAt ||
      conversation._count.messages !== 6
    ) {
      throw new Error(
        "Estado inesperado da conversa. Teste cancelado."
      );
    }

    const messages = [
      {
        role: MessageRole.USER,
        content:
          "Lyra, encontrei um mapa antigo dentro de uma caixa de madeira.",
      },
      {
        role: MessageRole.ASSISTANT,
        content:
          "O mapa mostra três torres ao redor da cidade de Valedouro.",
      },
      {
        role: MessageRole.USER,
        content:
          "A torre do norte está marcada com um símbolo de lua.",
      },
      {
        role: MessageRole.ASSISTANT,
        content:
          "Lyra explicou que o símbolo pode indicar uma passagem secreta, mas isso ainda é uma hipótese.",
      },
      {
        role: MessageRole.USER,
        content:
          "Decidi guardar o mapa e investigar a torre do norte amanhã.",
      },
      {
        role: MessageRole.ASSISTANT,
        content:
          "Lyra concordou em acompanhar Caio na investigação da torre do norte.",
      },
    ];

    const startTime = Math.max(
      Date.now(),
      conversation.memoryUpdatedAt.getTime() + 1000
    );

    await prisma.message.createMany({
      data: messages.map((message, index) => ({
        conversationId: CONVERSATION_ID,
        role: message.role,
        content: message.content,
        createdAt: new Date(startTime + index * 1000),
      })),
    });

    console.log("✅ Seis novas mensagens inseridas.");
    console.log("Total esperado: 12 mensagens.");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("❌ Erro:", error);
  process.exitCode = 1;
});
