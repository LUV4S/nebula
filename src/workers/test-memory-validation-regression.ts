
import { validateMemoryFact } from "../lib/memory-fact-validation";

const originalMessages = `
Lyra, encontrei um mapa antigo dentro de uma caixa de madeira.
O mapa mostra três torres ao redor da cidade de Valedouro.
A torre do norte está marcada com um símbolo de lua.
Lyra explicou que o símbolo pode indicar uma passagem secreta, mas isso ainda é uma hipótese.
Decidi guardar o mapa e investigar a torre do norte amanhã.
Lyra concordou em acompanhar Caio na investigação da torre do norte.
`;

const tests = [
    {
        fact:
            "Kael Riven mencionou que o mapa mostra três torres ao redor da cidade de Valedouro.",
        expected: false,
    },
    {
        fact:
            "Kael Riven e Lyra decidiram investigar a torre do norte amanhã.",
        expected: false,
    },
    {
        fact:
            "A torre do norte está marcada com um símbolo de lua.",
        expected: true,
    },
    {
        fact:
            "O símbolo de lua na torre do norte pode indicar uma passagem secreta.",
        expected: true,
    },
    {
        fact: "Kael Riven encontrou um mapa antigo.",
        expected: false,
    },
];

let passed = 0;

console.log("\n========== TESTE DE REGRESSÃO ==========\n");

for (const test of tests) {
    const result = validateMemoryFact(
        test.fact,
        originalMessages
    );

    const success = result.accepted === test.expected;

    if (success) passed++;

    console.log(success ? "✅" : "❌", test.fact);
    console.log("Aceito:", result.accepted);
    console.log("Esperado:", test.expected);
    console.log("Nomes desconhecidos:", result.unknownNames);
    console.log("");
}

console.log(
    `Resultado: ${passed}/${tests.length}`
);

if (passed !== tests.length) {
    process.exitCode = 1;
}
