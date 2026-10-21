
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createConversationSchema = z.object({
  characterId: z.string().min(1, "Personagem inválido."),
});

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Você precisa estar conectado." },
        { status: 401 }
      );
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        updatedAt: "desc",
      },
      include: {
        character: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    });

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error("Erro ao listar conversas:", error);

    return NextResponse.json(
      { error: "Não foi possível carregar as conversas." },
      { status: 500 }
    );
  }
}


export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Você precisa estar conectado." },
        { status: 401 }
      );
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "O corpo da requisição não é um JSON válido." },
        { status: 400 }
      );
    }

    const validation = createConversationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Informe um personagem válido." },
        { status: 400 }
      );
    }

    const { characterId } = validation.data;

    const character = await prisma.character.findUnique({
      where: { id: characterId },
      select: {
        id: true,
        greeting: true,
      },
    });

    if (!character) {
      return NextResponse.json(
        { error: "Personagem não encontrado." },
        { status: 404 }
      );
    }

    // Verifica se já existe uma conversa com o personagem.
    const existingConversation = await prisma.conversation.findUnique({
      where: {
        userId_characterId: {
          userId: session.user.id,
          characterId,
        },
      },
    });

    if (existingConversation) {
      // Mantém o histórico existente sem duplicar a introdução.
      return NextResponse.json(
        { conversation: existingConversation },
        { status: 200 }
      );
    }

    // Cria a conversa e sua mensagem inicial na mesma transação.
    const conversation = await prisma.$transaction(async (tx) => {
      const newConversation = await tx.conversation.create({
        data: {
          userId: session.user.id,
          characterId,
        },
      });

      const greeting = character.greeting?.trim();

      if (greeting) {
        await tx.message.create({
          data: {
            conversationId: newConversation.id,
            role: "ASSISTANT",
            content: greeting,
          },
        });
      }

      return newConversation;
    });

    return NextResponse.json(
      { conversation },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao criar conversa:", error);

    return NextResponse.json(
      { error: "Não foi possível criar a conversa." },
      { status: 500 }
    );
  }
}
