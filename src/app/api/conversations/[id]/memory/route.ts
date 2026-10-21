
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  request: Request,
  { params }: RouteContext
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Você precisa entrar na sua conta." },
        { status: 401 }
      );
    }

    const { id } = await params;

    const conversation = await prisma.conversation.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      select: {
        memory: true,
        permanentMemory: true,
        memoryUpdatedAt: true,
        character: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversa não encontrada." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      memory: conversation.memory,
      permanentMemory: conversation.permanentMemory,
      memoryUpdatedAt: conversation.memoryUpdatedAt,
      characterName: conversation.character.name,
    });
  } catch (error) {
    console.error("Erro ao buscar memória:", error);

    return NextResponse.json(
      { error: "Não foi possível carregar a memória." },
      { status: 500 }
    );
  }
}
