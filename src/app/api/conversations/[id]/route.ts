
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  _request: Request,
  { params }: RouteContext
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Você precisa estar conectado." },
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
        id: true,
        character: {
          select: {
            id: true,
            name: true,
            category: true,
            imageUrl: true,
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

    return NextResponse.json({ conversation });
  } catch (error) {
    console.error("Erro ao buscar conversa:", error);

    return NextResponse.json(
      { error: "Não foi possível carregar a conversa." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
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
        id: true,
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversa não encontrada." },
        { status: 404 }
      );
    }

    await prisma.conversation.delete({
      where: {
        id: conversation.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Conversa excluída com sucesso.",
    });
  } catch (error) {
    console.error("Erro ao excluir conversa:", error);

    return NextResponse.json(
      { error: "Não foi possível excluir a conversa." },
      { status: 500 }
    );
  }
}
