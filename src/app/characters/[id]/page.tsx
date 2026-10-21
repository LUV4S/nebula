
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import StartChatButton from "@/app/components/start-chat-button";
import { auth } from "@/auth";

type CharacterPageProps = {
  params: Promise<{ id: string }>;
};

async function CharacterDetails({ params }: CharacterPageProps) {
  const { id } = await params;
  const session = await auth();

  const character = await prisma.character.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      category: true,
      description: true,
      personality: true,
      scenario: true,
      greeting: true,
      createdAt: true,
      creatorId: true,
      imageUrl: true,
      creator: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!character) {
    notFound();
  }

  const initials = character.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  const isOwner = session?.user?.id === character.creatorId;

  return (
    <main className="min-h-screen bg-[#0b0b10] text-white">
      <header className="border-b border-white/10 bg-[#0b0b10]/95">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-5">
          <Link
            href="/"
            className="text-2xl font-bold tracking-tight"
          >
            <span className="text-violet-400">N</span>ebula
          </Link>

          <Link
            href="/"
            className="text-sm text-gray-400 transition hover:text-white"
          >
            ← Voltar para explorar
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 md:py-12">
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#111118]">
          {/* Capa do personagem */}
          <div className="relative h-36 overflow-hidden bg-gradient-to-r from-violet-700 via-indigo-900 to-[#171425] sm:h-48">
            <div className="absolute -left-12 -top-24 h-72 w-72 rounded-full bg-violet-400/20 blur-3xl" />
            <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-indigo-500/20 blur-3xl" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#111118]/70 to-transparent" />
          </div>

          {/* Informações principais */}
          <div className="relative px-5 pb-8 sm:px-8 md:px-10">
            <div className="-mt-14 flex flex-col gap-5 sm:-mt-16 sm:flex-row sm:items-end sm:gap-7">
              {/* Imagem de perfil */}
              <div className="relative z-10 h-36 w-36 shrink-0 overflow-hidden rounded-2xl border-4 border-[#111118] bg-[#201733] shadow-2xl sm:h-44 sm:w-44">
                {character.imageUrl ? (
                  <img
                    src={character.imageUrl}
                    alt={`Imagem de ${character.name}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-600 to-indigo-950 text-5xl font-bold">
                    {initials}
                  </div>
                )}
              </div>

              {/* Nome e categoria */}
              <div className="relative z-10 min-w-0 flex-1 pb-1">
                <span className="inline-flex rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1 text-xs font-medium text-violet-300">
                  {character.category}
                </span>

                <h1 className="mt-3 break-words text-3xl font-bold tracking-tight sm:text-4xl">
                  {character.name}
                </h1>

                <p className="mt-2 text-sm text-gray-400">
                  Criado por{" "}
                  <span className="font-medium text-gray-200">
                    {character.creator.name || "Usuário da Nebula"}
                  </span>
                </p>
              </div>
            </div>

            {/* Descrição */}
            <div className="mt-8 border-t border-white/10 pt-7">
              <h2 className="text-lg font-semibold text-white">
                Sobre o personagem
              </h2>

              <p className="mt-3 whitespace-pre-wrap break-words leading-7 text-gray-300">
                {character.description}
              </p>
            </div>

            {/* Ações */}
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <StartChatButton characterId={character.id} />

              {isOwner && (
                <Link
                  href={`/characters/${character.id}/edit`}
                  className="inline-flex items-center justify-center rounded-xl border border-violet-500/40 bg-violet-500/10 px-5 py-3 text-sm font-semibold text-violet-200 transition hover:bg-violet-500/20"
                >
                  Editar personagem
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Conteúdo detalhado */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* Personalidade */}
          <section className="rounded-2xl border border-white/10 bg-[#111118] p-6 sm:p-7">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-xl text-violet-300">
                ✦
              </div>

              <h2 className="text-xl font-semibold">
                Personalidade
              </h2>
            </div>

            <p className="whitespace-pre-wrap break-words leading-7 text-gray-300">
              {character.personality}
            </p>
          </section>

          {/* Cenário */}
          <section className="rounded-2xl border border-white/10 bg-[#111118] p-6 sm:p-7">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-xl text-indigo-300">
                ◈
              </div>

              <h2 className="text-xl font-semibold">
                Cenário
              </h2>
            </div>

            <p className="whitespace-pre-wrap break-words leading-7 text-gray-300">
              {character.scenario}
            </p>
          </section>
        </div>

        {/* Primeira mensagem */}
        <section className="mt-6 rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/[0.08] to-[#111118] p-6 sm:p-8">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15 text-xl text-violet-300">
              ❝
            </div>

            <div>
              <h2 className="text-xl font-semibold">
                Primeira mensagem
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Como sua história começa
              </p>
            </div>
          </div>

          <p className="whitespace-pre-wrap break-words leading-7 text-gray-300">
            {character.greeting}
          </p>
        </section>
      </div>

      <footer className="mt-12 border-t border-white/10 px-6 py-8 text-center text-sm text-gray-500">
        Nebula © 2026 · Um universo de histórias interativas.
      </footer>
    </main>
  );
}

export default function CharacterPage({
  params,
}: CharacterPageProps) {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#0b0b10] text-gray-400">
          Carregando personagem...
        </main>
      }
    >
      <CharacterDetails params={params} />
    </Suspense>
  );
}
