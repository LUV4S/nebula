
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { mkdir, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

export async function POST(
  request: Request,
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
      id: true,
      imageUrl: true,
    },
  });

  if (!character) {
    return NextResponse.json(
      { error: "Personagem não encontrado." },
      { status: 404 }
    );
  }

  try {
    const formData = await request.formData();
    const image = formData.get("image");

    if (!(image instanceof File)) {
      return NextResponse.json(
        { error: "Nenhuma imagem foi enviada." },
        { status: 400 }
      );
    }

    if (image.size === 0 || image.size > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        { error: "A imagem deve ter no máximo 10 MB." },
        { status: 400 }
      );
    }

    const bytes = Buffer.from(await image.arrayBuffer());

    // Confirma que o arquivo possui assinatura PNG.
    const pngSignature = Buffer.from([
      137, 80, 78, 71, 13, 10, 26, 10,
    ]);

    if (
      bytes.length < 24 ||
      !bytes.subarray(0, 8).equals(pngSignature)
    ) {
      return NextResponse.json(
        { error: "Envie uma imagem PNG válida." },
        { status: 400 }
      );
    }

    const filename = `${randomUUID()}.png`;

    const uploadDirectory = path.join(
      process.cwd(),
      "public",
      "uploads",
      "characters"
    );

    await mkdir(uploadDirectory, { recursive: true });

    const filePath = path.join(uploadDirectory, filename);
    const imageUrl = `/uploads/characters/${filename}`;

    await writeFile(filePath, bytes);

    try {
      const updated = await prisma.character.updateMany({
        where: {
          id,
          creatorId: session.user.id,
        },
        data: {
          imageUrl,
        },
      });

      if (updated.count === 0) {
        await unlink(filePath).catch(() => {});

        return NextResponse.json(
          { error: "Personagem não encontrado." },
          { status: 404 }
        );
      }
    } catch (error) {
      await unlink(filePath).catch(() => {});
      throw error;
    }

    // Remove a imagem anterior somente se ela pertencer
    // à pasta de uploads gerenciada por esta rota.
    if (
      character.imageUrl?.startsWith("/uploads/characters/")
    ) {
      const oldFilename = path.basename(character.imageUrl);
      const oldPath = path.join(uploadDirectory, oldFilename);

      if (oldFilename !== filename) {
        await unlink(oldPath).catch(() => {});
      }
    }

    return NextResponse.json({
      imageUrl,
      message: "Imagem salva com sucesso.",
    });
  } catch (error) {
    console.error("Erro ao salvar imagem:", error);

    return NextResponse.json(
      { error: "Não foi possível salvar a imagem." },
      { status: 500 }
    );
  }
}
