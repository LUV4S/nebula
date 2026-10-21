console.log("TESTE: arquivo executado");

import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());


type ValidationResult = {
    approved: boolean;
    missingFacts: string[];
    contradictions: string[];
};

async function validateCompaction(
    originalMemory: string,
    compactedMemory: string,
    ollamaUrl: string,
    model: string
): Promise<ValidationResult> {
    const prompt = `
Você é um auditor de memórias de histórias fictícias.

Compare a memória original com a versão compactada.

MEMÓRIA ORIGINAL:
${originalMemory}

MEMÓRIA COMPACTADA:
${compactedMemory}

TAREFA:
Identifique informações importantes da memória original
que foram perdidas ou contraditas na versão compactada.

REGRAS:
- Considere fatos equivalentes mesmo com palavras diferentes.
- Não exija que frases sejam copiadas literalmente.
- Identifique nomes, relacionamentos, identidades,
  acontecimentos fundamentais e objetivos importantes.
- Não trate detalhes puramente descritivos como perdas graves.
- Não invente informações.
- Não considere uma informação preservada se seu significado mudou.
- Trate informações incertas como incertas.
- Seja breve e objetivo.
- Responda somente em JSON válido.

FORMATO:
{
  "approved": true,
  "missingFacts": [],
  "contradictions": []
}

Defina approved como false se houver qualquer
fato importante ausente ou contradição.
`.trim();

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
                        "Você audita a preservação de fatos em resumos. Retorne apenas JSON válido.",
                },
                {
                    role: "user",
                    content: prompt,
                },
            ],
            options: {
                temperature: 0,
                num_ctx: 8192,
                num_predict: 1000,
            },
        }),
        signal: AbortSignal.timeout(120000),
    });

    if (!response.ok) {
        throw new Error(
            `Erro na validação: ${response.status}`
        );
    }

    const data = await response.json();

    if (data.done_reason !== "stop") {
        throw new Error(
            "O Ollama não concluiu a validação."
        );
    }

    const content = data.message?.content;

    if (typeof content !== "string" || !content.trim()) {
        throw new Error(
            "O Ollama retornou uma validação vazia."
        );
    }

    const parsed: unknown = JSON.parse(content);

    if (
        typeof parsed !== "object" ||
        parsed === null ||
        !("approved" in parsed) ||
        !("missingFacts" in parsed) ||
        !("contradictions" in parsed) ||
        typeof parsed.approved !== "boolean" ||
        !Array.isArray(parsed.missingFacts) ||
        !Array.isArray(parsed.contradictions) ||
        !parsed.missingFacts.every(
            (item) => typeof item === "string"
        ) ||
        !parsed.contradictions.every(
            (item) => typeof item === "string"
        )
    ) {
        throw new Error(
            "O Ollama retornou uma validação inválida."
        );
    }

    return {
        approved:
            parsed.approved &&
            parsed.missingFacts.length === 0 &&
            parsed.contradictions.length === 0,
        missingFacts: parsed.missingFacts,
        contradictions: parsed.contradictions,
    };
}


async function repairCompaction(
    originalMemory: string,
    compactedMemory: string,
    missingFacts: string[],
    contradictions: string[],
    ollamaUrl: string,
    model: string
): Promise<string> {
    const prompt = `
Você está corrigindo uma memória permanente
compactada de uma história fictícia.

MEMÓRIA ORIGINAL (FONTE DE VERDADE):
${originalMemory}

MEMÓRIA COMPACTADA:
${compactedMemory}

POSSÍVEIS FATOS AUSENTES:
${JSON.stringify(missingFacts)}

POSSÍVEIS CONTRADIÇÕES:
${JSON.stringify(contradictions)}

TAREFA:
Produza uma versão corrigida e organizada
da memória permanente.

REGRAS:
- A memória original é a referência principal.
- As observações do validador podem conter erros.
- Confira cada observação na memória original.
- Não acrescente fatos que não estejam sustentados
  pela memória original.
- Não transforme rumores, suspeitas ou hipóteses
  em fatos confirmados.
- Preserve identidades, relacionamentos,
  características e objetivos importantes.
- Preserve acontecimentos fundamentais.
- Remova apenas repetições e redundâncias.
- Corrija problemas de escrita.
- Utilize português brasileiro.
- Prefira uma memória concisa, mas priorize
  a preservação dos fatos.
- Limite máximo de 3000 caracteres.
- Retorne somente JSON válido.

FORMATO:
{
  "memory": "Memória permanente corrigida"
}
`.trim();

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
                        "Você corrige memórias sem inventar fatos. Responda somente com JSON válido.",
                },
                {
                    role: "user",
                    content: prompt,
                },
            ],
            options: {
                temperature: 0.1,
                num_ctx: 8192,
                num_predict: 1600,
            },
        }),
        signal: AbortSignal.timeout(120000),
    });

    if (!response.ok) {
        throw new Error(
            `Erro na correção: ${response.status}`
        );
    }

    const data = await response.json();

    if (data.done_reason !== "stop") {
        throw new Error(
            "O Ollama não concluiu a correção."
        );
    }

    const content = data.message?.content;

    if (typeof content !== "string" || !content.trim()) {
        throw new Error("Resposta de correção vazia.");
    }

    const parsed: unknown = JSON.parse(content);

    if (
        typeof parsed !== "object" ||
        parsed === null ||
        !("memory" in parsed) ||
        typeof parsed.memory !== "string"
    ) {
        throw new Error("JSON de correção inválido.");
    }

    const repaired = parsed.memory.trim();

    if (!repaired || repaired.length > 3000) {
        throw new Error(
            "Memória corrigida vazia ou acima do limite."
        );
    }

    return repaired;
}


async function main() {
    const { prisma } = await import("../lib/prisma");

    try {
        // Todo o processamento existente do teste.

        const CONVERSATION_ID =
            "cmv5mf38s00004suzi2jh5mw8";

        const OLLAMA_URL =
            process.env.OLLAMA_URL || "http://localhost:11434";

        const OLLAMA_MODEL =
            process.env.OLLAMA_MODEL || "llama3.2:3b";

        const conversation = await prisma.conversation.findUnique({
            where: {
                id: CONVERSATION_ID,
            },
            select: {
                permanentMemory: true,
                memory: true,
            },
        });

        if (!conversation) {
            throw new Error("Conversa não encontrada.");
        }

        console.log("🧠 Testando compactação da memória...");
        console.log(
            "Memória permanente original:",
            conversation.permanentMemory.length,
            "caracteres"
        );

        const prompt = `
Você é responsável por organizar a memória permanente
de uma história fictícia.

MEMÓRIA PERMANENTE ATUAL:
${conversation.permanentMemory}

MEMÓRIA NARRATIVA PARA CONTEXTO:
${conversation.memory.slice(-1000)}

TAREFA:
Reorganize somente a memória permanente.

REGRAS:
- Preserve nomes, identidades e relacionamentos.
- Preserve fatos fundamentais da história.
- Remova informações repetidas.
- Una frases que descrevam o mesmo acontecimento.
- Corrija frases incompletas somente quando o contexto
  permitir identificar seu significado.
- Não invente informações.
- Não transforme suspeitas em fatos confirmados.
- Preserve incertezas e contradições quando não puder resolvê-las.
- Não inclua acontecimentos temporários sem importância permanente.
- Utilize português brasileiro.
- Produza no máximo 1800 caracteres.
- Retorne apenas JSON válido.

FORMATO:
{
  "memory": "Memória permanente reorganizada"
}
`.trim();

        const start = Date.now();

        const response = await fetch(
            `${OLLAMA_URL}/api/chat`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: OLLAMA_MODEL,
                    stream: false,
                    format: "json",
                    messages: [
                        {
                            role: "system",
                            content:
                                "Você reorganiza memórias de histórias sem inventar informações. Responda apenas com JSON válido.",
                        },
                        {
                            role: "user",
                            content: prompt,
                        },
                    ],
                    options: {
                        temperature: 0.1,
                        num_ctx: 8192,
                        num_predict: 1400,
                    },
                }),
                signal: AbortSignal.timeout(120000),
            }
        );

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

        console.log(
            "Motivo de conclusão:",
            data.done_reason
        );

        if (data.done_reason !== "stop") {
            throw new Error(
                "O Ollama não concluiu a compactação."
            );
        }

        const content = data.message?.content;

        if (typeof content !== "string") {
            throw new Error("Resposta inválida do Ollama.");
        }

        const parsed: unknown = JSON.parse(content);

        if (
            typeof parsed !== "object" ||
            parsed === null ||
            !("memory" in parsed) ||
            typeof parsed.memory !== "string"
        ) {
            throw new Error("JSON de compactação inválido.");
        }

        const compacted = parsed.memory.trim();

        if (!compacted || compacted.length > 3000) {
            throw new Error(
                "Memória compactada vazia ou acima do limite."
            );
        }

        console.log("\n========== RESULTADO ==========\n");

        console.log(compacted);

        console.log("\n===============================\n");

        console.log(
            "Tamanho original:",
            conversation.permanentMemory.length
        );

        console.log(
            "Tamanho compactado:",
            compacted.length
        );

        console.log(
            "Redução:",
            (
                (1 -
                    compacted.length /
                    conversation.permanentMemory.length) *
                100
            ).toFixed(1) + "%"
        );


        console.log("\n🔍 Validando compactação...");

        const validationStart = Date.now();

        const validation = await validateCompaction(
            conversation.permanentMemory,
            compacted,
            OLLAMA_URL,
            OLLAMA_MODEL
        );

        console.log(
            "Tempo da validação:",
            ((Date.now() - validationStart) / 1000).toFixed(1),
            "segundos"
        );

        console.log("\n========== VALIDAÇÃO ==========\n");

        console.log(
            "Resultado:",
            validation.approved ? "APROVADA" : "REPROVADA"
        );

        console.log("\nFatos importantes ausentes:");

        if (validation.missingFacts.length === 0) {
            console.log("Nenhum identificado.");
        } else {
            validation.missingFacts.forEach((fact, index) => {
                console.log(`${index + 1}. ${fact}`);
            });
        }

        console.log("\nContradições identificadas:");

        if (validation.contradictions.length === 0) {
            console.log("Nenhuma identificada.");
        } else {
            validation.contradictions.forEach(
                (contradiction, index) => {
                    console.log(`${index + 1}. ${contradiction}`);
                }
            );
        }

        console.log("\n===============================\n");


        if (validation.approved) {
            console.log(
                "✅ Compactação candidata aprovada pelo validador."
            );
        } else {
            console.log(
                "⚠️ Compactação reprovada. Tentando corrigir..."
            );

            const repairStart = Date.now();

            const repaired = await repairCompaction(
                conversation.permanentMemory,
                compacted,
                validation.missingFacts,
                validation.contradictions,
                OLLAMA_URL,
                OLLAMA_MODEL
            );

            console.log(
                "\n========== MEMÓRIA CORRIGIDA ==========\n"
            );

            console.log(repaired);

            console.log(
                "\nTamanho da memória corrigida:",
                repaired.length,
                "caracteres"
            );

            console.log(
                "Tempo da correção:",
                ((Date.now() - repairStart) / 1000).toFixed(1),
                "segundos"
            );

            console.log(
                "\n🔍 Validando novamente a memória corrigida..."
            );

            const secondValidation = await validateCompaction(
                conversation.permanentMemory,
                repaired,
                OLLAMA_URL,
                OLLAMA_MODEL
            );

            console.log(
                "\n========== SEGUNDA VALIDAÇÃO ==========\n"
            );

            console.log(
                "Resultado:",
                secondValidation.approved
                    ? "APROVADA"
                    : "REPROVADA"
            );

            console.log(
                "Fatos ausentes:",
                secondValidation.missingFacts
            );

            console.log(
                "Contradições:",
                secondValidation.contradictions
            );

            if (secondValidation.approved) {
                console.log(
                    "\n✅ Memória corrigida aprovada como candidata."
                );
            } else {
                console.log(
                    "\n⚠️ Memória corrigida ainda apresenta problemas."
                );
            }
        }

        console.log(
            "\n🔒 Teste concluído. Nenhuma memória foi modificada."
        );
    } finally {
        await prisma.$disconnect();
    }
}

main().catch((error) => {
    console.error("❌ Erro no teste:", error);
    process.exitCode = 1;
});
