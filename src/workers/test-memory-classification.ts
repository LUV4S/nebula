
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

const CONVERSATION_ID = "cmv5mf38s00004suzi2jh5mw8";

type Classification = {
    id: string;
    category: string;
    subject: string;
    certainty: string;
    reason: string;
};

const VALID_CATEGORIES = [
    "identity",
    "relationship",
    "event",
    "knowledge",
    "general",
];

const VALID_CERTAINTIES = [
    "confirmed",
    "uncertain",
];

async function classifyFacts(
    facts: { id: string; content: string }[],
    ollamaUrl: string,
    model: string
): Promise<Classification[]> {
    const input = facts.map((fact) => ({
        id: fact.id,
        text: fact.content,
    }));


    const prompt = `
Você classifica registros de memória de um RPG.

Sua tarefa NÃO é resumir, corrigir ou interpretar
a história. Classifique apenas o texto fornecido.

CATEGORIAS:

identity:
Características relativamente estáveis de um
personagem: origem, aparência, espécie, personalidade.

relationship:
Vínculos explicitamente descritos entre personagens.
Não use esta categoria apenas porque duas pessoas
participam do mesmo acontecimento.

event:
Ações, decisões, propostas, descobertas,
acontecimentos e objetivos assumidos.
É a categoria padrão para frases com verbos de ação.

knowledge:
Informações estabelecidas sobre o funcionamento
do mundo, objetos, lugares ou regras.
Uma teoria proposta por um personagem NÃO é
automaticamente conhecimento estabelecido.

general:
Fragmentos incompletos ou textos que não se
encaixam claramente nas categorias anteriores.

CERTEZA:

confirmed:
O texto afirma claramente que uma ação ocorreu
ou que uma característica existe.

uncertain:
O texto é incompleto, ambíguo ou apresenta uma
hipótese como possibilidade.

IMPORTANTE:
Se Elara propôs uma teoria, a PROPOSTA é confirmada,
mesmo que a teoria ainda não tenha sido comprovada.

SUJEITO:
- Use nomes próprios mencionados no texto.
- Para ações conjuntas, use os participantes.
- Não transforme ações em nomes abstratos.
- Não atribua "você" automaticamente a Elara.
- Se o sujeito não estiver claro, use "indefinido".

REGRAS:
- Não invente informações.
- Não complete frases truncadas.
- Não confunda Otto com o usuário.
- Não infira romance, parentesco ou amizade.
- Não transforme menções a vampiros em
  confirmação de que alguém é vampiro.
- Não afirme que uma teoria é verdadeira
  apenas porque alguém a propôs.
- Use somente os IDs recebidos.
- Responda em JSON válido.
- Use exatamente as categorias:
  identity, relationship, event, knowledge, general.
- Use exatamente:
  confirmed ou uncertain.

REGRAS ADICIONAIS:

1. Uma ação em andamento também é um evento.
   Exemplos: procurando, investigando, tentando
   entender, buscando, seguindo, esperando.

2. Se um personagem está explicitamente nomeado,
   não classifique o sujeito como "indefinido".

3. A incerteza sobre o resultado de uma ação
   não torna a própria ação incerta.

4. Se Elara está procurando respostas, a busca
   é um evento confirmado, mesmo que ela ainda
   não tenha encontrado as respostas.

5. Use "general" somente quando nenhuma outra
   categoria for apropriada.

EXEMPLOS:

Texto: "Elara contou sua história para Otto."
Classificação:
{
  "category": "event",
  "subject": "Elara",
  "certainty": "confirmed"
}

Texto: "Elara propôs investigar uma fenda."
Classificação:
{
  "category": "event",
  "subject": "Elara",
  "certainty": "confirmed"
}

Texto: "Elara é uma viajante de Aetheria."
Classificação:
{
  "category": "identity",
  "subject": "Elara",
  "certainty": "confirmed"
}

Texto: "Elara está determinada a encontrar o centro d"
Classificação:
{
  "category": "general",
  "subject": "Elara",
  "certainty": "uncertain"
}

Texto: "Elara está tentando entender o que
aconteceu com Aetheria e está procurando ajuda."

Classificação:
{
  "category": "event",
  "subject": "Elara",
  "certainty": "confirmed"
}

Retorne SOMENTE este formato JSON:

{
  "classifications": [
    {
      "id": "ID_ORIGINAL",
      "category": "event",
      "subject": "Elara",
      "certainty": "confirmed",
      "reason": "Descreve uma ação explícita."
    }
  ]
}

REGISTROS:
${JSON.stringify(input, null, 2)}
`;


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
                    role: "user",
                    content: prompt,
                },
            ],
            options: {
                temperature: 0,
                num_ctx: 4096,
                num_predict: 350,
            },
        }),
        signal: AbortSignal.timeout(120000),
    });

    if (!response.ok) {
        throw new Error(
            `Erro Ollama: ${response.status}`
        );
    }

    const data = await response.json();

    if (data.done_reason !== "stop") {
        throw new Error(
            `Resposta incompleta: ${data.done_reason}`
        );
    }

    const parsed = JSON.parse(data.message.content);

    if (!Array.isArray(parsed.classifications)) {
        throw new Error("JSON sem classifications.");
    }

    const validIds = new Set(facts.map((f) => f.id));
    const seenIds = new Set<string>();

    const classifications: Classification[] = [];

    for (const item of parsed.classifications) {
        if (
            typeof item.id !== "string" ||
            !validIds.has(item.id) ||
            seenIds.has(item.id) ||
            !VALID_CATEGORIES.includes(item.category) ||
            !VALID_CERTAINTIES.includes(item.certainty) ||
            typeof item.subject !== "string" ||
            typeof item.reason !== "string"
        ) {
            throw new Error(
                `Classificação inválida: ${JSON.stringify(item)}`
            );
        }

        seenIds.add(item.id);
        classifications.push(item);
    }

    if (seenIds.size !== facts.length) {
        throw new Error(
            `Esperados ${facts.length} fatos, recebidos ${seenIds.size}.`
        );
    }

    return classifications;
}


function reviewClassification(
    originalText: string,
    result: Classification
): string[] {
    const warnings: string[] = [];

    const text = originalText.toLocaleLowerCase("pt-BR");

    if (
        result.category === "identity" &&
        /livro|mensagem|procurando|propôs|contou|decidiu/i.test(text)
    ) {
        warnings.push(
            "Possível ação ou objeto classificado como identidade."
        );
    }

    if (
        result.category === "relationship" &&
        /decidiram|seguiram|investigaram|encontraram/i.test(text)
    ) {
        warnings.push(
            "Possível acontecimento classificado como relacionamento."
        );
    }

    if (
        /vampir/i.test(text) &&
        result.category === "identity"
    ) {
        warnings.push(
            "Referência a vampiros exige revisão contextual."
        );
    }

    if (/^(ela|eles|você)$/i.test(result.subject.trim())) {
        warnings.push(
            "Sujeito é um pronome e pode exigir contexto."
        );
    }

    if (
        result.certainty === "confirmed" &&
        /centro d\s*$/i.test(text)
    ) {
        warnings.push(
            "Fragmento truncado não deve ser considerado confirmado."
        );
    }

    return warnings;
}


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
            },
        });

        const ollamaUrl =
            process.env.OLLAMA_URL || "http://localhost:11434";

        const model =
            process.env.OLLAMA_MODEL || "llama3.2:3b";

        const batchSize = 1;
        let processed = 0;
        let failed = 0;

        console.log(
            `\n🧠 Classificando ${facts.length} fatos...\n`
        );

        for (let i = 0; i < facts.length; i += batchSize) {
            const batch = facts.slice(i, i + batchSize);

            console.log(
                `========== LOTE ${Math.floor(i / batchSize) + 1} ==========`
            );

            try {
                const classifications = await classifyFacts(
                    batch,
                    ollamaUrl,
                    model
                );

                for (const result of classifications) {
                    const original = batch.find(
                        (fact) => fact.id === result.id
                    );

                    console.log("\nTexto:", original?.content);
                    console.log("Categoria:", result.category);
                    console.log("Sujeito:", result.subject);
                    console.log("Certeza:", result.certainty);
                    console.log("Motivo:", result.reason);


                    if (original) {
                        const warnings = reviewClassification(
                            original.content,
                            result
                        );

                        for (const warning of warnings) {
                            console.log("⚠️ REVISÃO:", warning);
                        }
                    }

                    processed++;
                }
            } catch (error) {
                failed += batch.length;

                console.error(
                    "\n❌ Falha no lote:",
                    error
                );
            }

            console.log("");
        }

        console.log(
            "\n========== RESUMO ==========\n"
        );

        console.log("Total de fatos:", facts.length);
        console.log("Classificados:", processed);
        console.log("Não classificados:", failed);

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
