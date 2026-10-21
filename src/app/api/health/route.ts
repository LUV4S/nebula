
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const userCount = await prisma.user.count();

    return NextResponse.json({
      status: "ok",
      database: "connected",
      users: userCount,
    });
  } catch (error) {
    console.error("Erro ao consultar o PostgreSQL:", error);

    return NextResponse.json(
      {
        status: "error",
        message: "Não foi possível consultar o banco de dados.",
      },
      { status: 500 },
    );
  }
}
