import { beforeAll } from "vitest";
import { exigirAlvoDescartavel } from "./helpers/guard";
import { createTestUsers } from "./helpers/users";

// setupFiles roda no MESMO grafo de modulos de cada arquivo de teste — por isso o
// mapa `userIds` preenchido aqui e visivel nos testes (ao contrario de globalSetup,
// que roda em contexto isolado). createTestUsers e idempotente: se os usuarios ja
// existem, apenas recupera seus ids. Assume o stack local de pe e migrado.
beforeAll(async () => {
  // Antes de qualquer escrita: estes testes apagam dados de dominio do alvo.
  exigirAlvoDescartavel();
  await createTestUsers();
});
