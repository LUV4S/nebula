
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

const CONVERSATION_ID = "cmv5mf38s00004suzi2jh5mw8";

type MemorySegment = {
    id: string;
    text: string;
};

function splitMemory(memory: string): MemorySegment[] {
    const lines = memory
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);

    const segments: MemorySegment[] = [];

    for (const line of lines) {
        const text = line.replace(/^[-*]\s+/, "").trim();

        if (!text) continue;

        segments.push({
            id: `F${String(segments.length + 1).padStart(3, "0")}`,
            text,
        });
    }

    return segments;
}


type DuplicateGroup = {
    ids: string[];
    reason: string;
};

type ExactDuplicateGroup = {
    ids: string[];
    text: string;
};

function findExactDuplicates(
    segments: MemorySegment[]
): ExactDuplicateGroup[] {
    const groups = new Map<string, MemorySegment[]>();

    for (const segment of segments) {
        const normalized = segment.text
            .normalize("NFC")
            .trim()
            .replace(/\s+/g, " ")
            .toLocaleLowerCase("pt-BR");

        const existing = groups.get(normalized) ?? [];
        existing.push(segment);
        groups.set(normalized, existing);
    }

    const duplicates: ExactDuplicateGroup[] = [];

    for (const [, items] of groups) {
        if (items.length < 2) continue;

        duplicates.push({
            ids: items.map((item) => item.id),
            text: items[0].text,
        });
    }

    return duplicates;
}


async function main() {
    const { prisma } = await import("../lib/prisma");

    try {
        const conversation = await prisma.conversation.findUnique({
            where: { id: CONVERSATION_ID },
            select: { permanentMemory: true },
        });

        if (!conversation) {
            throw new Error("Conversa não encontrada.");
        }

        const original = conversation.permanentMemory;
        const segments = splitMemory(original);

        console.log("\n========== SEGMENTOS ==========\n");

        for (const segment of segments) {
            console.log(`${segment.id}: ${segment.text}\n`);
        }

        console.log("Total de segmentos:", segments.length);
        console.log("Tamanho original:", original.length);

        const reconstructed = segments
            .map((segment) => `- ${segment.text}`)
            .join("\n");

        const normalizedOriginal = original
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter(Boolean)
            .map((line) => {
                const text = line.replace(/^[-*]\s+/, "").trim();
                return `- ${text}`;
            })
            .join("\n");

        console.log(
            "Reconstrução equivalente:",
            reconstructed === normalizedOriginal
                ? "SIM"
                : "NÃO"
        );


        if (reconstructed !== normalizedOriginal) {
            throw new Error(
                "Reconstrução diferente do conteúdo original."
            );
        }

        const groups = findExactDuplicates(segments);


        console.log("\n========== DUPLICATAS EXATAS ==========\n");

        if (groups.length === 0) {
            console.log("Nenhuma duplicata exata encontrada.");
        }

        for (const group of groups) {
            console.log("Grupo:", group.ids.join(", "));
            console.log("Texto:", group.text);
            console.log("");
        }

        console.log("Total de grupos:", groups.length);
        console.log(
            "\n🔒 Nenhum segmento foi removido ou alterado."
        );



        console.log(
            "\n🔒 Teste concluído. Nenhuma memória foi modificada."
        );
    } finally {
        await prisma.$disconnect();
    }
}

main().catch((error) => {
    console.error("❌ Erro:", error);
    process.exitCode = 1;
});
