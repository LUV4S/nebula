
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

type MemoryFact = {
    category: "identity" | "relationship" | "knowledge" | "event";
    subject: string;
    fact: string;
    certainty: "confirmed" | "uncertain";
    evidence: string;
};

type ExtractionResult = {
    facts: MemoryFact[];
};


function normalizeCategory(category: string): string {
    const normalized = category.trim().toLowerCase();

    const categoryMap: Record<string, string> = {
        identity: "identity",
        identidade: "identity",
        personagem: "identity",
        caracteristica: "identity",
        característica: "identity",

        relationship: "relationship",
        relacionamento: "relationship",
        relacao: "relationship",
        relação: "relationship",

        knowledge: "knowledge",
        conhecimento: "knowledge",
        objetivo: "knowledge",
        informação: "knowledge",
        informacao: "knowledge",

        event: "event",
        evento: "event",
        acontecimento: "event",
    };

    return categoryMap[normalized] || normalized;
}

const CONVERSATION_ID = "cmv5mf38s00004suzi2jh5mw8";

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

        if (!original.trim()) {
            throw new Error("Memória permanente vazia.");
        }

        const ollamaUrl =
            process.env.OLLAMA_URL || "http://localhost:11434";

        const model =
            process.env.OLLAMA_MODEL || "llama3.2:3b";

        const prompt = `
Extraia fatos individuais da memória abaixo.

MEMÓRIA ORIGINAL:
${original}

REGRAS:
- Preserve todos os fatos relevantes.
- Não resuma vários acontecimentos diferentes em um só.
- Agrupe apenas repetições equivalentes.
- Não invente informações.
- Preserve nomes e relações.
- Não confunda o usuário com a personagem.
- Não transforme rumores ou frases ambíguas
  em informações confirmadas.
- Se uma frase estiver truncada, não complete
  seu significado sem evidência.
- Em "evidence", copie um trecho exato da
  memória original que sustente o fato.
- Cada fato deve possuir apenas uma categoria.
- O campo "category" deve utilizar exclusivamente
  um destes valores em inglês:
  "identity", "relationship", "knowledge", "event".
- Nunca traduza os valores das categorias.
- O texto dos fatos pode continuar em português.
- Use "uncertain" quando o significado ou
  a atribuição do fato não estiver claro.
- Responda apenas em JSON válido.

FORMATO:
{
  "facts": [
    {
      "category": "identity",
      "subject": "Elara Voss",
      "fact": "Elara Voss é uma viajante de Aetheria.",
      "certainty": "confirmed",
      "evidence": "Elara Voss é uma viajante de Aetheria"
    }
  ]
}
`.trim();

        console.log("🧠 Extraindo fatos da memória...");
        console.log("Tamanho original:", original.length);

        const start = Date.now();

        const response = await fetch(`${ollamaUrl}/api/chat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model,
                stream: false,
                format: "json",
                messages: [
                    {
                        role: "system",
                        content:
                            "Extraia fatos com fidelidade ao texto original. Responda somente JSON válido.",
                    },
                    {
                        role: "user",
                        content: prompt,
                    },
                ],
                options: {
                    temperature: 0,
                    num_ctx: 8192,
                    num_predict: 3000,
                },
            }),
            signal: AbortSignal.timeout(120000),
        });

        if (!response.ok) {
            throw new Error(
                `Erro do Ollama: ${response.status}`
            );
        }

        const data = await response.json();

        console.log(
            "Tempo:",
            ((Date.now() - start) / 1000).toFixed(1),
            "segundos"
        );

        console.log("Conclusão:", data.done_reason);

        if (data.done_reason !== "stop") {
            throw new Error(
                "A extração não foi concluída pelo Ollama."
            );
        }

        const content = data.message?.content;

        if (typeof content !== "string") {
            throw new Error("Resposta vazia ou inválida.");
        }

        const parsed: unknown = JSON.parse(content);

        if (
            typeof parsed !== "object" ||
            parsed === null ||
            !("facts" in parsed) ||
            !Array.isArray(parsed.facts)
        ) {
            throw new Error("Estrutura JSON inválida.");
        }


        const categories = [
            "identity",
            "relationship",
            "knowledge",
            "event",
        ];

        const certainties = ["confirmed", "uncertain"];

        const facts: MemoryFact[] = [];

        for (const item of parsed.facts) {
            if (
                typeof item !== "object" ||
                item === null ||
                Array.isArray(item)
            ) {
                console.error("❌ Fato inválido:", item);
                throw new Error("O fato não é um objeto válido.");
            }

            const category =
                typeof item.category === "string"
                    ? normalizeCategory(item.category)
                    : "";

            const subject = item.subject;
            const fact = item.fact;
            const certainty = item.certainty;
            const evidence = item.evidence;

            if (!categories.includes(category)) {
                console.error("Categoria inválida:", category);
                throw new Error("Categoria não reconhecida.");
            }

            if (!certainties.includes(certainty)) {
                console.error("Certeza inválida:", certainty);
                throw new Error("Nível de certeza não reconhecido.");
            }

            if (
                typeof subject !== "string" ||
                typeof fact !== "string" ||
                typeof evidence !== "string"
            ) {
                console.error(
                    "Campos inválidos:",
                    JSON.stringify(item, null, 2)
                );

                throw new Error(
                    "O fato possui campos com tipos incorretos."
                );
            }

            facts.push({
                category: category as MemoryFact["category"],
                subject,
                fact,
                certainty: certainty as MemoryFact["certainty"],
                evidence,
            });
        }


        console.log("\n========== FATOS EXTRAÍDOS ==========\n");

        facts.forEach((fact, index) => {
            const evidenceFound = original.includes(fact.evidence);

            console.log(`${index + 1}. [${fact.category}]`);
            console.log(`Sujeito: ${fact.subject}`);
            console.log(`Fato: ${fact.fact}`);
            console.log(`Certeza: ${fact.certainty}`);
            console.log(`Evidência: ${fact.evidence}`);
            console.log(
                `Trecho localizado: ${evidenceFound ? "SIM" : "NÃO"}`
            );
            console.log("");
        });

        const missingEvidence = facts.filter(
            (fact) =>
                !fact.evidence.trim() ||
                !original.includes(fact.evidence)
        );

        console.log("Total de fatos:", facts.length);
        console.log(
            "Fatos sem evidência textual exata:",
            missingEvidence.length
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
