
import { parseMemoryExtraction } from "../lib/memory-extraction-parser";
import { validateMemoryEvidence } from "../lib/memory-evidence-validation";
import { validateMemoryFact } from "../lib/memory-fact-validation";

const messages = [
  "Meu nome é Caio. Sou um explorador da cidade de Valedouro.",
  "Prazer, Caio. Sou Lyra, uma guardiã da biblioteca de Valedouro.",
  "Encontrei uma chave prateada perto da torre antiga.",
];

const response = JSON.stringify({
  facts: [
    {
      content: "Caio é um explorador de Valedouro.",
      evidence:
        "Meu nome é Caio. Sou um explorador da cidade de Valedouro.",
    },
    {
      content: "Kael Riven encontrou uma chave.",
      evidence:
        "Encontrei uma chave prateada perto da torre antiga.",
    },
    {
      content: "Lyra é guardiã da biblioteca de Valedouro.",
      evidence:
        "Prazer, Caio. Sou Lyra, uma guardiã da biblioteca de Valedouro.",
    },
  ],
  narrativeEvents:
    "Caio encontrou uma chave prateada.",
});

const result = parseMemoryExtraction(response);

let accepted = 0;
let rejected = 0;

console.log("\n========== VALIDAÇÃO ==========\n");

for (const fact of result.facts) {
  const evidenceCheck = validateMemoryEvidence(
    fact.evidence,
    messages
  );

  const nameCheck = validateMemoryFact(
    fact.content,
    messages.join("\n")
  );

  const valid =
    evidenceCheck.accepted &&
    nameCheck.accepted;

  console.log("Fato:", fact.content);
  console.log("Evidência válida:", evidenceCheck.accepted);
  console.log("Nomes válidos:", nameCheck.accepted);
  console.log("Resultado:", valid ? "ACEITO" : "REJEITADO");
  console.log("");

  if (valid) accepted++;
  else rejected++;
}

console.log("Aceitos:", accepted);
console.log("Rejeitados:", rejected);

if (accepted !== 2 || rejected !== 1) {
  throw new Error("Resultado inesperado.");
}

console.log("\n✅ Parser e validações funcionando.");
