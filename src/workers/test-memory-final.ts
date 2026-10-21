
import { buildStructuredMemoryContext } from "../lib/structured-memory-context";

const facts = [
  {
    id: "1",
    content: "Kael Riven encontrou um mapa antigo.",
    category: "general",
    certainty: "uncertain",
  },
  {
    id: "2",
    content: "Caio é um explorador de Valedouro.",
    category: "identity",
    certainty: "confirmed",
  },
  {
    id: "3",
    content: "Lyra é guardiã da biblioteca.",
    category: "identity",
    certainty: "confirmed",
  },
  {
    id: "4",
    content: "Kael Riven decidiu investigar a torre.",
    category: "general",
    certainty: "uncertain",
  },
];

const tests = [
  {
    name: "Fatos suspeitos não entram no contexto",
    run: () => {
      const context = buildStructuredMemoryContext(facts, {
        query: "Kael Riven encontrou o mapa?",
      });

      return !context.includes("Kael Riven");
    },
  },
  {
    name: "Fatos confirmados continuam disponíveis",
    run: () => {
      const context = buildStructuredMemoryContext(facts, {
        query: "Quem é Caio?",
      });

      return context.includes("Caio é um explorador");
    },
  },
  {
    name: "Fatos essenciais incertos são bloqueados",
    run: () => {
      const context = buildStructuredMemoryContext(facts, {
        query: "Quem é Kael Riven?",
        essentialFactIds: ["1"],
      });

      return !context.includes("Kael Riven");
    },
  },
  {
    name: "Limite de caracteres respeitado",
    run: () => {
      const context = buildStructuredMemoryContext(facts, {
        query: "Caio Lyra",
        maxChars: 40,
      });

      return context.length <= 40;
    },
  },
];

let passed = 0;

console.log("\n========== TESTE FINAL DA MEMÓRIA ==========\n");

for (const test of tests) {
  const success = test.run();

  if (success) passed++;

  console.log(
    `${success ? "✅" : "❌"} ${test.name}`
  );
}

console.log(
  `\nResultado: ${passed}/${tests.length}`
);

if (passed !== tests.length) {
  process.exitCode = 1;
}
