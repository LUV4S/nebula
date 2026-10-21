
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import type { Prisma } from "@/generated/prisma/client";

const characterSchema = z.object({
  name: z.string().trim().min(2).max(60),
  category: z.string().trim().min(2).max(40),
  description: z.string().trim().min(10).max(1000),
  personality: z.string().trim().min(10).max(3000),
  scenario: z.string().trim().min(10).max(3000),
  greeting: z.string().trim().min(2).max(1000),
});

const querySchema = z.object({
  category: z.string().trim().max(40).optional(),
  search: z.string().trim().max(100).optional(),
  ordering: z.enum([
    "name",
    "-name",
    "createdAt",
    "-createdAt",
    "category",
    "-category",
  ]).default("-createdAt"),
  page: z.coerce.number().int().min(1).max(100000).default(1),
  page_size: z.coerce.number().int().min(1).max(50).default(10),
});

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Você precisa entrar na sua conta para criar personagens." },
        { status: 401 }
      );
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "O conteúdo enviado não é um JSON válido." },
        { status: 400 }
      );
    }

    const result = characterSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error:
            "Confira os campos. Preencha todos corretamente e respeite os limites de caracteres.",
        },
        { status: 400 }
      );
    }

    const character = await prisma.character.create({
      data: {
        ...result.data,
        creatorId: session.user.id,
      },
      select: {
        id: true,
        name: true,
        category: true,
        description: true,
        personality: true,
        scenario: true,
        greeting: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        message: "Personagem criado com sucesso!",
        character,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao criar personagem:", error);

    return NextResponse.json(
      { error: "Não foi possível criar o personagem." },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const queryResult = querySchema.safeParse({
      category: searchParams.get("category") ?? undefined,
      search: searchParams.get("search") ?? undefined,
      ordering: searchParams.get("ordering") ?? undefined,
      page: searchParams.get("page") ?? undefined,
      page_size: searchParams.get("page_size") ?? undefined,
    });

    if (!queryResult.success) {
      return NextResponse.json(
        {
          error: "Parâmetros de consulta inválidos.",
          details: queryResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const {
      category,
      search,
      ordering,
      page,
      page_size,
    } = queryResult.data;

    const where: Prisma.CharacterWhereInput = {};

    // Filtro por categoria
    if (category) {
      where.category = {
        equals: category,
        mode: "insensitive",
      };
    }

    // Busca textual no nome e na descrição
    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    // Ordenação
    const descending = ordering.startsWith("-");
    const field = descending
      ? ordering.slice(1)
      : ordering;

    const direction = descending ? "desc" : "asc";

    const orderBy: Prisma.CharacterOrderByWithRelationInput[] = [
      {
        [field]: direction,
      },
      {
        id: "asc",
      },
    ];

    // Paginação
    const skip = (page - 1) * page_size;

    const [characters, total] = await prisma.$transaction([
      prisma.character.findMany({
        where,
        orderBy,
        skip,
        take: page_size,
        select: {
          id: true,
          name: true,
          category: true,
          description: true,
          createdAt: true,
          creator: {
            select: {
              name: true,
            },
          },
        },
      }),
      prisma.character.count({
        where,
      }),
    ]);

    const totalPages = Math.ceil(total / page_size);

    return NextResponse.json({
      characters,
      pagination: {
        page,
        page_size,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1 && page <= totalPages,
      },
      filters: {
        category: category || null,
        search: search || null,
        ordering,
      },
    });
  } catch (error) {
    console.error("Erro ao listar personagens:", error);

    return NextResponse.json(
      { error: "Não foi possível listar os personagens." },
      { status: 500 }
    );
  }
}
