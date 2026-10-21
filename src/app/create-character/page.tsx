
"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CreateCharacterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("Fantasia");
  const [description, setDescription] = useState("");
  const [personality, setPersonality] = useState("");
  const [scenario, setScenario] = useState("");
  const [greeting, setGreeting] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/characters", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          category,
          description,
          personality,
          scenario,
          greeting,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login");
          return;
        }

        setError(data.error || "Não foi possível criar o personagem.");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Não foi possível conectar ao servidor. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-white/10 bg-[#09090f] px-4 py-3 text-white outline-none transition placeholder:text-gray-600 focus:border-violet-500 focus:ring-1 focus:ring-violet-500";

  const labelClass = "mb-2 block text-sm font-medium text-gray-300";

  return (
    <main className="min-h-screen bg-[#0b0b10] px-4 py-10 text-white">
      <div className="mx-auto max-w-3xl">
        <header className="mb-10 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            <span className="text-violet-400">N</span>ebula
          </Link>

          <Link
            href="/"
            className="text-sm text-gray-400 transition hover:text-white"
          >
            ← Voltar ao início
          </Link>
        </header>

        <div className="mb-8">
          <p className="text-sm font-medium text-violet-400">
            DÊ VIDA À SUA IMAGINAÇÃO
          </p>

          <h1 className="mt-2 text-3xl font-bold md:text-4xl">
            Criar personagem
          </h1>

          <p className="mt-3 leading-7 text-gray-400">
            Crie uma personalidade, imagine um universo e defina como seu
            personagem começará uma conversa.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-7 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-8"
        >
          <div>
            <label htmlFor="name" className={labelClass}>
              Nome do personagem
            </label>

            <input
              id="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className={inputClass}
              placeholder="Ex.: Luna, a exploradora"
              minLength={2}
              maxLength={60}
              required
            />
          </div>

          <div>
            <label htmlFor="category" className={labelClass}>
              Categoria
            </label>

            <select
              id="category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className={inputClass}
              required
            >
              <option>Fantasia</option>
              <option>Ficção científica</option>
              <option>Aventura</option>
              <option>Romance</option>
              <option>Mistério</option>
              <option>Terror</option>
              <option>Drama</option>
              <option>Outro</option>
            </select>
          </div>

          <div>
            <label htmlFor="description" className={labelClass}>
              Descrição
            </label>

            <textarea
              id="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className={inputClass}
              placeholder="Apresente seu personagem em poucas frases..."
              rows={3}
              minLength={10}
              maxLength={1000}
              required
            />

            <p className="mt-1 text-right text-xs text-gray-500">
              {description.length}/1000
            </p>
          </div>

          <div>
            <label htmlFor="personality" className={labelClass}>
              Personalidade
            </label>

            <textarea
              id="personality"
              value={personality}
              onChange={(event) => setPersonality(event.target.value)}
              className={inputClass}
              placeholder="Como ele age? Como fala? Quais são seus objetivos, medos e características?"
              rows={5}
              minLength={10}
              maxLength={3000}
              required
            />

            <p className="mt-1 text-right text-xs text-gray-500">
              {personality.length}/3000
            </p>
          </div>

          <div>
            <label htmlFor="scenario" className={labelClass}>
              Cenário e contexto
            </label>

            <textarea
              id="scenario"
              value={scenario}
              onChange={(event) => setScenario(event.target.value)}
              className={inputClass}
              placeholder="Em que mundo a história acontece? Qual é a situação inicial?"
              rows={4}
              minLength={10}
              maxLength={3000}
              required
            />

            <p className="mt-1 text-right text-xs text-gray-500">
              {scenario.length}/3000
            </p>
          </div>

          <div>
            <label htmlFor="greeting" className={labelClass}>
              Primeira mensagem
            </label>

            <textarea
              id="greeting"
              value={greeting}
              onChange={(event) => setGreeting(event.target.value)}
              className={inputClass}
              placeholder="Ex.: Você acaba de entrar na estação espacial. Luna se aproxima e pergunta: 'Você recebeu meu sinal?'"
              rows={4}
              minLength={2}
              maxLength={1000}
              required
            />

            <p className="mt-1 text-right text-xs text-gray-500">
              {greeting.length}/1000
            </p>
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400"
            >
              {error}
            </p>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              href="/"
              className="rounded-xl border border-white/10 px-6 py-3 text-center text-sm font-medium text-gray-300 transition hover:bg-white/5"
            >
              Cancelar
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Salvando..." : "Criar personagem"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
