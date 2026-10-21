
import { validateMemoryFact } from "../lib/memory-fact-validation";

const originalMessages = `
Caio: Meu nome é Caio. Sou um explorador da cidade de Valedouro.
Lyra: Prazer, Caio. Sou Lyra, uma guardiã da biblioteca de Valedouro.
Caio: Encontrei uma chave prateada perto da torre antiga.
Lyra: Essa chave pode abrir uma das portas da biblioteca, mas ainda não sabemos qual.
Caio: Quero investigar a torre antes de tentar abrir qualquer porta.
Lyra: Lyra concordou em acompanhar Caio até a torre para investigar.
`;

const tests = [
  {
    description: "Nome inventado",
    fact: "Identidade: Kael Riven, Lyra",
    expected: false,
  },
  {
    description: "Identidade conhecida",
    fact: "Caio é um explorador de Valedouro.",
    expected: true,
  },
  {
    description: "Personagem conhecido",
    fact: "Lyra é guardiã da biblioteca de Valedouro.",
    expected: true,
  },
];

let failures = 0;

for (const test of tests) {
  const result = validateMemoryFact(
    test.fact,
    originalMessages
  );

  const passed = result.accepted === test.expected;

  if (!passed) failures++;

  console.log(`\n${passed ? "✅" : "❌"} ${test.description}`);
  console.log("Fato:", test.fact);
  console.log("Aceito:", result.accepted);
  console.log("Nomes desconhecidos:", result.unknownNames);
}

if (failures > 0) {
  process.exitCode = 1;
}

console.log(
  `\nResultado: ${tests.length - failures}/${tests.length} testes passaram.`
);
