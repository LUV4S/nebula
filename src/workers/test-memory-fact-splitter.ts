
import { splitMemoryFacts } from "../lib/memory-fact-splitter";
import { validateMemoryFact } from "../lib/memory-fact-validation";

const originalMessages = `
Caio: Meu nome é Caio. Sou um explorador da cidade de Valedouro.
Lyra: Prazer, Caio. Sou Lyra, uma guardiã da biblioteca de Valedouro.
Caio: Encontrei uma chave prateada perto da torre antiga.
Lyra: Essa chave pode abrir uma das portas da biblioteca, mas ainda não sabemos qual.
Caio: Quero investigar a torre antes de tentar abrir qualquer porta.
Lyra: Lyra concordou em acompanhar Caio até a torre para investigar.
`;

const extracted = [
  "Identidade: Kael Riven, Lyra",
  "Relacionamento: Caio e Lyra",
  "Localização: Biblioteca de Valedouro",
].join("; ");

const facts = splitMemoryFacts(extracted);

console.log("\n========== FATOS SEPARADOS ==========\n");

let accepted = 0;
let rejected = 0;

for (const fact of facts) {
  const validation = validateMemoryFact(
    fact,
    originalMessages
  );

  console.log("Fato:", fact);
  console.log("Aceito:", validation.accepted);
  console.log(
    "Nomes desconhecidos:",
    validation.unknownNames
  );
  console.log("");

  if (validation.accepted) {
    accepted++;
  } else {
    rejected++;
  }
}

console.log("Total:", facts.length);
console.log("Aceitos:", accepted);
console.log("Rejeitados:", rejected);

if (
  facts.length !== 3 ||
  accepted !== 2 ||
  rejected !== 1
) {
  throw new Error("Resultado inesperado.");
}

console.log("\n✅ Separação e validação concluídas.");
