
import { validateMemoryEvidence } from "../lib/memory-evidence-validation";

const messages = [
  "Meu nome é Caio. Sou um explorador da cidade de Valedouro.",
  "Prazer, Caio. Sou Lyra, uma guardiã da biblioteca de Valedouro.",
  "Encontrei uma chave prateada perto da torre antiga.",
  "Essa chave pode abrir uma das portas da biblioteca, mas ainda não sabemos qual.",
  "Quero investigar a torre antes de tentar abrir qualquer porta.",
  "Lyra concordou em acompanhar Caio até a torre para investigar.",
];

const tests = [
  {
    description: "Evidência verdadeira",
    evidence:
      "Meu nome é Caio. Sou um explorador da cidade de Valedouro.",
    expected: true,
  },
  {
    description: "Trecho verdadeiro",
    evidence:
      "Encontrei uma chave prateada perto da torre antiga.",
    expected: true,
  },
  {
    description: "Evidência inventada",
    evidence:
      "Meu nome é Kael Riven e sou um guerreiro.",
    expected: false,
  },
  {
    description: "Evidência curta demais",
    evidence: "Caio",
    expected: false,
  },
];

let passed = 0;

for (const test of tests) {
  const result = validateMemoryEvidence(
    test.evidence,
    messages
  );

  const success = result.accepted === test.expected;

  if (success) passed++;

  console.log(
    `\n${success ? "✅" : "❌"} ${test.description}`
  );

  console.log("Aceito:", result.accepted);
  console.log("Motivo:", result.reason);
}

console.log(
  `\nResultado: ${passed}/${tests.length} testes passaram.`
);

if (passed !== tests.length) {
  process.exitCode = 1;
}
