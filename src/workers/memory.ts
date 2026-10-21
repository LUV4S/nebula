
import "dotenv/config";
import { processPendingMemories } from "../lib/memory-worker";

const CHECK_INTERVAL = 30 * 1000;

let running = false;

async function checkMemories() {
  if (running) return;

  running = true;

  try {
    await processPendingMemories();
  } catch (error) {
    console.error("Erro no processador de memória:", error);
  } finally {
    running = false;
  }
}

console.log("🧠 Processador de memória da Nebula iniciado.");

void checkMemories();

setInterval(() => {
  void checkMemories();
}, CHECK_INTERVAL);
