
import { loadEnvConfig } from "@next/env";
import { getMemoryFactHash } from "../lib/memory-fact-utils";

loadEnvConfig(process.cwd());

const CONVERSATION_ID = "cmv5mf38s00004suzi2jh5mw8";

type Segment = {
    id: string;
    text: string;
};

function splitMemory(memory: string): Segment[] {
    return memory
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line, index) => ({
            id: `F${String(index + 1).padStart(3, "0")}`,
            text: line.replace(/^[-*]\s+/, "").trim(),
        }));
}

function normalizeText(text: string): string {
    return text
        .normalize("NFC")
        .trim()
        .replace(/\s+/g, " ")
        .toLocaleLowerCase("pt-BR");
}

async function main() {
    const { prisma } = await import("../lib/prisma");

    try {
        const conversation = await prisma.conversation.findUnique({
            where: { id: CONVERSATION_ID },
            select: {
                id: true,
                permanentMemory: true,
            },
        });

        if (!conversation) {
            throw new Error("Conversa não encontrada.");
        }

        const original = conversation.permanentMemory;

        if (!original.trim()) {
            throw new Error("Memória permanente vazia.");
        }

        const segments = splitMemory(original);

        console.log("🧠 Importando memória permanente...");
        console.log("Segmentos encontrados:", segments.length);

        const existingFacts = await prisma.memoryFact.findMany({
            where: {
                conversationId: CONVERSATION_ID,
            },
            select: {
                originalText: true,
            },
        });

        const knownTexts = new Set(
            existingFacts.map((fact) =>
                normalizeText(fact.originalText)
            )
        );

        const pending: Segment[] = [];
        let skipped = 0;

        for (const segment of segments) {
            const normalized = normalizeText(segment.text);

            if (knownTexts.has(normalized)) {
                skipped++;
                continue;
            }

            knownTexts.add(normalized);
            pending.push(segment);
        }

        console.log("Novos segmentos:", pending.length);
        console.log("Segmentos já existentes:", skipped);

        if (pending.length === 0) {
            console.log("ℹ️ Nenhum novo segmento para importar.");
            return;
        }


        const result = await prisma.memoryFact.createMany({
            data: pending.map((segment) => ({
                conversationId: CONVERSATION_ID,
                category: "general",
                subject: "",
                content: segment.text,
                originalText: segment.text,
                contentHash: getMemoryFactHash(segment.text),
                certainty: "uncertain",
                source: "legacy-import",
            })),
            skipDuplicates: true,
        });


        console.log(
            `\n✅ ${result.count} segmentos importados.`
        );

        const total = await prisma.memoryFact.count({
            where: {
                conversationId: CONVERSATION_ID,
            },
        });

        console.log(
            "Total de registros na memória estruturada:",
            total
        );

        console.log(
            "\n🔒 Memória permanente original preservada."
        );
    } finally {
        await prisma.$disconnect();
    }
}

main().catch((error) => {
    console.error("❌ Erro na importação:", error);
    process.exitCode = 1;
});
