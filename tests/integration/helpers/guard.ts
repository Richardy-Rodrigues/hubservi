import { SUPABASE_URL } from "./env";

// Hosts aceitos como "stack local descartavel".
const LOCAIS = ["127.0.0.1", "localhost", "[::1]", "host.docker.internal"];

const OPT_IN = "PERMITIR_ALVO_REMOTO";

/**
 * Impede que a suite de integracao rode contra um Supabase que nao seja local.
 *
 * Por que existe: `resetDomainData()` faz DELETE incondicional em `reviews`,
 * `bookings` e `services` via service_role — ignorando RLS — no `beforeEach` da
 * maioria dos arquivos. Contra um projeto gerenciado, isso apaga os dados reais,
 * sem filtro e sem desfazer. O `setup.ts` ainda criaria quatro usuarios de teste
 * no Auth daquele projeto.
 *
 * `env.ts` sempre aceitou `SUPABASE_URL` por variavel de ambiente, para permitir
 * apontar a suite a um projeto de TESTE remoto (o fallback do risco R2 do plano).
 * O que faltava era distinguir esse uso legitimo de um acidente. Daí o opt-in
 * explicito: apontar para fora do localhost exige declarar, por variavel, que o
 * alvo e descartavel.
 */
export function exigirAlvoDescartavel(): void {
  const url = new URL(SUPABASE_URL);
  if (LOCAIS.includes(url.hostname)) return;

  if (process.env[OPT_IN] === "sim") {
    console.warn(
      `\n  AVISO: suite de integracao apontada para ${url.origin} (alvo remoto),\n` +
        `  liberada por ${OPT_IN}=sim. Os testes APAGARAO services, bookings e\n` +
        `  reviews desse projeto.\n`
    );
    return;
  }

  throw new Error(
    `\n\n  Suite de integracao bloqueada: SUPABASE_URL aponta para ${url.origin}.\n\n` +
      `  Estes testes apagam TODOS os services, bookings e reviews do alvo\n` +
      `  (resetDomainData, via service_role, no beforeEach) e criam usuarios de\n` +
      `  teste no Auth. Contra um projeto de producao, a perda e irreversivel.\n\n` +
      `  Para rodar contra o stack local (o esperado):\n` +
      `      npm run db:start && npm run db:reset && npm run test:integration\n\n` +
      `  Se o alvo for mesmo um projeto DESCARTAVEL, criado so para teste,\n` +
      `  declare isso explicitamente:\n` +
      `      ${OPT_IN}=sim npm run test:integration\n`
  );
}
