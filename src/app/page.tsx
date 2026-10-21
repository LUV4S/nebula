
import Link from "next/link";
import { Suspense } from "react";
import AccountMenu from "./components/account-menu";
import { prisma } from "@/lib/prisma";

const demoCharacters = [
  {
    id: "demo-luna",
    name: "Luna",
    category: "Ficção científica",
    description:
      "Uma exploradora espacial que guarda segredos sobre uma estação abandonada.",
    color: "from-violet-500 to-indigo-900",
    initials: "LU",
    imageUrl: null,
  },
  {
    id: "demo-alex",
    name: "Alex",
    category: "Aventura",
    description:
      "Um aventureiro experiente que precisa de um parceiro para sua próxima missão.",
    color: "from-emerald-500 to-teal-900",
    initials: "AX",
    imageUrl: null,
  },
  {
    id: "demo-maya",
    name: "Maya",
    category: "Fantasia",
    description:
      "Uma maga curiosa que conhece histórias esquecidas de um reino distante.",
    color: "from-rose-500 to-purple-900",
    initials: "MY",
    imageUrl: null,
  },
  {
    id: "demo-noah",
    name: "Noah",
    category: "Mistério",
    description:
      "Um investigador reservado que está tentando solucionar um caso inexplicável.",
    color: "from-amber-500 to-orange-900",
    initials: "NO",
    imageUrl: null,
  },
];

const colors = [
  "from-violet-500 to-indigo-900",
  "from-emerald-500 to-teal-900",
  "from-rose-500 to-purple-900",
  "from-amber-500 to-orange-900",
  "from-sky-500 to-blue-900",
  "from-fuchsia-500 to-purple-900",
];

async function CharacterList() {
  const dbCharacters = await prisma.character.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      name: true,
      category: true,
      description: true,
      imageUrl: true,
    },
  });


  const characters = [
    ...dbCharacters.map((character, index) => ({
      ...character,
      isDemo: false,
      color: colors[index % colors.length],
      initials: character.name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase(),
    })),
    ...demoCharacters
      .filter(
        (demo) =>
          !dbCharacters.some(
            (character) =>
              character.name.toLowerCase() === demo.name.toLowerCase()
          )
      )
      .map((demo) => ({ ...demo, isDemo: true })),
  ];


  return (
    <>
      {characters.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {characters.map((character) => (
            <article
              key={character.id}
              className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition duration-300 hover:-translate-y-1 hover:border-violet-400/40 hover:bg-white/[0.05]"
            >
              <div className="relative h-56 overflow-hidden">
                {character.imageUrl ? (
                  <img
                    src={character.imageUrl}
                    alt={`Imagem de ${character.name}`}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div
                    className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${character.color}`}
                  >
                    <div className="flex h-24 w-24 items-center justify-center rounded-full border border-white/30 bg-black/20 text-3xl font-bold shadow-xl backdrop-blur">
                      {character.initials}
                    </div>
                  </div>
                )}

                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent" />
              </div>

              <div className="p-5">
                <span className="rounded-full bg-violet-400/10 px-3 py-1 text-xs text-violet-300">
                  {character.category}
                </span>

                <h3 className="mt-4 text-xl font-semibold">
                  {character.name}
                </h3>

                <p className="mt-2 min-h-16 text-sm leading-6 text-gray-400">
                  {character.description}
                </p>

                {character.isDemo ? (
                  <button
                    type="button"
                    disabled
                    className="mt-5 w-full cursor-not-allowed rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-gray-400"
                  >
                    Exemplo
                  </button>
                ) : (
                  <Link
                    href={`/characters/${character.id}`}
                    className="mt-5 block w-full rounded-xl bg-violet-600 px-4 py-3 text-center text-sm font-semibold transition hover:bg-violet-500"
                  >
                    Ver personagem →
                  </Link>
                )}

              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-12 text-center">
          <p className="text-gray-300">
            Ainda não há personagens cadastrados.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Que tal criar o primeiro?
          </p>
          <Link
            href="/create-character"
            className="mt-5 inline-flex rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold transition hover:bg-violet-500"
          >
            Criar personagem
          </Link>
        </div>
      )}
    </>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0b0b10] text-white">
      <header className="border-b border-white/10 bg-[#0b0b10]/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-5">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            <span className="text-violet-400">N</span>ebula
          </Link>

          <nav className="hidden items-center gap-7 text-sm text-gray-300 md:flex">
            <a href="#explorar" className="hover:text-white">
              Explorar
            </a>
            <a href="#recentes" className="hover:text-white">
              Recentes
            </a>
            <a href="#sobre" className="hover:text-white">
              Sobre
            </a>
          </nav>

          <AccountMenu />
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-white/5">
        <div className="pointer-events-none absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-violet-700/20 blur-[120px]" />

        <div className="relative mx-auto max-w-5xl px-6 py-24 text-center md:py-32">
          <span className="inline-flex rounded-full border border-violet-400/30 bg-violet-400/10 px-4 py-2 text-xs font-medium text-violet-300">
            SEU PRÓXIMO UNIVERSO COMEÇA AQUI
          </span>

          <h1 className="mt-7 text-4xl font-bold leading-tight tracking-tight md:text-6xl">
            Histórias que ganham
            <span className="block text-violet-400">
              vida com você.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-gray-400 md:text-lg">
            Descubra personagens únicos, explore novos mundos e crie
            conversas que continuam a cada mensagem.
          </p>

          <a
            href="#explorar"
            className="mt-9 inline-flex rounded-xl bg-violet-600 px-6 py-3 font-semibold transition hover:bg-violet-500"
          >
            Explorar personagens →
          </a>

          <div className="mx-auto mt-12 flex max-w-xl items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-left">
            <span className="pl-2 text-xl text-gray-500">⌕</span>
            <input
              type="search"
              placeholder="Pesquise personagens e universos..."
              className="w-full bg-transparent py-2 text-sm text-white outline-none placeholder:text-gray-500"
              aria-label="Pesquisar personagens"
            />
          </div>
        </div>
      </section>

      <section
        id="explorar"
        className="mx-auto max-w-7xl px-6 py-16"
      >
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-violet-400">
              DESCUBRA NOVAS HISTÓRIAS
            </p>
            <h2 className="mt-2 text-2xl font-bold md:text-3xl">
              Personagens em destaque
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              Conheça personagens criados pela comunidade.
            </p>
          </div>

          <Link
            href="/create-character"
            className="shrink-0 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold transition hover:bg-violet-500"
          >
            + Criar personagem
          </Link>
        </div>

        <div id="recentes">
          <Suspense
            fallback={
              <p className="py-10 text-center text-gray-400">
                Carregando personagens...
              </p>
            }
          >
            <CharacterList />
          </Suspense>
        </div>
      </section>

      <section
        id="sobre"
        className="mx-auto max-w-7xl px-6 pb-16"
      >
        <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-violet-950/60 to-[#15121f] p-8 md:p-12">
          <p className="text-sm font-medium text-violet-300">
            CRIE SEU PRÓPRIO PERSONAGEM
          </p>

          <h2 className="mt-3 text-2xl font-bold md:text-3xl">
            Sua imaginação define os limites.
          </h2>

          <p className="mt-3 max-w-2xl leading-7 text-gray-400">
            Crie personagens com personalidades, histórias, cenários
            e maneiras próprias de falar.
          </p>

          <Link
            href="/create-character"
            className="mt-6 inline-flex rounded-xl bg-violet-600 px-5 py-3 font-semibold transition hover:bg-violet-500"
          >
            Criar meu personagem →
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/10 px-6 py-8 text-center text-sm text-gray-500">
        Nebula © 2026 · Um universo de histórias interativas.
      </footer>
    </main>
  );
}
