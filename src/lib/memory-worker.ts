
import { prisma } from "@/lib/prisma";
import { updateConversationMemory } from "@/lib/conversation-memory";

const INACTIVITY_TIME = 60 * 1000;

let isProcessing = false;

export async function processPendingMemories() {
  if (isProcessing) {
    return;
  }

  isProcessing = true;

  try {
    const inactivityLimit = new Date(
      Date.now() - INACTIVITY_TIME
    );

    const conversations = await prisma.conversation.findMany({
      where: {
        lastMessageAt: {
          lte: inactivityLimit,
        },
      },
      select: {
        id: true,
        lastMessageAt: true,
        memoryUpdatedAt: true,
      },
      orderBy: {
        lastMessageAt: "asc",
      },
      take: 10,
    });

    const ollamaUrl = (
      process.env.OLLAMA_URL || "http://127.0.0.1:11434"
    ).replace(/\/+$/, "");

    const model = process.env.OLLAMA_MODEL || "llama3.2:3b";

    for (const conversation of conversations) {
      if (
        conversation.memoryUpdatedAt &&
        conversation.lastMessageAt &&
        conversation.memoryUpdatedAt >= conversation.lastMessageAt
      ) {
        continue;
      }

      try {
        await updateConversationMemory(
          conversation.id,
          ollamaUrl,
          model
        );
      } catch (error) {
        console.error(
          `Erro ao atualizar memória da conversa ${conversation.id}:`,
          error
        );
      }
    }
  } finally {
    isProcessing = false;
  }
}
