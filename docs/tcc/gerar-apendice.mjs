#!/usr/bin/env node
/**
 * Monta `docs/tcc/apendice-a-diagramas.md` a partir dos fontes canonicos de
 * `docs/tcc/diagramas/`.
 *
 * Por que gerar em vez de manter a mao: os diagramas ja existem, um por arquivo,
 * e sao a fonte citada pelo artigo. Concatenar aqui evita que o apendice derive
 * do original — o defeito que o `TCC-Hubservi.md` acumulou.
 *
 * A numeracao e propria e autocontida (Figura A.1..A.10, Tabela A.1..A.7), de
 * modo que inserir ou remover figuras no corpo do artigo nao desloque nada aqui.
 *
 *   node docs/tcc/gerar-apendice.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = dirname(fileURLToPath(import.meta.url));
const DIAGRAMAS = join(AQUI, "diagramas");
const SAIDA = join(AQUI, "apendice-a-diagramas.md");

const REPO = "https://github.com/Richardy-Rodrigues/hubservi";
const TAG = "tcc-v1";

// Ordem das figuras — precisa espelhar a lista de `apendice()` em
// gerar-artigo-docx.py, senao o .md e o .pdf divergem na numeracao.
const FIGURAS = [
  ["der.md", "Diagrama Entidade-Relacionamento (DER)"],
  ["caso-de-uso.md", "Diagrama de Casos de Uso"],
  ["classes.md", "Diagrama de Classes"],
  ["sequencia-autenticacao.md", "Diagrama de Sequência — Autenticação"],
  ["sequencia-contratacao.md", "Diagrama de Sequência — Contratação (booking)"],
  ["sequencia-avaliacao.md", "Diagrama de Sequência — Avaliação (review)"],
  ["componentes.md", "Diagrama de Componentes"],
  ["implantacao.md", "Diagrama de Implantação"],
  ["bpmn-contratacao.md", "BPMN — Contratação de serviço"],
  ["bpmn-gerenciamento-booking.md", "BPMN / Máquina de estados — Gerenciamento de booking"],
];

// Titulo da secao no dicionario -> legenda da tabela.
const TABELAS = [
  ["Enumerações", "Tipos enumerados do esquema"],
  ["Tabela `profiles`", "Tabela `profiles`"],
  ["Tabela `categories`", "Tabela `categories`"],
  ["Tabela `services`", "Tabela `services`"],
  ["Tabela `bookings`", "Tabela `bookings`"],
  ["Tabela `reviews`", "Tabela `reviews`"],
  ["Views", "Views derivadas"],
];

const ler = (arquivo) => readFileSync(join(DIAGRAMAS, arquivo), "utf8").trimEnd();

/** Remove o `# Titulo` da primeira linha — a legenda numerada o substitui. */
function corpo(texto) {
  return texto.replace(/^#\s+.*\r?\n+/, "");
}

const tituloFigura = (n, legenda) => `Figura A.${n} — ${legenda}`;

/**
 * Rebaixa os `## X` internos do diagrama para `### X`: aqui o nivel 2 pertence
 * a numeracao do apendice, e "Notas"/"Regras de transicao" sao subordinadas a
 * figura, nao irmas dela.
 */
function rebaixar(texto) {
  return texto.replace(/^## /gm, "### ");
}

/**
 * Reescreve links relativos entre diagramas.
 *
 * Nos arquivos de origem, `(sequencia-avaliacao.md)` aponta para um irmao dentro
 * de `diagramas/`. Concatenados aqui, esses caminhos passariam a ser resolvidos
 * a partir de `docs/tcc/` e quebrariam; basta prefixar o diretorio.
 *
 * Optou-se por apontar ao arquivo-fonte em vez de uma ancora interna deste
 * documento: a ancora dependeria de reproduzir exatamente as regras de slug do
 * GitHub (que removem travessao e acentos de formas nao obvias), e um link
 * quebrado ali falharia em silencio. O caminho de arquivo e verificavel.
 */
function religar(texto) {
  return texto.replace(
    /\]\((?!https?:|#)([^)]+\.md)([^)]*)\)/g,
    (_todo, alvo, resto) => `](diagramas/${alvo.split("/").pop()}${resto})`
  );
}

/**
 * Insere a legenda logo apos o bloco Mermaid — a legenda de figura vem abaixo
 * da figura (NBR 6024), antes das notas explicativas.
 */
function comLegenda(texto, legenda) {
  const fim = texto.indexOf("\n```", texto.indexOf("```mermaid"));
  if (fim === -1) throw new Error(`sem bloco mermaid: ${legenda}`);
  const corte = texto.indexOf("\n", fim + 1) + 1;
  return texto.slice(0, corte) + `\n${legenda}\n` + texto.slice(corte);
}

function figura(arquivo, legenda, n) {
  const rodape = `> **Figura A.${n} — ${legenda}.** Fonte: elaborado pelos autores (2026), a partir de \`diagramas/${arquivo}\`.`;
  return [
    `## ${tituloFigura(n, legenda)}`,
    "",
    comLegenda(religar(rebaixar(corpo(ler(arquivo)))), rodape),
  ].join("\n");
}

function dicionario() {
  const bruto = ler("dicionario-de-dados.md");
  const preambulo = corpo(bruto).split(/^## /m)[0].trim();

  const blocos = [`## A.1 Dicionário de dados`, "", preambulo, ""];

  // Fatia por `## `, casando cada secao com a legenda numerada correspondente.
  const secoes = corpo(bruto).split(/^## /m).slice(1);
  if (secoes.length !== TABELAS.length) {
    throw new Error(
      `dicionario-de-dados.md tem ${secoes.length} seções; TABELAS declara ${TABELAS.length}. ` +
        `Atualize a lista antes de gerar.`
    );
  }

  secoes.forEach((secao, i) => {
    const [titulo, legenda] = TABELAS[i];
    const conteudo = secao.replace(/^.*\r?\n+/, "").trimEnd();
    blocos.push(
      `### Tabela A.${i + 1} — ${legenda}`,
      "",
      conteudo,
      "",
      `> **Tabela A.${i + 1} — ${legenda}.** Fonte: elaborado pelos autores (2026), a partir de \`supabase/migrations/\`.`,
      ""
    );
    if (!secao.startsWith(titulo)) {
      console.warn(`  aviso: seção ${i + 1} começa com "${secao.split("\n")[0]}", esperado "${titulo}"`);
    }
  });

  return blocos.join("\n").trimEnd();
}

const cabecalho = `# Apêndice A — Diagramas (UML, BPMN e DER) e dicionário de dados

**Material suplementar** do artigo *Avaliação Técnica de uma Arquitetura Web baseada em BaaS/Serverless para Intermediação de Serviços: um estudo de caso da plataforma Hubservi*.

Pedro Conrado Fernandes Vieira · Richardy Gabriel Rodrigues da Costa
Graduandos em Engenharia de Software — Uni-FACEF
Orientador: Prof. Daniel Facciolo Pires

---

## Sobre este documento

Este apêndice foi publicado como documento próprio, e não como seção do artigo, por três razões:

1. Os diagramas são **artefatos do estudo de caso** (o instrumento), não resultados da avaliação (o objeto de pesquisa). Mantê-los fora do corpo preserva essa distinção, formalizada na Seção 1.5 do artigo.
2. Em Markdown no GitHub, os blocos Mermaid são **renderizados nativamente** e permanecem legíveis, pesquisáveis e versionados — o que uma imagem embutida no \`.docx\` não oferece.
3. Cada diagrama é **derivado do código-fonte e das \`migrations\`**, não desenhado à parte. Publicá-lo ao lado do código torna a divergência entre modelo e implementação verificável.

A numeração é **autocontida** (Figura A.1–A.10, Tabela A.1–A.7): inserir ou remover figuras no corpo do artigo não a desloca.

Os fontes Mermaid de cada figura estão em [\`docs/tcc/diagramas/\`](diagramas/), um arquivo por diagrama. Este documento é montado a partir deles por [\`gerar-apendice.mjs\`](gerar-apendice.mjs) — **não o edite à mão**; edite o diagrama de origem e regenere:

\`\`\`bash
node docs/tcc/gerar-apendice.mjs
\`\`\`

### Como citar

> VIEIRA, Pedro Conrado Fernandes; COSTA, Richardy Gabriel Rodrigues da. **Apêndice A — Diagramas (UML, BPMN e DER) e dicionário de dados**: material suplementar. Franca: Uni-FACEF, 2026. Disponível em: ${REPO}/blob/${TAG}/docs/tcc/apendice-a-diagramas.md. Acesso em: [data].

### Material suplementar relacionado

| Documento | Conteúdo |
|---|---|
| [Apêndice B — Reprodução das medições](apendice-b-reproducao.md) | Como reproduzir cada medição M-01…M-26, e o que não é reproduzível |
| [Registro de medições](medicoes/registro-medicoes.md) | Tabela mestra: valor, ferramenta, versão, evidência e veredito |
| [Protocolo de medição](medicoes/README.md) | Regras de coleta e regra anti-fabricação |
| [Evidências brutas](medicoes/evidencias/) | Saídas originais das ferramentas, por data de coleta |

---

## Sumário

${FIGURAS.map(([, legenda], i) => `- Figura A.${i + 1} — ${legenda}`).join("\n")}
- A.1 Dicionário de dados (Tabelas A.1–A.7)

---
`;

const partes = [
  cabecalho,
  ...FIGURAS.map(([arquivo, legenda], i) => figura(arquivo, legenda, i + 1)),
  "---",
  dicionario(),
  "",
];

writeFileSync(SAIDA, partes.join("\n\n").replace(/\n{4,}/g, "\n\n\n") + "\n", "utf8");
console.log(`Gerado: ${SAIDA}`);
console.log(`  figuras: ${FIGURAS.length} | tabelas: ${TABELAS.length}`);
