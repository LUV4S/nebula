
import { loadEnvConfig } from "@next/env";
import { MessageRole } from "../generated/prisma/client";

loadEnvConfig(process.cwd());

const CONVERSATION_ID = "cmv5zacye0001awuzxrbvn60c";

async function main() {
  const { prisma } = await import("../lib/prisma");

  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: CONVERSATION_ID },
      select: {
        id: true,
        _count: {
          select: {
            messages: true,
          },
        },
      },
    });

    if (!conversation) {
      throw new Error("Conversa de teste não encontrada.");
    }

    if (conversation._count.messages !== 0) {
      throw new Error(
        "A conversa já possui mensagens. Teste cancelado."
      );
    }

    const messages = [
      {
        role: MessageRole.USER,
        content:
          "Meu nome é Caio. Sou um explorador da cidade de Valedouro.",
      },
      {
        role: MessageRole.ASSISTANT,
        content:
          "Prazer, Caio. Sou Lyra, uma guardiã da biblioteca de Valedouro.",
      },
      {
        role: MessageRole.USER,
        content:
          "Encontrei uma chave prateada perto da torre antiga.",
      },
      {
        role: MessageRole.ASSISTANT,
        content:
          "Essa chave pode abrir uma das portas da biblioteca, mas ainda não sabemos qual.",
      },
      {
        role: MessageRole.USER,
        content:
          "Quero investigar a torre antes de tentar abrir qualquer porta.",
      },
      {
        role: MessageRole.ASSISTANT,
        content:
          "Lyra concordou em acompanhar Caio até a torre para investigar.",
      },
    ];

    await prisma.message.createMany({
      data: messages.map((message, index) => ({
        conversationId: CONVERSATION_ID,
        role: message.role,
        content: message.content,
        createdAt: new Date(
          Date.now() - (messages.length - index) * 1000
        ),
      })),
    });

    console.log("✅ Seis mensagens de teste inseridas.");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("❌ Erro:", error);
  process.exitCode = 1;
});
