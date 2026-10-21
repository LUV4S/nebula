
"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (password !== confirmPassword) {
      setMessage("As senhas não coincidem.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error ?? "Não foi possível criar sua conta.");
        return;
      }

      setMessage("Conta criada com sucesso! Você já pode entrar.");
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch {
      setMessage("Não foi possível conectar ao servidor. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#09090f] px-4 py-12 text-white">
      <section className="w-full max-w-md rounded-2xl border border-white/10 bg-[#11111b] p-8 shadow-2xl shadow-violet-950/20">
        <Link
          href="/"
          className="text-sm text-violet-400 transition hover:text-violet-300"
        >
          ← Voltar para a Nebula
        </Link>

        <div className="mb-8 mt-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight">
            <span className="text-violet-400">Nebula</span>
          </h1>

          <h2 className="mt-5 text-2xl font-semibold">
            Crie sua conta
          </h2>

          <p className="mt-2 text-sm text-gray-400">
            Entre em um universo de personagens e histórias.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="mb-2 block text-sm text-gray-300">
              Nome
            </label>

            <input
              id="name"
              type="text"
              autoComplete="name"
              required
              minLength={2}
              maxLength={80}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Seu nome"
              className="w-full rounded-xl border border-white/10 bg-[#09090f] px-4 py-3 outline-none transition placeholder:text-gray-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-2 block text-sm text-gray-300">
              E-mail
            </label>

            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="voce@exemplo.com"
              className="w-full rounded-xl border border-white/10 bg-[#09090f] px-4 py-3 outline-none transition placeholder:text-gray-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm text-gray-300">
              Senha
            </label>

            <input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              maxLength={72}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Pelo menos 8 caracteres"
              className="w-full rounded-xl border border-white/10 bg-[#09090f] px-4 py-3 outline-none transition placeholder:text-gray-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="mb-2 block text-sm text-gray-300">
              Confirme sua senha
            </label>

            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              maxLength={72}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Digite a senha novamente"
              className="w-full rounded-xl border border-white/10 bg-[#09090f] px-4 py-3 outline-none transition placeholder:text-gray-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
            />
          </div>

          {message && (
            <p
              role="status"
              aria-live="polite"
              className="rounded-lg border border-violet-400/20 bg-violet-500/10 p-3 text-sm text-violet-200"
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-violet-600 px-4 py-3 font-semibold transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Criando conta..." : "Criar minha conta"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          Já tem uma conta?{" "}
          <Link
            href="/login"
            className="font-medium text-violet-400 transition hover:text-violet-300"
          >
            Fazer login
          </Link>
        </p>
      </section>
    </main>
  );
}
