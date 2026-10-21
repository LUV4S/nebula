
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const characterSchema = z.object({
  name: z.string().trim().min(2).max(60),
  category: z.string().trim().min(2).max(40),
  description: z.string().trim().min(10).max(1000),
  personality: z.string().trim().min(10).max(3000),
  scenario: z.string().trim().min(10).max(3000),
  greeting: z.string().trim().min(2).max(1000),
}).strict();

const partialCharacterSchema = characterSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: "Informe pelo menos um campo para atualizar." }
);

const characterSelect = {
  id: true,
  name: true,
  category: true,
  description: true,
  personality: true,
  scenario: true,
  greeting: true,
  imageUrl: true,
  updatedAt: true,
} as const;

async function parseJson(request: Request) {
  try {
    return {
      success: true as const,
      body: await request.json() as unknown,
    };
  } catch {
    return { success: false as const };
  }
}

export async function GET(
  _request: Request,
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

    const character = await prisma.character.findFirst({
      where: {
        id,
        creatorId: session.user.id,
      },
      select: characterSelect,
    });

    if (!character) {
      return NextResponse.json(
        { error: "Personagem não encontrado ou sem permissão." },
        { status: 404 }
      );
    }

    return NextResponse.json({ character });
  } catch (error) {
    console.error("Erro ao buscar personagem:", error);

    return NextResponse.json(
      { error: "Não foi possível carregar o personagem." },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    const parsed = await parseJson(request);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "JSON inválido." },
        { status: 400 }
      );
    }

    const validation = characterSchema.safeParse(parsed.body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Dados inválidos para atualização completa.",
          details: validation.error.flatten(),
        },
        { status: 400 }
      );
    }

    const result = await prisma.character.updateMany({
      where: {
        id,
        creatorId: session.user.id,
      },
      data: validation.data,
    });

    if (result.count === 0) {
      return NextResponse.json(
        { error: "Personagem não encontrado ou sem permissão." },
        { status: 404 }
      );
    }

    const character = await prisma.character.findUnique({
      where: { id },
      select: characterSelect,
    });

    return NextResponse.json({
      message: "Personagem atualizado completamente!",
      character,
    });
  } catch (error) {
    console.error("Erro no PUT do personagem:", error);

    return NextResponse.json(
      { error: "Não foi possível atualizar o personagem." },
      { status: 500 }
    );
  }
}

export async function PATCH(
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

    const parsed = await parseJson(request);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "JSON inválido." },
        { status: 400 }
      );
    }

    const validation = partialCharacterSchema.safeParse(parsed.body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Dados inválidos para atualização parcial.",
          details: validation.error.flatten(),
        },
        { status: 400 }
      );
    }

    const result = await prisma.character.updateMany({
      where: {
        id,
        creatorId: session.user.id,
      },
      data: validation.data,
    });

    if (result.count === 0) {
      return NextResponse.json(
        { error: "Personagem não encontrado ou sem permissão." },
        { status: 404 }
      );
    }

    const character = await prisma.character.findUnique({
      where: { id },
      select: characterSelect,
    });

    return NextResponse.json({
      message: "Personagem atualizado parcialmente!",
      character,
    });
  } catch (error) {
    console.error("Erro no PATCH do personagem:", error);

    return NextResponse.json(
      { error: "Não foi possível atualizar o personagem." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
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

    const result = await prisma.character.deleteMany({
      where: {
        id,
        creatorId: session.user.id,
      },
    });

    if (result.count === 0) {
      return NextResponse.json(
        { error: "Personagem não encontrado ou sem permissão." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Personagem excluído com sucesso.",
    });
  } catch (error) {
    console.error("Erro ao excluir personagem:", error);

    return NextResponse.json(
      {
        error:
          "Não foi possível excluir o personagem. Verifique se existem conversas vinculadas.",
      },
      { status: 500 }
    );
  }
}
