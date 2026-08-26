#!/usr/bin/env node
/**
 * Executa uma medicao que PERSISTE evidencia em JSON, gravando no diretorio da
 * rodada do dia — `evidencias/AAAA-MM-DD/` —, como exige a regra 4 do protocolo
 * (docs/tcc/medicoes/README.md).
 *
 * Existe porque `measure:lint` gravava em `evidencias/latest/`: um diretorio que
 * nao existe no repositorio (a escrita falhava) e que, existindo, violaria a
 * convencao de rodada datada — duas execucoes em datas diferentes se sobreporiam
 * no mesmo arquivo, e a evidencia deixaria de identificar quando foi coletada.
 *
 * O diretorio de destino pode ser fixado por EVID_DIR, o que os scripts de
 * reproducao usam para nao escrever sobre evidencia ja versionada.
 *
 *   node docs/tcc/medicoes/scripts/medir.mjs lint
 *   node docs/tcc/medicoes/scripts/medir.mjs sca
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "..");
const HOJE = new Date().toISOString().slice(0, 10);
const DESTINO =
  process.env.EVID_DIR ?? join(RAIZ, "docs", "tcc", "medicoes", "evidencias", HOJE);

const MEDICOES = {
  // M-02 — violacoes de lint na configuracao do proprio projeto.
  // O ESLint sai com codigo != 0 quando ha erros; aqui isso e o RESULTADO da
  // medicao, nao uma falha de execucao.
  lint: {
    arquivo: "eslint-report.json",
    comando: (saida) => ["npx", ["eslint", ".", "-f", "json", "-o", saida]],
    tolerarFalha: true,
  },
  // M-25 — SCA sobre o lockfile. Exige rede: consulta o banco de advisories do
  // npm, que e servico vivo — a mesma arvore em datas diferentes pode render
  // contagens diferentes. Ver a nota sobre irreprodutibilidade no Apendice B.
  sca: {
    arquivo: "npm-audit.json",
    comando: () => ["npm", ["audit", "--json"]],
    capturar: true,
    tolerarFalha: true,
  },
};

const nome = process.argv[2];
const m = MEDICOES[nome];
if (!m) {
  console.error(`Uso: node docs/tcc/medicoes/scripts/medir.mjs <${Object.keys(MEDICOES).join("|")}>`);
  process.exit(1);
}

mkdirSync(DESTINO, { recursive: true });
const saida = join(DESTINO, m.arquivo);
const [cmd, args] = m.comando(saida);

// No Windows `npm`/`npx` sao shims `.cmd`, que o Node so aceita spawnar com
// `shell: true` (correcao do CVE-2024-27980); e com shell ligado, passar `args`
// como array dispara o aviso DEP0190. Monta-se, portanto, uma linha unica.
const citar = (a) => (/[\s"]/.test(a) ? `"${a.replaceAll('"', '\\"')}"` : a);
const linha = [cmd, ...args.map(citar)].join(" ");

const r = spawnSync(linha, {
  cwd: RAIZ,
  shell: true,
  encoding: "utf8",
  stdio: m.capturar ? ["inherit", "pipe", "inherit"] : "inherit",
});

if (m.capturar && r.stdout) writeFileSync(saida, r.stdout);

const codigo = r.status ?? 1;
console.log(`-> ${saida}`);
if (codigo !== 0 && !m.tolerarFalha) process.exit(codigo);
