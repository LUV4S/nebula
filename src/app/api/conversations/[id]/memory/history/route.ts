
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(
  _request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado." },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    const conversation = await prisma.conversation.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      select: {
        id: true,
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversa não encontrada." },
        { status: 404 }
      );
    }

    const versions = await prisma.memoryVersion.findMany({
      where: {
        conversationId: id,
      },
      orderBy: [
        { createdAt: "desc" },
        { id: "desc" },
      ],
      select: {
        id: true,
        permanentMemory: true,
        narrativeMemory: true,
        createdAt: true,
      },
      take: 50,
    });

    return NextResponse.json({ versions });
  } catch (error) {
    console.error(
      "Erro ao consultar histórico de memória:",
      error
    );

    return NextResponse.json(
      { error: "Erro ao consultar histórico." },
      { status: 500 }
    );
  }
}
