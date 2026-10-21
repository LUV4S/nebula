
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type StartChatButtonProps = {
  characterId: string;
};

export default function StartChatButton({
  characterId,
}: StartChatButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleStartChat() {
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ characterId }),
      });

      const data = await response.json();

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok || !data.conversation?.id) {
        throw new Error(
          data.error ?? "Não foi possível iniciar a conversa."
        );
      }

      router.push(`/chat/${data.conversation.id}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ocorreu um erro ao iniciar o chat."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={handleStartChat}
        disabled={loading}
        className="w-full rounded-xl bg-violet-600 px-6 py-3 font-semibold text-white transition hover:bg-violet-500 disabled:cursor-wait disabled:opacity-60"
      >
        {loading ? "Abrindo conversa..." : "Conversar"}
      </button>

      {error && (
        <p role="alert" className="mt-3 text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
