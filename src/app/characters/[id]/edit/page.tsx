
"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

type CharacterForm = {
  name: string;
  category: string;
  description: string;
  personality: string;
  scenario: string;
  greeting: string;
};

const emptyForm: CharacterForm = {
  name: "",
  category: "Fantasia",
  description: "",
  personality: "",
  scenario: "",
  greeting: "",
};

function EditCharacterForm() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [generatingImage, setGeneratingImage] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [imageError, setImageError] = useState("");
  const [savingImage, setSavingImage] = useState(false);
  const [savedImageUrl, setSavedImageUrl] = useState<string | null>(null);

  const [form, setForm] = useState<CharacterForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadCharacter() {
      try {
        const response = await fetch(
          `/api/characters/${encodeURIComponent(id)}`
        );

        if (response.status === 401) {
          router.push("/login");
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Não foi possível carregar o personagem."
          );
        }

        if (active) {
          setForm({
            name: data.character.name,
            category: data.character.category,
            description: data.character.description,
            personality: data.character.personality,
            scenario: data.character.scenario,
            greeting: data.character.greeting,
          });

          setSavedImageUrl(data.character.imageUrl ?? null);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Erro ao carregar personagem."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadCharacter();

    return () => {
      active = false;
    };
  }, [id, router]);

  function updateField(field: keyof CharacterForm, value: string) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSaving(true);

    try {
      const response = await fetch(
        `/api/characters/${encodeURIComponent(id)}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Não foi possível salvar as alterações."
        );
      }

      router.push(`/characters/${id}`);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erro ao atualizar personagem."
      );
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-white/10 bg-[#09090f] px-4 py-3 text-white outline-none transition placeholder:text-gray-600 focus:border-violet-500 focus:ring-1 focus:ring-violet-500";

  const labelClass = "mb-2 block text-sm font-medium text-gray-300";

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0b0b10] text-gray-400">
        Carregando personagem...
      </main>
    );
  }

  async function handleGenerateImage() {
    if (generatingImage) return;

    setGeneratingImage(true);
    setImageError("");

    try {
      const response = await fetch(
        `/api/characters/${encodeURIComponent(id)}/generate-image`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => null);

        throw new Error(
          data?.error || "Não foi possível gerar a imagem."
        );
      }

      const blob = await response.blob();

      if (!blob.type.startsWith("image/")) {
        throw new Error("O servidor não retornou uma imagem válida.");
      }

      const imageUrl = URL.createObjectURL(blob);

      setGeneratedImage((previous) => {
        if (previous) URL.revokeObjectURL(previous);
        return imageUrl;
      });
    } catch (error) {
      setImageError(
        error instanceof Error
          ? error.message
          : "Erro inesperado ao gerar imagem."
      );
    } finally {
      setGeneratingImage(false);
    }
  }

  async function handleSaveImage() {
    if (!generatedImage || savingImage) return;

    setSavingImage(true);
    setImageError("");

    try {
      const imageResponse = await fetch(generatedImage);

      if (!imageResponse.ok) {
        throw new Error("Não foi possível acessar a imagem gerada.");
      }

      const blob = await imageResponse.blob();

      const formData = new FormData();
      formData.append(
        "image",
        blob,
        "personagem.png"
      );

      const response = await fetch(
        `/api/characters/${encodeURIComponent(id)}/image`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Não foi possível salvar a imagem."
        );
      }

      setSavedImageUrl(data.imageUrl);
      setGeneratedImage(null);

      URL.revokeObjectURL(generatedImage);

      router.refresh();
    } catch (error) {
      setImageError(
        error instanceof Error
          ? error.message
          : "Erro inesperado ao salvar imagem."
      );
    } finally {
      setSavingImage(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0b0b10] px-4 py-10 text-white">
      <div className="mx-auto max-w-3xl">
        <header className="mb-10 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            <span className="text-violet-400">N</span>ebula
          </Link>

          <Link
            href={`/characters/${id}`}
            className="text-sm text-gray-400 transition hover:text-white"
          >
            ← Voltar ao personagem
          </Link>
        </header>

        <h1 className="mb-2 text-3xl font-bold">
          Editar personagem
        </h1>

        <p className="mb-8 text-gray-400">
          Atualize as informações e a personalidade do seu personagem.
        </p>

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {(
            [
              ["name", "Nome", 60],
              ["category", "Categoria", 40],
            ] as const
          ).map(([field, label, maxLength]) => (
            <div key={field}>
              <label htmlFor={field} className={labelClass}>
                {label}
              </label>
              <input
                id={field}
                value={form[field]}
                onChange={(event) =>
                  updateField(field, event.target.value)
                }
                maxLength={maxLength}
                minLength={2}
                required
                className={inputClass}
              />
            </div>
          ))}

          {(
            [
              ["description", "Descrição", 1000],
              ["personality", "Personalidade", 3000],
              ["scenario", "Cenário", 3000],
              ["greeting", "Mensagem inicial", 1000],
            ] as const
          ).map(([field, label, maxLength]) => (
            <div key={field}>
              <label htmlFor={field} className={labelClass}>
                {label}
              </label>

              <textarea
                id={field}
                value={form[field]}
                onChange={(event) =>
                  updateField(field, event.target.value)
                }
                rows={field === "personality" || field === "scenario" ? 6 : 4}
                minLength={field === "greeting" ? 2 : 10}
                maxLength={maxLength}
                required
                className={inputClass}
              />

              <p className="mt-1 text-right text-xs text-gray-500">
                {form[field].length}/{maxLength}
              </p>
            </div>
          ))}
            {/* Gerenciamento da imagem */}
            <div className="rounded-2xl border border-violet-500/20 bg-[#14141d] p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-white">
                  Imagem do personagem
                </h2>

                <p className="mt-2 text-sm text-gray-400">
                  Visualize a foto atual ou gere uma nova imagem com inteligência
                  artificial usando as informações salvas do personagem.
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                {/* Foto atual */}
                <div>
                  <h3 className="mb-3 text-sm font-medium text-gray-300">
                    Foto atual
                  </h3>

                  {savedImageUrl ? (
                    <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0b0b10]">
                      <img
                        src={savedImageUrl}
                        alt="Foto atual do personagem"
                        className="aspect-square w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex aspect-square items-center justify-center rounded-xl border border-dashed border-gray-700 bg-[#0b0b10]">
                      <span className="px-4 text-center text-sm text-gray-500">
                        Nenhuma foto salva
                      </span>
                    </div>
                  )}
                </div>

                {/* Prévia gerada */}
                <div>
                  <h3 className="mb-3 text-sm font-medium text-gray-300">
                    Nova imagem gerada
                  </h3>

                  {generatedImage ? (
                    <div className="overflow-hidden rounded-xl border border-violet-500/40 bg-[#0b0b10]">
                      <img
                        src={generatedImage}
                        alt="Prévia da nova imagem"
                        className="aspect-square w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex aspect-square items-center justify-center rounded-xl border border-dashed border-gray-700 bg-[#0b0b10]">
                      <span className="px-4 text-center text-sm text-gray-500">
                        Nenhuma nova imagem gerada
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {imageError && (
                <p
                  role="alert"
                  className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400"
                >
                  {imageError}
                </p>
              )}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleGenerateImage}
                  disabled={generatingImage || savingImage}
                  className="flex-1 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {generatingImage
                    ? "Gerando imagem... Aguarde"
                    : generatedImage
                      ? "Gerar outra imagem"
                      : "Gerar imagem com IA"}
                </button>

                {generatedImage && (
                  <button
                    type="button"
                    onClick={handleSaveImage}
                    disabled={savingImage || generatingImage}
                    className="flex-1 rounded-xl border border-violet-500 bg-violet-500/10 px-5 py-3 text-sm font-semibold text-violet-200 transition hover:bg-violet-500/20 disabled:opacity-50"
                  >
                    {savingImage
                      ? "Salvando imagem..."
                      : "Usar como foto do personagem"}
                  </button>
                )}
              </div>

              <p className="mt-4 text-center text-xs text-gray-500">
                A geração é realizada localmente pelo ComfyUI.
                A foto atual só será substituída quando você salvar a nova imagem.
              </p>
            </div>

            {/* Botões do formulário */}
            <div className="flex flex-wrap items-center justify-end gap-3 border-t border-white/10 pt-6">
              <Link
                href={`/characters/${id}`}
                className="rounded-xl border border-white/10 px-6 py-3 text-sm text-gray-300 transition hover:bg-white/5"
              >
                Cancelar
              </Link>

              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Salvando..." : "Salvar alterações"}
              </button>
            </div>

        </form>
      </div>
    </main>
  );
}

export default function EditCharacterPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#0b0b10] text-gray-400">
          Carregando editor de personagem...
        </main>
      }
    >
      <EditCharacterForm />
    </Suspense>
  );
}