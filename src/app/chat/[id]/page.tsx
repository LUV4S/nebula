
"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import MemoryPanel from "@/app/components/memory-panel";
import RoleplayText from "@/app/components/roleplay-text";

type Message = {
  id: string;
  role: "USER" | "ASSISTANT";
  content: string;
  createdAt: string;
};

type ApiMessage = Omit<Message, "createdAt"> & {
  createdAt: string | Date;
};

type Character = {
  id: string;
  name: string;
  category: string;
  imageUrl: string | null;
};

type ApiResponse = {
  error?: string;
  messages?: ApiMessage[];
};

type ConversationResponse = {
  error?: string;
  conversation?: {
    id: string;
    character: Character;
  };
};

function formatTime(date: string) {
  return new Date(date).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function CharacterAvatar({
  character,
  size = "md",
}: {
  character: Character | null;
  size?: "sm" | "md";
}) {
  const sizeClass =
    size === "sm" ? "h-9 w-9 text-sm" : "h-12 w-12 text-lg";

  const initials =
    character?.name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "N";

  return (
    <div
      className={`${sizeClass} shrink-0 overflow-hidden rounded-xl border border-violet-400/20 bg-gradient-to-br from-violet-600 to-indigo-900`}
    >
      {character?.imageUrl ? (
        <img
          src={character.imageUrl}
          alt={character.name}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center font-bold text-white">
          {initials}
        </div>
      )}
    </div>
  );
}

function ChatContent() {
  const params = useParams<{ id: string }>();
  const conversationId = params.id;

  const [messages, setMessages] = useState<Message[]>([]);
  const [character, setCharacter] = useState<Character | null>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [streamingText, setStreamingText] = useState("");

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const loadChat = useCallback(async () => {
    try {
      setError("");

      const [conversationResponse, messagesResponse] =
        await Promise.all([
          fetch(`/api/conversations/${conversationId}`),
          fetch(`/api/conversations/${conversationId}/messages`),
        ]);

      const conversationData =
        (await conversationResponse.json()) as ConversationResponse;

      const messagesData =
        (await messagesResponse.json()) as ApiResponse;

      if (!conversationResponse.ok) {
        throw new Error(
          conversationData.error ??
          "Não foi possível carregar a conversa."
        );
      }

      if (!messagesResponse.ok) {
        throw new Error(
          messagesData.error ??
          "Não foi possível carregar as mensagens."
        );
      }

      setCharacter(conversationData.conversation?.character ?? null);

      setMessages(
        (messagesData.messages ?? []).map((message) => ({
          ...message,
          createdAt: new Date(message.createdAt).toISOString(),
        }))
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ocorreu um erro inesperado."
      );
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    void loadChat();
  }, [loadChat]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: sending ? "instant" : "smooth",
      block: "end",
    });
  }, [messages, loading, sending, streamingText]);


  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const content = text.trim();

    if (!content || sending || loading) return;

    setSending(true);
    setError("");
    setStreamingText("");
    setText("");

    const temporaryId = `temp-${crypto.randomUUID()}`;

    const temporaryMessage: Message = {
      id: temporaryId,
      role: "USER",
      content,
      createdAt: new Date().toISOString(),
    };

    setMessages((previous) => [...previous, temporaryMessage]);

    let userMessageSaved = false;
    let responseCompleted = false;

    try {
      const response = await fetch(
        `/api/conversations/${conversationId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content }),
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => null);

        if (data?.message) {
          userMessageSaved = true;

          const savedMessage: Message = {
            ...data.message,
            createdAt: new Date(
              data.message.createdAt
            ).toISOString(),
          };

          setMessages((previous) => [
            ...previous.filter((message) => message.id !== temporaryId),
            savedMessage,
          ]);
        }

        throw new Error(
          data?.error || "Não foi possível enviar a mensagem."
        );
      }

      if (!response.body) {
        throw new Error("O servidor não retornou um fluxo de resposta.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let buffer = "";

      async function processEvent(line: string) {
        if (!line.trim()) return;

        const data = JSON.parse(line) as {
          type: "user_message" | "delta" | "done" | "error";
          content?: string;
          error?: string;
          message?: ApiMessage;
          assistantMessage?: ApiMessage;
        };

        if (data.type === "user_message" && data.message) {
          userMessageSaved = true;

          const savedMessage: Message = {
            ...data.message,
            createdAt: new Date(
              data.message.createdAt
            ).toISOString(),
          };

          setMessages((previous) => {
            const withoutTemporary = previous.filter(
              (message) => message.id !== temporaryId
            );

            if (
              withoutTemporary.some(
                (message) => message.id === savedMessage.id
              )
            ) {
              return withoutTemporary;
            }

            return [...withoutTemporary, savedMessage];
          });
        }

        if (data.type === "delta" && data.content) {
          setStreamingText((previous) => previous + data.content);
        }

        if (data.type === "done" && data.assistantMessage) {
          responseCompleted = true;

          const savedAssistantMessage: Message = {
            ...data.assistantMessage,
            createdAt: new Date(
              data.assistantMessage.createdAt
            ).toISOString(),
          };

          setMessages((previous) => {
            if (
              previous.some(
                (message) => message.id === savedAssistantMessage.id
              )
            ) {
              return previous;
            }

            return [...previous, savedAssistantMessage];
          });

          setStreamingText("");
        }

        if (data.type === "error") {
          throw new Error(
            data.error || "A geração da resposta foi interrompida."
          );
        }
      }

      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            await processEvent(line);
          }
        }

        buffer += decoder.decode();

        if (buffer.trim()) {
          await processEvent(buffer);
        }
      } finally {
        reader.releaseLock();
      }

      if (!responseCompleted) {
        throw new Error(
          "A conexão terminou antes da resposta ser salva."
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Falha ao receber a resposta."
      );

      // Remove a mensagem provisória caso não tenha
      // sido possível confirmar seu salvamento.
      if (!userMessageSaved) {
        setMessages((previous) =>
          previous.filter((message) => message.id !== temporaryId)
        );

        setText(content);
      }

      // Se a mensagem já foi salva, não a recolocamos
      // no campo de texto para evitar reenvio duplicado.
      setStreamingText("");
    } finally {
      setSending(false);
      textareaRef.current?.focus();
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  }

  return (
    <main className="flex h-dvh flex-col overflow-hidden bg-[#0b0b10] text-white">
      {/* Cabeçalho */}
      <header className="z-10 shrink-0 border-b border-white/10 bg-[#12121a]">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:gap-4 sm:px-6">
          <Link
            href="/"
            aria-label="Voltar para a página inicial"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 text-lg text-gray-300 transition hover:bg-white/10 hover:text-white"
          >
            ←
          </Link>

          <CharacterAvatar character={character} />

          <div className="min-w-0 flex-1">
            {character ? (
              <Link
                href={`/characters/${character.id}`}
                className="block truncate font-semibold transition hover:text-violet-300"
              >
                {character.name}
              </Link>
            ) : (
              <h1 className="truncate font-semibold">
                Conversa
              </h1>
            )}

            <p className="mt-0.5 truncate text-xs text-gray-400">
              {character?.category ?? "Nebula"}
            </p>
          </div>

          <div className="shrink-0">
            <MemoryPanel conversationId={conversationId} />
          </div>
        </div>
      </header>

      {/* Histórico */}
      <section
        aria-label="Histórico de mensagens"
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-6 sm:px-6"
      >
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-3">
          {loading ? (
            <div className="py-16 text-center text-sm text-gray-400">
              Carregando conversa...
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <CharacterAvatar character={character} size="md" />

              <h2 className="mt-5 text-xl font-semibold">
                Sua história começa aqui
              </h2>

              <p className="mt-2 max-w-sm text-sm leading-6 text-gray-400">
                Converse com {character?.name ?? "o personagem"} e
                descubra aonde essa história pode levar.
              </p>
            </div>
          ) : (
            messages.map((message) => {
              const isUser = message.role === "USER";
              const isTemporary = message.id.startsWith("temp-");

              return (
                <div
                  key={message.id}
                  className={`flex items-end gap-2.5 ${isUser ? "justify-end" : "justify-start"
                    }`}
                >
                  {!isUser && (
                    <CharacterAvatar
                      character={character}
                      size="sm"
                    />
                  )}

                  <div
                    className={`min-w-0 max-w-[85%] rounded-2xl px-3 py-2.5 shadow-sm sm:max-w-[75%] ${isUser
                      ? "rounded-br-md bg-violet-700 text-white"
                      : "rounded-bl-md border border-white/10 bg-[#1b1a26] text-gray-100"
                      } ${isTemporary ? "opacity-75" : ""}`}
                  >
                    <p
                      className={`mb-1 text-xs font-semibold ${isUser
                        ? "text-violet-100"
                        : "text-violet-300"
                        }`}
                    >
                      {isUser
                        ? "Você"
                        : character?.name ?? "Personagem"}
                    </p>

                    {isUser ? (
                      <p className="whitespace-pre-wrap break-words text-sm leading-6">
                        {message.content}
                      </p>
                    ) : (
                      <RoleplayText content={message.content} />
                    )}

                    <div className="mt-2 flex justify-end gap-2 text-[10px] opacity-60">
                      {isTemporary && <span>Enviando...</span>}
                      <time dateTime={message.createdAt}>
                        {formatTime(message.createdAt)}
                      </time>
                    </div>
                  </div>
                </div>
              );
            })
          )}


          {/* Resposta sendo gerada em tempo real */}
          {sending && (
            <div
              className="flex items-end gap-2.5"
              role="status"
              aria-live="off"
            >
              <CharacterAvatar character={character} size="sm" />

              <div className="min-w-0 max-w-[85%] rounded-2xl rounded-bl-md border border-violet-500/20 bg-[#1b1a26] px-4 py-3 sm:max-w-[75%]">
                <p className="mb-2 text-xs font-semibold text-violet-300">
                  {character?.name ?? "Personagem"}
                </p>

                {streamingText ? (
                  <div className="text-gray-100">
                    <RoleplayText content={streamingText} />
                    <span className="ml-1 inline-block h-4 w-1.5 animate-pulse bg-violet-400 align-middle" />
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 py-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-violet-400" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-violet-400 [animation-delay:150ms]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-violet-400 [animation-delay:300ms]" />
                  </div>
                )}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </section>

      {/* Erros */}
      {error && (
        <div
          role="alert"
          className="mx-auto w-full max-w-3xl px-4 pb-3 text-sm text-red-400"
        >
          {error}
        </div>
      )}

      {/* Campo de mensagem */}
      <footer className="z-10 shrink-0 border-t border-white/10 bg-[#12121a] px-3 py-3 sm:px-6 sm:py-4">
        <form
          onSubmit={handleSubmit}
          className="mx-auto flex max-w-3xl items-end gap-3"
        >
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              sending
                ? "Aguardando resposta..."
                : "Escreva sua mensagem..."
            }
            aria-label="Sua mensagem"
            rows={2}
            maxLength={10000}
            disabled={loading || sending}
            className="max-h-40 min-h-14 min-w-0 flex-1 resize-none rounded-2xl border border-white/10 bg-[#1c1b27] px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-gray-500 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 disabled:opacity-60"
          />

          <button
            type="submit"
            disabled={loading || sending || !text.trim()}
            className="flex h-14 shrink-0 items-center justify-center gap-2 rounded-2xl bg-violet-600 px-5 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {sending ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <svg
                width="19"
                height="19"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="m22 2-7 20-4-9-9-4Z" />
                <path d="M22 2 11 13" />
              </svg>
            )}

            <span className="hidden sm:inline">
              {sending ? "Aguarde" : "Enviar"}
            </span>
          </button>
        </form>

        <p className="mx-auto mt-2 max-w-3xl text-center text-[11px] text-gray-500">
          Enter para enviar · Shift + Enter para nova linha
        </p>
      </footer>
    </main>
  );
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <main className="flex h-dvh items-center justify-center bg-[#0b0b10] text-gray-400">
          Carregando chat...
        </main>
      }
    >
      <ChatContent />
    </Suspense>
  );
}
