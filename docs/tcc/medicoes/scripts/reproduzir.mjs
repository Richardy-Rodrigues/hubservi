#!/usr/bin/env node
/**
 * Reproduz as medicoes do artigo, em trilhas, para demonstracao ao vivo.
 *
 * O PONTO CENTRAL. Reprodutibilidade aqui significa "mesmo commit + mesmo
 * ambiente", nao "mesmo comando hoje". A branch esta varios commits a frente do
 * commit em que as medicoes foram coletadas, com funcionalidades acrescentadas
 * depois; rodar as ferramentas na arvore atual produz numeros legitimos, porem
 * DIFERENTES dos que a Secao 7 do artigo reporta.
 *
 * Por isso cada trilha executa dentro de um `git worktree` fixado no commit da
 * medicao. Os numeros saem identicos aos do artigo — e a arvore de trabalho do
 * apresentador nao e tocada.
 *
 * Duas invariantes que o script nao viola:
 *   1. Nunca altera a arvore de trabalho — tudo acontece em worktree temporario.
 *   2. Nunca sobrescreve evidencia versionada — saidas vao para um diretorio
 *      de rodada novo, datado.
 *
 * Uso:
 *   node docs/tcc/medicoes/scripts/reproduzir.mjs --lista
 *   node docs/tcc/medicoes/scripts/reproduzir.mjs offline
 *   node docs/tcc/medicoes/scripts/reproduzir.mjs furos-antes
 *   node docs/tcc/medicoes/scripts/reproduzir.mjs offline --aqui   (sem worktree)
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "..");

// Commits em que cada conjunto de medicoes foi coletado.
//
// Por que 25ecace, e nao um dos commits "docs(tcc)" da campanha. As medicoes de
// 2026-07-16 correram sobre uma arvore que ja continha `ReviewForm.tsx` e
// `ProfileForm.tsx` — arquivos entao NAO COMMITADOS, que so entraram no historico
// em 25ecace. Os commits anteriores (aa5df76..bb0bf13) contem os TESTES desses
// componentes sem os componentes: ali a suite nem sequer resolve os imports.
//
// 25ecace e, portanto, o primeiro commit cuja arvore de `src/` corresponde a que
// foi medida — verificado: jscpd reproduz 3,03% total e 4,55% em TSX, valores
// identicos aos de evidencias/2026-07-16/jscpd/jscpd-report.json.
const COMMIT_MEDICOES = "25ecace";
const COMMIT_FUROS = "5e324f5"; // commit que fecha F-02/F-03
const COMMIT_BASELINE = "b2897c2"; // Semana 1, com os schemas Zod ja extraidos

// CLI do Supabase fixada na versao registrada em evidencias/2026-07-16/ambiente.txt.
// Via `npx`, para nao exigir instalacao global e para nao entrar no grafo de
// dependencias que M-25 (`npm audit`) mede.
const SUPABASE = ["--yes", "supabase@2.109.1"];

// As duas migrations cuja AUSENCIA reexpoe os furos F-02 e F-03.
const MIGRATIONS_CORRECAO = [
  "supabase/migrations/20260716130000_fix_profiles_pii_exposure.sql",
  "supabase/migrations/20260716130100_validate_review_provider.sql",
];

const cores = {
  t: (s) => `\x1b[96m${s}\x1b[0m`,
  ok: (s) => `\x1b[92m${s}\x1b[0m`,
  erro: (s) => `\x1b[91m${s}\x1b[0m`,
  dim: (s) => `\x1b[90m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
};

// ---------------------------------------------------------------------------
// Definicao das trilhas
// ---------------------------------------------------------------------------

const TRILHAS = {
  offline: {
    titulo: "Offline — manutenibilidade e testabilidade",
    medicoes: "M-01b, M-02, M-03, M-21, M-22, M-23, M-24",
    requisitos: "apenas Node + npm ci (nenhuma rede, nenhum Docker)",
    minutos: "~1–2",
    commit: COMMIT_MEDICOES,
    passos: [
      ["M-01b · cobertura de testes", "npm", ["run", "test:coverage"]],
      ["M-02 · violações de lint", "npm", ["run", "lint"], { tolerarFalha: true }],
      ["M-03 · dependências circulares (Madge)", "npm", ["run", "measure:cycles"]],
      ["M-21 · code smells (sonarjs)", "npm", ["run", "measure:smells"], { tolerarFalha: true }],
      ["M-22 · duplicação de código (jscpd)", "npm", ["run", "measure:dup"]],
      // `--no-config`: o repositorio nao versiona `.dependency-cruiser.js`, e a v16
      // aborta sem config. A medicao original correu sem regras — o que se quer
      // aqui sao as metricas de acoplamento (Ca/Ce/I), nao validacao de regras.
      ["M-23/M-24 · acoplamento (dependency-cruiser)", "npx",
        ["depcruise", "src", "--no-config", "--output-type", "metrics"]],
    ],
  },

  baseline: {
    titulo: "Baseline da Semana 1 — o ponto de partida",
    medicoes: "M-02, M-03 (M-01 não reproduz — ver nota)",
    requisitos: "apenas Node + npm ci",
    minutos: "~1–2",
    commit: COMMIT_BASELINE,
    passos: [
      ["M-02 · violações de lint (esperado: 19 erros, 9 avisos)", "npm", ["run", "lint"],
        { tolerarFalha: true }],
      ["M-03 · dependências circulares (esperado: 0)", "npm", ["run", "measure:cycles"]],
      ["suíte unitária do baseline (esperado: 11 testes em 4 arquivos)", "npm", ["test"]],
    ],
    nota:
      "M-01 (cobertura de 18,03%) NÃO reproduz aqui, e a razão está registrada: a coleta de\n" +
      "  2026-07-15 correu sobre uma árvore de trabalho suja (o próprio ambiente.txt declara\n" +
      "  'Arvore de trabalho limpa: NAO'), que já continha ReviewForm.tsx e ProfileForm.tsx —\n" +
      "  arquivos só commitados em 25ecace. A árvore medida é, portanto, o src de 25ecace com a\n" +
      "  suíte de 11 testes deste commit: combinação que não existe no histórico. Neste commit a\n" +
      "  cobertura dá 16,45%. Ver o Apêndice B, seção 'O que não reproduz'.",
  },

  integracao: {
    titulo: "Integração — segurança (RLS) e confiabilidade",
    medicoes: "M-04, M-05…M-13, M-26",
    requisitos: "Docker em execução (a CLI do Supabase é baixada por npx)",
    minutos: "~4–6",
    commit: COMMIT_MEDICOES,
    verificar: ["docker", "supabase"],
    passos: [
      ["M-04 · migrations reproduzem do zero", "npx", [...SUPABASE, "db", "reset"]],
      ["M-05…M-13 · suíte de RLS e triggers", "npm", ["run", "test:integration"]],
      ["M-26 · integridade do schema", "npx", [...SUPABASE, "db", "lint"]],
    ],
  },

  "furos-antes": {
    titulo: "O par antes/depois — os testes reprovam o sistema vulnerável",
    medicoes: "F-02, F-03",
    requisitos: "Docker em execução (a CLI do Supabase é baixada por npx)",
    minutos: "~5–7",
    commit: COMMIT_FUROS,
    verificar: ["docker", "supabase"],
    // Montado em `executarFuros`: exige remover migrations dentro do worktree.
    passos: null,
  },

  desempenho: {
    titulo: "Desempenho — carregamento da SPA e carga sobre a API",
    medicoes: "M-14…M-17 (Lighthouse), M-18…M-20 (autocannon)",
    requisitos: "Chrome instalado; a parte de carga exige o stack local de pé",
    minutos: "~5–8",
    commit: COMMIT_MEDICOES,
    passos: [
      ["build de produção", "npm", ["run", "build"]],
      ["M-18…M-20 · carga sobre a listagem", "npm", ["run", "load:seed"], { opcional: true }],
      ["M-18…M-20 · execução de carga", "npm", ["run", "load:run"], { opcional: true }],
    ],
    nota:
      "O Lighthouse (M-14…M-17) não roda aqui: exige servir o build e conduzir 3 execuções\n" +
      "  com mediana. Ver o passo manual no Apêndice B, seção 'Trilha 4'.",
  },
};

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------

/**
 * Executa um comando.
 *
 * No Windows, `npm` e `npx` sao shims `.cmd`, e desde a correcao do
 * CVE-2024-27980 o Node recusa spawna-los sem `shell: true`. Com shell ligado,
 * passar `args` como array dispara o aviso DEP0190 — que poluiria a tela
 * justamente durante a demonstracao. A saida e montar UMA linha de comando e
 * nao passar array nenhum: funciona no shim e nao emite aviso.
 */
function linha(cmd, args) {
  const citar = (a) => (/[\s"]/.test(a) ? `"${a.replaceAll('"', '\\"')}"` : a);
  return [cmd, ...args.map(citar)].join(" ");
}

function rodar(cmd, args, opcoes = {}) {
  const r = spawnSync(linha(cmd, args), {
    stdio: opcoes.silencioso ? "pipe" : "inherit",
    cwd: opcoes.cwd ?? RAIZ,
    shell: true,
    encoding: "utf8",
  });
  const saida = (r.stdout ?? "") + (r.stderr ?? "");
  // `r.error` aparece quando o processo nem chega a iniciar; sem isto, uma
  // falha de spawn se apresentaria como uma mensagem de erro vazia.
  return { codigo: r.status ?? 1, saida: r.error ? `${r.error.message}\n${saida}` : saida };
}

function disponivel(ferramenta) {
  if (ferramenta === "docker") {
    return rodar("docker", ["info"], { silencioso: true }).codigo === 0;
  }
  if (ferramenta === "supabase") {
    return rodar("npx", [...SUPABASE, "--version"], { silencioso: true }).codigo === 0;
  }
  return true;
}

function checarRequisitos(nomes = []) {
  const faltando = nomes.filter((n) => !disponivel(n));
  if (!faltando.length) return true;

  console.log(cores.erro(`\n  Pré-requisito ausente: ${faltando.join(", ")}`));
  if (faltando.includes("docker")) {
    console.log("  → Docker Desktop precisa estar em execução (o stack do Supabase roda em contêineres).");
  }
  if (faltando.includes("supabase")) {
    console.log("  → Sem instalação global: os comandos usam `npx supabase@2.109.1`,");
    console.log("    que baixa a CLI na primeira execução. Verifique se há rede.");
  }
  console.log(
    cores.dim("\n  Alternativa sem dependência alguma — evidência preservada da execução original:")
  );
  console.log(cores.dim("    .\\docs\\tcc\\medicoes\\scripts\\replay-evidencia.ps1 -All\n"));
  return false;
}

/**
 * Cria um worktree no commit indicado e instala as dependencias.
 * Devolve o caminho, ou null se o preparo falhar.
 */
function prepararWorktree(commit, rotulo) {
  const destino = join(RAIZ, ".repro", rotulo);

  if (existsSync(destino)) {
    console.log(cores.dim(`  removendo worktree anterior em .repro/${rotulo}`));
    rodar("git", ["worktree", "remove", "--force", destino], { silencioso: true });
    rmSync(destino, { recursive: true, force: true });
  }
  mkdirSync(dirname(destino), { recursive: true });

  console.log(cores.dim(`  git worktree add --detach .repro/${rotulo} ${commit}`));
  const w = rodar("git", ["worktree", "add", "--detach", destino, commit], { silencioso: true });
  if (w.codigo !== 0) {
    console.log(cores.erro(`  Falha ao criar worktree:\n${w.saida}`));
    return null;
  }

  console.log(cores.dim("  npm ci  (fixa as versões exatas do lockfile — pode levar ~1 min)"));
  const i = rodar("npm", ["ci"], { cwd: destino, silencioso: true });
  if (i.codigo !== 0) {
    console.log(cores.erro(`  Falha no npm ci:\n${i.saida.slice(-2000)}`));
    return null;
  }
  return destino;
}

function limparWorktree(destino) {
  if (!destino) return;
  rodar("git", ["worktree", "remove", "--force", destino], { silencioso: true });
  rmSync(destino, { recursive: true, force: true });
  // Remove tambem o `.repro/` quando nao sobrar nenhuma trilha: a invariante
  // e nao deixar residuo no diretorio de trabalho, e um diretorio vazio e
  // residuo — ainda que o .gitignore o esconda do `git status`.
  try {
    if (readdirSync(join(RAIZ, ".repro")).length === 0) {
      rmSync(join(RAIZ, ".repro"), { recursive: true, force: true });
    }
  } catch {
    /* ja nao existe */
  }
}

function cabecalho(nome, t, commit) {
  const linha = "─".repeat(74);
  console.log(cores.t(`\n┌${linha}`));
  console.log(`${cores.t("│")} ${cores.bold(nome)} · ${t.titulo}`);
  console.log(`${cores.t("│")} medições: ${t.medicoes}`);
  console.log(`${cores.t("│")} requisitos: ${t.requisitos} · duração ${t.minutos} min`);
  console.log(`${cores.t("│")} commit fixado: ${commit}`);
  console.log(cores.t(`└${linha}\n`));
}

function executarPassos(passos, cwd) {
  const resultados = [];
  for (const [rotulo, cmd, args, op = {}] of passos) {
    console.log(cores.t(`\n▶ ${rotulo}`));
    console.log(cores.dim(`  ${cmd} ${args.join(" ")}\n`));
    const { codigo } = rodar(cmd, args, { cwd });
    const ok = codigo === 0 || op.tolerarFalha === true;
    if (!ok && op.opcional) {
      console.log(cores.dim(`  (passo opcional falhou — seguindo)`));
    }
    resultados.push({ rotulo, codigo, ok: ok || Boolean(op.opcional) });
  }
  return resultados;
}

/**
 * Trilha 3 — reexpoe os furos F-02/F-03.
 *
 * As migrations de correcao e os testes que as reprovam entraram no MESMO commit
 * (5e324f5): nao existe commit onde o teste falhe naturalmente. Reproduzir o
 * estado vulneravel exige, portanto, remover as duas migrations dentro do
 * worktree — manipulacao deliberada e declarada, que e exatamente o procedimento
 * usado na coleta original.
 */
function executarFuros(cwd) {
  console.log(cores.t("\n▶ Removendo as migrations de correção (recria o estado vulnerável)"));
  for (const m of MIGRATIONS_CORRECAO) {
    const caminho = join(cwd, m);
    if (!existsSync(caminho)) {
      console.log(cores.erro(`  ausente: ${m}`));
      return [{ rotulo: "preparo", codigo: 1, ok: false }];
    }
    rmSync(caminho);
    console.log(cores.dim(`  removida: ${m}`));
  }

  console.log(cores.t("\n▶ Recriando o banco sem as correções"));
  const reset = rodar("npx", [...SUPABASE, "db", "reset"], { cwd });
  if (reset.codigo !== 0) return [{ rotulo: "db reset", codigo: reset.codigo, ok: false }];

  console.log(cores.t("\n▶ F-02/F-03 · ANTES — os dois testes devem FALHAR (em vermelho)"));
  console.log(
    cores.dim("  É o resultado esperado: prova que o instrumento reprova o sistema vulnerável.\n")
  );
  const antes = rodar("npm", ["run", "test:integration"], { cwd });

  console.log(cores.t("\n▶ Restaurando as migrations de correção"));
  const restore = rodar("git", ["checkout", "--", "supabase/migrations/"], { cwd, silencioso: true });
  if (restore.codigo !== 0) {
    console.log(cores.erro("  Falha ao restaurar as migrations no worktree."));
  }

  console.log(cores.t("\n▶ Recriando o banco com as correções"));
  rodar("npx", [...SUPABASE, "db", "reset"], { cwd });

  console.log(cores.t("\n▶ F-02/F-03 · DEPOIS — os mesmos testes devem PASSAR (em verde)\n"));
  const depois = rodar("npm", ["run", "test:integration"], { cwd });

  // A trilha so faz sentido se ANTES reprovar e DEPOIS aprovar.
  return [
    { rotulo: "ANTES (esperado: falhar)", codigo: antes.codigo, ok: antes.codigo !== 0 },
    { rotulo: "DEPOIS (esperado: passar)", codigo: depois.codigo, ok: depois.codigo === 0 },
  ];
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function listar() {
  console.log(cores.bold("\nTrilhas de reprodução das medições do TCC\n"));
  for (const [nome, t] of Object.entries(TRILHAS)) {
    console.log(`  ${cores.t(nome.padEnd(13))} ${t.titulo}`);
    console.log(`  ${" ".repeat(13)} ${cores.dim(`${t.medicoes} · ${t.requisitos} · ${t.minutos} min`)}`);
    console.log();
  }
  console.log(cores.dim("  Sem dependência alguma (evidência preservada da execução original):"));
  console.log(cores.dim("    .\\docs\\tcc\\medicoes\\scripts\\replay-evidencia.ps1 -All\n"));
  console.log(cores.dim("  --aqui   roda na árvore atual em vez do worktree fixado"));
  console.log(cores.dim("           (números legítimos, porém diferentes dos do artigo)\n"));
  console.log(cores.dim("  Protocolo completo: docs/tcc/apendice-b-reproducao.md\n"));
}

const args = process.argv.slice(2);
const aqui = args.includes("--aqui");
const nome = args.find((a) => !a.startsWith("--"));

if (!nome || args.includes("--lista") || args.includes("--help")) {
  listar();
  process.exit(0);
}

const trilha = TRILHAS[nome];
if (!trilha) {
  console.error(cores.erro(`\nTrilha desconhecida: ${nome}`));
  listar();
  process.exit(1);
}

cabecalho(nome, trilha, aqui ? "árvore atual (--aqui)" : trilha.commit);

if (!checarRequisitos(trilha.verificar)) process.exit(1);

let cwd = RAIZ;
let temporario = null;
if (!aqui) {
  temporario = prepararWorktree(trilha.commit, nome);
  if (!temporario) process.exit(1);
  cwd = temporario;
}

let resultados;
try {
  resultados = nome === "furos-antes" ? executarFuros(cwd) : executarPassos(trilha.passos, cwd);
} finally {
  if (temporario) {
    console.log(cores.dim("\n  removendo worktree temporário…"));
    limparWorktree(temporario);
  }
}

if (trilha.nota) console.log(cores.dim(`\n  ${trilha.nota}`));

console.log(cores.bold("\n  Resumo\n"));
for (const r of resultados) {
  const marca = r.ok ? cores.ok("  ok  ") : cores.erro(" falha");
  console.log(`   ${marca}  ${r.rotulo}`);
}

const falhou = resultados.some((r) => !r.ok);
console.log(
  falhou
    ? cores.erro("\n  Alguma etapa não terminou como esperado — ver a saída acima.\n")
    : cores.ok("\n  Trilha concluída como esperado.\n")
);
process.exit(falhou ? 1 : 0);
