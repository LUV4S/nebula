
import { loadEnvConfig } from "@next/env";
import { buildStructuredMemoryContext } from
    "../lib/structured-memory-context";

loadEnvConfig(process.cwd());

const CONVERSATION_ID = "cmv5mf38s00004suzi2jh5mw8";

async function main() {
    const { prisma } = await import("../lib/prisma");

    try {
        const facts = await prisma.memoryFact.findMany({
            where: {
                conversationId: CONVERSATION_ID,
            },
            orderBy: [
                { createdAt: "asc" },
                { id: "asc" },
            ],
            select: {
                id: true,
                content: true,
                category: true,
                certainty: true,
                isEssential: true,
            },
        });


        const essentialFactIds = facts
            .filter((fact) => fact.isEssential)
            .map((fact) => fact.id);

        const context = buildStructuredMemoryContext(facts, {
            maxChars: 800,
            query: "O que aconteceu com Otto e o cristal?",
            essentialFactIds,
            essentialRatio: 0.3,
        });

        console.log(
            "\n========== CONTEXTO ESTRUTURADO ==========\n"
        );

        console.log(context);

        console.log(
            "\n========== ESTATÍSTICAS ==========\n"
        );

        console.log("Fatos disponíveis:", facts.length);
        console.log(
            "Fatos incluídos:",
            context.split("\n").filter(Boolean).length
        );
        console.log(
            "Caracteres utilizados:",
            context.length
        );

        console.log(
            "\n🔒 Nenhuma memória foi modificada."
        );
    } finally {
        await prisma.$disconnect();
    }
}

main().catch((error) => {
    console.error("❌ Erro:", error);
    process.exitCode = 1;
});
