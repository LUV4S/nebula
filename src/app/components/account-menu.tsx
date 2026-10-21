
import { Suspense } from "react";
import Link from "next/link";
import { auth, signOut } from "@/auth";
import { connection } from "next/server";

async function AccountMenuContent() {
  await connection();

  const session = await auth();

  if (session?.user) {
    return (
      <div className="flex items-center gap-3">
        <span className="hidden text-sm text-gray-300 sm:inline">
          Olá, {session.user.name || session.user.email}
        </span>

        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <button
            type="submit"
            className="rounded-xl border border-white/10 px-4 py-2 text-sm text-gray-200 transition hover:bg-white/5"
          >
            Sair
          </button>
        </form>

        <Link
          href="/conversations"
          className="block rounded-lg px-3 py-2 text-sm text-gray-300 transition hover:bg-white/10 hover:text-white"
        >
          Minhas conversas
        </Link>

      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/login"
        className="rounded-xl px-4 py-2 text-sm text-gray-200 transition hover:bg-white/5"
      >
        Entrar
      </Link>

      <Link
        href="/register"
        className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold transition hover:bg-violet-500"
      >
        Criar conta
      </Link>
    </div>
  );
}

export default function AccountMenu() {
  return (
    <Suspense
      fallback={
        <div className="h-10 w-36 animate-pulse rounded-xl bg-white/5" />
      }
    >
      <AccountMenuContent />
    </Suspense>
  );
}
