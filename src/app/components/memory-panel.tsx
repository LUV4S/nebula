
"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type MemoryData = {
    memory: string;
    permanentMemory: string;
    memoryUpdatedAt: string | null;
    characterName: string;
};

type MemoryPanelProps = {
    conversationId: string;
};

function formatMemoryAge(dateString: string) {
    const difference = Math.max(
        0,
        Date.now() - new Date(dateString).getTime()
    );

    const minutes = Math.floor(difference / 60000);

    if (minutes < 1) return "Agora mesmo";
    if (minutes < 60) return `Há ${minutes} min`;

    const hours = Math.floor(minutes / 60);

    if (hours < 24) return `Há ${hours} h`;

    const days = Math.floor(hours / 24);

    return `Há ${days} dia${days === 1 ? "" : "s"}`;
}

export default function MemoryPanel({
    conversationId,
}: MemoryPanelProps) {
    const [open, setOpen] = useState(false);
    const [memoryData, setMemoryData] = useState<MemoryData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!open) return;

        const controller = new AbortController();

        async function loadMemory() {
            setLoading(true);
            setError("");

            try {
                const response = await fetch(
                    `/api/conversations/${conversationId}/memory`,
                    {
                        cache: "no-store",
                        signal: controller.signal,
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.error || "Não foi possível carregar a memória."
                    );
                }

                if (!controller.signal.aborted) {
                    setMemoryData(data);
                }
            } catch (error) {
                if (!controller.signal.aborted) {
                    setError(
                        error instanceof Error
                            ? error.message
                            : "Ocorreu um erro ao carregar a memória."
                    );
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        }

        loadMemory();

        return () => controller.abort();
    }, [open, conversationId]);

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-sm font-medium text-violet-200 transition hover:bg-violet-500/20"
            >
                🧠 Memória
            </button>

            {open && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
                    onClick={() => setOpen(false)}
                >
                    <section
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="memory-title"
                        onClick={(event) => event.stopPropagation()}
                        className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-violet-500/30 bg-zinc-950 shadow-2xl"
                    >
                        <div className="flex items-center justify-between border-b border-white/10 p-5">
                            <div>
                                <h2
                                    id="memory-title"
                                    className="text-lg font-semibold text-white"
                                >
                                    🧠 Memória do personagem
                                </h2>

                                <p className="mt-1 text-sm text-zinc-400">
                                    {memoryData?.characterName ||
                                        "Carregando personagem..."}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                aria-label="Fechar memória"
                                className="rounded-lg px-3 py-2 text-zinc-400 transition hover:bg-white/10 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="overflow-y-auto p-5">
                            {loading ? (
                                <p className="text-sm text-zinc-400">
                                    Carregando memória...
                                </p>
                            ) : error ? (
                                <p className="text-sm text-red-400">
                                    {error}
                                </p>
                            ) : memoryData?.memory || memoryData?.permanentMemory ? (
                                <div className="space-y-6">
                                    <section className="space-y-3">
                                        <h3 className="flex items-center gap-2 text-base font-semibold text-violet-300">
                                            🧠 Memória permanente
                                        </h3>

                                        <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4">
                                            {memoryData.permanentMemory ? (
                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                    {memoryData.permanentMemory}
                                                </ReactMarkdown>
                                            ) : (
                                                <p className="text-sm text-zinc-500">
                                                    Ainda não há memórias permanentes registradas.
                                                </p>
                                            )}
                                        </div>
                                    </section>

                                    <section className="space-y-3">
                                        <h3 className="flex items-center gap-2 text-base font-semibold text-violet-300">
                                            📖 Memória narrativa
                                        </h3>

                                        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                                            {memoryData.memory ? (
                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                    {memoryData.memory}
                                                </ReactMarkdown>
                                            ) : (
                                                <p className="text-sm text-zinc-500">
                                                    Ainda não há acontecimentos registrados.
                                                </p>
                                            )}
                                        </div>
                                    </section>

                                    {memoryData.memoryUpdatedAt && (
                                        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-4 text-xs text-zinc-500">
                                            <span>
                                                Última atualização:{" "}
                                                {new Date(memoryData.memoryUpdatedAt).toLocaleString("pt-BR")}
                                            </span>

                                            <span className="rounded-full bg-violet-500/10 px-3 py-1 text-violet-300">
                                                {formatMemoryAge(memoryData.memoryUpdatedAt)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-sm leading-6 text-zinc-400">
                                    Este personagem ainda não possui memórias
                                    registradas. Continue conversando para que
                                    os acontecimentos importantes sejam lembrados.
                                </p>
                            )}
                        </div>

                        <div className="border-t border-white/10 p-4 text-right">
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                className="rounded-lg bg-violet-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-violet-500"
                            >
                                Fechar
                            </button>
                        </div>
                    </section>
                </div>
            )}
        </>
    );
}
