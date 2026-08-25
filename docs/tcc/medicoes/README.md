# Medições — protocolo de execução e registro

Este diretório contém as **evidências** que sustentam os resultados quantitativos do artigo (objetivos específicos 5 a 9). Ele operacionaliza a exigência da Seção 5.1: *"Cada execução de medição registra: ferramenta e versão, ambiente, configuração, data, valor obtido e veredito"*.

## Regras

1. **Nenhum número entra no texto do artigo sem um arquivo de evidência correspondente neste diretório.** É a aplicação da regra anti-fabricação da Seção 5.4.
2. **Toda linha do registro cita um commit (SHA) e um caminho de evidência.** Sem isso é alegação, não medição.
3. **Falhas são registradas com o mesmo rigor que sucessos.** Quando uma medição reprova o sistema, o veredito "não atende" é publicado, a correção é feita e a medição é repetida — reportando o par antes/depois. Um resultado integralmente favorável na primeira execução não demonstraria qualidade do sistema, e sim fraqueza dos cenários.
4. Cada rodada de coleta cria um diretório `evidencias/AAAA-MM-DD/` contendo obrigatoriamente um `ambiente.txt`.

## Estrutura

```
medicoes/
  README.md                  # este arquivo — o protocolo
  registro-medicoes.md       # tabela mestra de todas as medições
  evidencias/AAAA-MM-DD/
    ambiente.txt             # SO, CPU, RAM, node, npm, versões das ferramentas, commit
    coverage-summary.json    # Vitest + coverage-v8
    eslint-report.json       # ESLint (formato JSON)
    madge-circular.txt       # Madge — dependências circulares
    vitest-unit.log          # saída da suíte unitária
```

## Como reproduzir cada medição

**Reprodutibilidade aqui significa mesmo commit + mesmo ambiente**, não "mesmo comando hoje": a branch está à frente do estado medido, e rodar as ferramentas na árvore atual produz números legítimos, porém diferentes dos que o artigo reporta. Por isso a reprodução acontece em `git worktree` fixado no commit da coleta.

O roteiro completo — trilhas, tempos, pré-requisitos e o que **não** é reproduzível — está no [**Apêndice B**](../apendice-b-reproducao.md). Em resumo:

| Comando | Medições | Requisitos | Tempo |
|---|---|---|---|
| `npm run repro` | *(lista as trilhas)* | — | — |
| `npm run repro:offline` | M-01b, M-02, M-03, M-21, M-22, M-23, M-24 | Node + `npm ci` | ~1–2 min |
| `npm run repro:baseline` | M-02, M-03 (Semana 1) | Node + `npm ci` | ~1–2 min |
| `npm run repro:integracao` | M-04, M-05…M-13, M-26 | Docker + CLI Supabase | ~4–6 min |
| `npm run repro:furos-antes` | F-02, F-03 (par antes/depois) | Docker + CLI Supabase | ~5–7 min |
| `npm run repro:desempenho` | M-18…M-20 (+ Lighthouse manual) | Chrome; stack local | ~5–8 min |
| `replay-evidencia.ps1 -All` | todas, a partir da evidência preservada | **nenhum** | instantâneo |

Medições isoladas, na árvore atual (números **não** comparáveis aos do artigo):

| ID | Comando |
|----|---------|
| M-01/M-01b | `npm run test:coverage` → lê `coverage/coverage-summary.json` |
| M-02 | `npm run measure:lint` → grava em `evidencias/AAAA-MM-DD/` |
| M-03 | `npm run measure:cycles` |
| M-21 | `npm run measure:smells` |
| M-22 | `npm run measure:dup` |
| M-23/M-24 | `npx depcruise src --no-config --output-type metrics` |
| M-25 | `npm run measure:sca` → grava em `evidencias/AAAA-MM-DD/` |

Para registrar o ambiente de uma nova rodada, replicar o `ambiente.txt` da rodada anterior atualizando os valores — ele deve sempre conter o SHA de `git rev-parse HEAD`.

> **Lição registrada.** As coletas de 2026-07-15 e 2026-07-16 correram sobre a árvore de trabalho, não sobre um commit — o que tornou **M-01 irreprodutível** e exigiu descobrir a posteriori a que commit cada coleta correspondia (ver o cabeçalho de [`registro-medicoes.md`](registro-medicoes.md)). Toda rodada futura deve partir de árvore limpa: `git status --porcelain` vazio antes de medir, e o SHA anotado no `ambiente.txt` sendo o do estado efetivamente medido.

## Prints de tela das execuções

As saídas preservadas podem ser reencenadas na tela para captura, **sem re-executar nenhuma medição** — o que mantém as imagens numericamente idênticas ao que o artigo reporta:

```powershell
node docs/tcc/medicoes/scripts/gerar-relatorios-html.mjs      # relatórios nativos de ESLint e Lighthouse
.\docs\tcc\medicoes\scripts\replay-evidencia.ps1 -List        # as 18 telas disponíveis
```

Protocolo, índice das telas e convenção de captura em [`evidencias/prints/README.md`](evidencias/prints/README.md). Os `.log` são impressos com as sequências ANSI originais (o vermelho/verde do Vitest é o da execução real) e os JSONs são renderizados pelo relatório oficial da própria ferramenta.

### Nota sobre o *lockfile* (condição de reprodutibilidade)

O repositório continha três *lockfiles* simultâneos (`bun.lock`, `bun.lockb`, `package-lock.json`), resíduo do *scaffold* original. Isso não é apenas desorganização: ferramentas de análise de composição de software (SCA, como o Snyk) resolvem o grafo de dependências a partir do *lockfile* que encontrarem, de modo que dois grafos divergentes tornariam a métrica "0 CVEs de severidade alta/crítica" dependente de qual arquivo a ferramenta escolheu — irreprodutível por construção. Os arquivos do `bun` foram removidos (o gerenciador sequer está instalado no ambiente de desenvolvimento) e o `package.json` passou a declarar `packageManager: "npm@11.9.0"` e `engines.node`.

### Nota sobre as exclusões de cobertura

A medição de cobertura exclui `src/components/ui/**`, `src/integrations/supabase/types.ts`, `client.ts`, `main.tsx` e `App.tsx`. A exclusão mais relevante é a primeira: `src/components/ui/` contém a biblioteca shadcn/ui **vendorizada** (código de terceiros copiado para o repositório, não autoral), com volume superior ao do código próprio. Incluí-la mediria a cobertura de código que a equipe não escreveu e não mantém, distorcendo tanto a testabilidade quanto — no caso do SonarQube — a densidade de duplicação. As demais exclusões cobrem artefatos gerados (`types.ts`), *singletons* acoplados ao ambiente (`client.ts`) e *bootstrap* sem lógica de decisão.
