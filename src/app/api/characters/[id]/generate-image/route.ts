
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { generateCharacterImage } from "@/lib/comfyui";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(
  _request: Request,
  context: RouteContext
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Você precisa estar autenticado." },
      { status: 401 }
    );
  }

  const { id } = await context.params;

  const character = await prisma.character.findFirst({
    where: {
      id,
      creatorId: session.user.id,
    },
    select: {
      name: true,
      category: true,
      description: true,
      personality: true,
      scenario: true,
    },
  });

  if (!character) {
    return NextResponse.json(
      { error: "Personagem não encontrado." },
      { status: 404 }
    );
  }

  // O SDXL costuma interpretar melhor prompts em inglês.
  // Inicialmente, usamos uma estrutura em inglês e
  // incluímos as informações originais do personagem.
  const prompt = [
    "high quality, detailed character portrait",
    "single character, upper body, detailed face",
    "cinematic lighting, professional character concept art",
    `Character name: ${character.name}`,
    `Category: ${character.category}`,
    `Appearance and description: ${character.description}`,
    `Personality and expression: ${character.personality}`,
    `Environment: ${character.scenario}`,
    "sharp focus, detailed eyes, beautiful composition",
  ].join(", ");

  try {
    const image = await generateCharacterImage(prompt);

    return new Response(new Uint8Array(image), {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Erro ao gerar imagem:", error);

    return NextResponse.json(
      {
        error:
          "Não foi possível gerar a imagem. Verifique se o ComfyUI está aberto e funcionando.",
      },
      { status: 500 }
    );
  }
}
