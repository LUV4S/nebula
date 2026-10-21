
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Conversation = {
    id: string;
    title: string | null;
    updatedAt: string;
    character: {
        name: string;
        category: string;
    };
    messages: {
        content: string;
        createdAt: string;
    }[];
};

function formatDate(date: string) {
    return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(date));
}

export default function ConversationsPage() {
    const router = useRouter();

    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    async function deleteConversation(id: string, characterName: string) {
            const confirmed = window.confirm(
                `Tem certeza de que deseja excluir a conversa com ${characterName}? Esta ação não pode ser desfeita.`
            );

            if (!confirmed) return;

            try {
                const response = await fetch(`/api/conversations/${id}`, {
                    method: "DELETE",
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error ?? "Não foi possível excluir a conversa.");
                }

                setConversations((previous) =>
                    previous.filter((conversation) => conversation.id !== id)
                );
            } catch (err) {
                window.alert(
                    err instanceof Error
                        ? err.message
                        : "Ocorreu um erro ao excluir a conversa."
                );
            }
        }

    useEffect(() => {
        let active = true;

        async function loadConversations() {
            try {
                const response = await fetch("/api/conversations");
                const data = await response.json();

                if (response.status === 401) {
                    router.push("/login");
                    return;
                }

                if (!response.ok) {
                    throw new Error(
                        data.error ?? "Não foi possível carregar as conversas."
                    );
                }

                if (active) {
                    setConversations(data.conversations ?? []);
                }
            } catch (err) {
                if (active) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : "Ocorreu um erro ao carregar o histórico."
                    );
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        loadConversations();

        return () => {
            active = false;
        };
    }, [router]);

    return (
        <main className="min-h-screen bg-[#09090f] text-white">
            <header className="border-b border-white/10 bg-[#0d0c16]">
                <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-5">
                    <Link
                        href="/"
                        className="text-2xl font-bold tracking-tight text-violet-400"
                    >
                        Nebula
                    </Link>

                    <Link
                        href="/"
                        className="rounded-xl border border-white/10 px-4 py-2 text-sm text-gray-300 transition hover:bg-white/5"
                    >
                        Explorar personagens
                    </Link>
                </div>
            </header>

            <section className="mx-auto max-w-5xl px-5 py-10">
                <div className="mb-8">
                    <p className="mb-2 text-sm font-medium uppercase tracking-widest text-violet-400">
                        Seu espaço
                    </p>

                    <h1 className="text-3xl font-bold sm:text-4xl">
                        Minhas conversas
                    </h1>

                    <p className="mt-3 text-gray-400">
                        Retome suas histórias de onde você parou.
                    </p>
                </div>

                {loading && (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center text-gray-400">
                        Carregando seu histórico...
                    </div>
                )}

                {!loading && error && (
                    <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
                        <p className="text-red-300">{error}</p>

                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 rounded-xl bg-white/10 px-4 py-2 text-sm hover:bg-white/15"
                        >
                            Tentar novamente
                        </button>
                    </div>
                )}

                {!loading && !error && conversations.length === 0 && (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-14 text-center">
                        <div className="mb-4 text-4xl">✦</div>

                        <h2 className="text-xl font-semibold">
                            Nenhuma conversa ainda
                        </h2>

                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-400">
                            Explore os personagens da Nebula e comece sua primeira conversa.
                            Seus chats aparecerão aqui.
                        </p>

                        <Link
                            href="/"
                            className="mt-6 inline-flex rounded-xl bg-violet-600 px-5 py-3 font-medium transition hover:bg-violet-500"
                        >
                            Explorar personagens
                        </Link>
                    </div>
                )}

                {!loading && !error && conversations.length > 0 && (
                    <div className="space-y-3">
                        <p className="mb-4 text-sm text-gray-500">
                            {conversations.length}{" "}
                            {conversations.length === 1
                                ? "conversa encontrada"
                                : "conversas encontradas"}
                        </p>


                        {conversations.map((conversation) => {
                            const lastMessage = conversation.messages?.[0];

                            return (
                                <div
                                    key={conversation.id}
                                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-violet-500/40 hover:bg-violet-500/[0.06] sm:gap-4 sm:p-5"
                                >
                                    <Link
                                        href={`/chat/${conversation.id}`}
                                        className="group flex min-w-0 flex-1 items-center gap-4"
                                    >
                                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10 text-xl font-bold text-violet-300">
                                            {conversation.character.name.charAt(0).toUpperCase()}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h2 className="font-semibold text-white transition group-hover:text-violet-300">
                                                    {conversation.character.name}
                                                </h2>

                                                <span className="rounded-full border border-white/10 px-2 py-0.5 text-xs text-gray-400">
                                                    {conversation.character.category}
                                                </span>
                                            </div>

                                            <p className="mt-1 truncate text-sm text-gray-400">
                                                {lastMessage?.content ?? "Conversa iniciada"}
                                            </p>

                                            <p className="mt-2 text-xs text-gray-500">
                                                {formatDate(conversation.updatedAt)}
                                            </p>
                                        </div>

                                        <span className="shrink-0 text-xl text-gray-500">
                                            →
                                        </span>
                                    </Link>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            deleteConversation(
                                                conversation.id,
                                                conversation.character.name
                                            )
                                        }
                                        aria-label={`Excluir conversa com ${conversation.character.name}`}
                                        title="Excluir conversa"
                                        className="shrink-0 rounded-xl border border-red-400/20 px-3 py-2 text-sm text-red-300 transition hover:border-red-400/50 hover:bg-red-500/10"
                                    >
                                        Excluir
                                    </button>
                                </div>
                            );
                        })}

                    </div>
                )}
            </section>
        </main>
    );
}
