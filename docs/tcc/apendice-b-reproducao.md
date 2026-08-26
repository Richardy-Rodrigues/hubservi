# Apêndice B — Reprodução das medições

**Material suplementar** do artigo *Avaliação Técnica de uma Arquitetura Web baseada em BaaS/Serverless para Intermediação de Serviços: um estudo de caso da plataforma Hubservi*.

Pedro Conrado Fernandes Vieira · Richardy Gabriel Rodrigues da Costa
Graduandos em Engenharia de Software — Uni-FACEF
Orientador: Prof. Daniel Facciolo Pires

---

## O que este documento responde

Se um avaliador pedir, durante a defesa, *"rode esse teste agora"* — o que é possível executar ao vivo, quanto tempo leva, e o que **não** é reproduzível e por quê.

A resposta curta: **das 26 medições (M-01…M-26) e 3 achados (F-01…F-03), 24 são reproduzíveis ao vivo**; 3 têm restrições declaradas e 1 não é reproduzível por nenhum meio. Todas as exceções estão nomeadas na seção [O que não reproduz](#o-que-não-reproduz), com a razão técnica.

Nenhuma medição depende de conta paga, chave de API ou serviço proprietário — as substituições k6 → autocannon e Snyk → `npm audit` foram feitas justamente para eliminar essa dependência (Seção 5.3 do artigo).

---

## A distinção que sustenta tudo

**Reprodutibilidade aqui significa mesmo commit + mesmo ambiente, não "mesmo comando hoje".**

A branch está vários commits à frente do estado em que as medições foram coletadas, com funcionalidades acrescentadas depois (recuperação de senha, entre outras). Rodar as ferramentas na árvore atual produz números **legítimos, porém diferentes** dos que a Seção 7 reporta. Isso não é falha de reprodutibilidade: é o sistema tendo evoluído.

Por isso cada trilha abaixo executa dentro de um **`git worktree` fixado no commit da medição**. Os números saem idênticos aos do artigo, e a árvore de trabalho de quem apresenta não é tocada.

| Commit | O que reproduz |
|---|---|
| `b2897c2` | Baseline da Semana 1 — M-02, M-03 |
| `5e324f5` | O par antes/depois dos furos — F-02, F-03 |
| `25ecace` | A campanha das Semanas 2–8 — M-01b, M-04…M-26 |

> **Por que `25ecace`, e não um dos commits `docs(tcc)` da campanha.** As medições de 2026‑07‑16 correram sobre uma árvore que já continha `ReviewForm.tsx` e `ProfileForm.tsx` — arquivos **ainda não commitados** naquele momento, que só entraram no histórico em `25ecace`. Nos commits anteriores (`aa5df76`…`bb0bf13`) existem os *testes* desses componentes **sem** os componentes: ali a suíte sequer resolve os imports. `25ecace` é o primeiro commit cuja árvore de `src/` corresponde à que foi medida.
>
> Esse desalinhamento entre a árvore medida e o histórico versionado é, ele próprio, um achado — da mesma família de F‑01 (as *migrations* não recriavam os privilégios de API). Está registrado aqui em vez de corrigido retroativamente, porque reescrever o histórico apagaria a evidência do problema.

---

## Passo a passo na sua máquina

Do zero até rodar os testes. Os passos 1 e 2 são de instalação, feitos **uma vez**; o passo 3 em diante é o que se repete.

### 1. Instalar o que é pré-requisito

| Item | Necessário para | Verificar | Se faltar |
|---|---|---|---|
| **Node ≥ 20** | tudo | `node -v` | <https://nodejs.org> (versão LTS) |
| **Git** | tudo (as trilhas usam `git worktree`) | `git --version` | <https://git-scm.com/downloads> |
| **Docker Desktop** | testes de integração e de carga | `docker info` | <https://www.docker.com/products/docker-desktop/> |
| **Chrome** | Lighthouse | — | já vem na maioria das máquinas |

**A CLI do Supabase não precisa ser instalada.** Os scripts a invocam por `npx supabase@2.109.1` — a mesma versão registrada em `evidencias/2026-07-16/ambiente.txt`. Ela é baixada na primeira execução (exige rede uma vez) e fica em cache. Fixar a versão pelo `npx` é mais reprodutível que uma instalação global, cuja versão ninguém controla.

> **Docker precisa estar *em execução*, não apenas instalado.** Abra o Docker Desktop e espere o ícone ficar verde. `docker info` responder sem erro é o teste definitivo.

### 2. Preparar o repositório

```bash
git clone https://github.com/Richardy-Rodrigues/hubservi.git
cd hubservi
npm ci
```

Use `npm ci`, não `npm install`: `ci` instala exatamente as versões do `package-lock.json`. Um `install` pode atualizar dependências e mudar os números medidos.

O arquivo `.env` **não é necessário** para os testes — só para rodar a aplicação (`npm run dev`). As suítes de integração falam com o stack local pelas chaves fixas da CLI, resolvidas em `tests/integration/helpers/env.ts`.

### 3. Rodar os testes que não precisam de Docker

Funciona offline, em qualquer máquina, em segundos:

```bash
npm test                  # 59 testes unitários em 13 arquivos
npm run test:coverage     # os mesmos, com relatório de cobertura
npm run lint              # análise estática
```

> Os **59** testes são o estado atual do repositório. O artigo reporta **44**, que é o número
> no commit da medição — a suíte cresceu depois. Para obter exatamente os números do artigo,
> veja [Reproduzir os números do artigo](#reproduzir-os-números-do-artigo).

### 4. Subir o stack local (para os testes de integração)

```bash
npm run db:start          # 1ª vez: baixa ~1 GB de imagens Docker, leva alguns minutos
npm run db:reset          # aplica as 12 migrations + seed sobre um banco limpo
```

Confira com `npm run db:status`. O Studio fica em <http://localhost:54323>.

### 5. Rodar os testes de integração

```bash
npm run test:integration  # suíte de RLS, triggers e integridade (9 arquivos)
```

Eles rodam contra o PostgREST real, com clientes autenticados por papel — não contra mocks.

> ⚠️ **Isto apaga os dados de domínio do stack local** (`reviews`, `bookings`, `services`) antes de cada arquivo de teste. Usuários e categorias são preservados. Não afeta nenhum ambiente remoto.

### Nota — por que não rodar contra o Supabase online

A suíte de integração **só roda contra o stack local**, e há uma trava que impede o contrário.

O motivo é `resetDomainData()`, chamada no `beforeEach` da maioria dos arquivos: ela faz `DELETE` incondicional em `reviews`, `bookings` e `services` via `service_role`, ignorando RLS. Contra um projeto gerenciado, isso apaga os dados reais — sem filtro e sem desfazer. O `setup.ts` ainda criaria quatro usuários de teste no Auth daquele projeto.

Isso não é limitação acidental: os testes **precisam** de um banco descartável, porque montam o cenário do zero a cada caso (é o que permite afirmar "0 acessos indevidos" sem depender de dados preexistentes).

Se o alvo for mesmo um projeto **criado só para teste**, o opt-in é explícito:

```bash
PERMITIR_ALVO_REMOTO=sim npm run test:integration
```

O que **pode** ser medido contra a instância online, sem risco:

| Medição | Comando | Observação |
|---|---|---|
| M-14…M-17 (Lighthouse) | `npx lighthouse <url-de-producao>` | **Mais representativo** que o local: mede o host real, com CSP, HSTS e CDN |
| M-18…M-20 (carga, leitura) | `SUPABASE_URL=<url> npm run load:run` | Somente leitura. Atenção aos limites de taxa do plano gratuito |
| M-25 (`npm audit`) | `npm run measure:sca` | Não depende de Supabase |

A Seção 5.4 do artigo já declara como ameaça à validade que a medição de carga correu contra o stack local — sem latência de rede real nem limites de plano gerenciado. Rodar o Lighthouse contra a URL de produção **fortalece** o trabalho: é o dado que falta, e é o mesmo motivo pelo qual o DAST ficou pendente.

### 6. Teste de carga (opcional)

Com o stack de pé:

```bash
npm run load:seed         # semeia 50 serviços (ajustável por SEED_N)
npm run load:run          # 30 conexões por 20 s
```

As saídas vão para `docs/tcc/medicoes/evidencias/AAAA-MM-DD/`.

### 7. Ao terminar

```bash
npm run db:stop
```

### Resumo — do zero ao verde

```bash
git clone https://github.com/Richardy-Rodrigues/hubservi.git && cd hubservi
npm ci
npm test                                        # 59 unitários, sem Docker
npm run db:start && npm run db:reset            # stack local (exige Docker)
npm run test:integration                        # integração
npm run db:stop
```

---

## Reproduzir os números do artigo

Os comandos acima rodam os testes **na árvore atual** — o que responde "os testes passam?". Para responder "os números do artigo se confirmam?", use as trilhas, que fixam o commit da coleta:

| Item | Necessário para | Como verificar |
|---|---|---|
| Node ≥ 20 + npm | tudo | `node -v` |
| Git | tudo (as trilhas usam `git worktree`) | `git --version` |
| **Docker em execução** | trilhas 2 e 3 | `docker info` |
| **CLI do Supabase** | trilhas 2 e 3 | baixada por `npx`, sem instalação |
| Chrome | Lighthouse (trilha 4) | — |

**Antes da apresentação**, com rede disponível:

```bash
npm ci                 # instala as dependências fixadas pelo lockfile
npm run db:start       # sobe o stack local (a 1ª vez baixa as imagens Docker)
```

Deixar o stack **quente** é o que separa uma demo de 4 minutos de uma de 12: a primeira subida puxa as imagens do Postgres, GoTrue, PostgREST e Studio.

---

## As trilhas

Listar as trilhas disponíveis:

```bash
npm run repro
```

### Trilha 0 — Evidência preservada · **0 dependências, instantâneo**

Reencena na tela as saídas originais das ferramentas, com cabeçalho declarando medição, data, commit e comando. Não re-executa nada — e é justamente por isso que os números na tela são **idênticos** aos do artigo.

```powershell
.\docs\tcc\medicoes\scripts\replay-evidencia.ps1 -List      # as 18 telas
.\docs\tcc\medicoes\scripts\replay-evidencia.ps1 -Id P-11   # uma tela
.\docs\tcc\medicoes\scripts\replay-evidencia.ps1 -All       # todas, com pausa
```

**É o plano de contingência.** Se o Docker não subir, se a rede cair, se o notebook do laboratório não tiver a CLI — esta trilha funciona. Protocolo e índice das telas em [`medicoes/evidencias/prints/README.md`](medicoes/evidencias/prints/README.md).

### Trilha 1 — Offline · **~1–2 min, sem Docker, sem rede**

```bash
npm run repro:offline
```

| Medição | Critério | Valor no artigo | Verificado |
|---|---|---|---|
| M-01b · cobertura de linhas | piso 30% global | **31,99%** | ✅ idêntico |
| M-02 · violações de lint | tendência a 0 | 19 erros | ✅ (ver nota) |
| M-03 · dependências circulares | 0 | **0** (93 arquivos) | ✅ idêntico |
| M-21 · *code smells* (sonarjs) | 2º ponto de dado | **25 erros + 4 avisos** | ✅ idêntico |
| M-22 · duplicação (jscpd) | ≤ 3% | **3,03%** total · **4,55%** TSX | ✅ idêntico |
| M-23/M-24 · acoplamento | 0 ciclos | 0 violações | ✅ |

> **Nota sobre M-02.** O valor do artigo (19 erros, **9** avisos) é do *baseline*, medido em `b2897c2` — reproduza-o pela trilha 1b. Em `25ecace` a mesma configuração acusa 19 erros e **10** avisos.

### Trilha 1b — Baseline da Semana 1 · **~1–2 min**

```bash
npm run repro:baseline
```

Reproduz o ponto de partida em `b2897c2`: **M-02 (19 erros, 9 avisos — idêntico)**, **M-03 (0 ciclos)** e a suíte unitária original (11 testes em 4 arquivos). M-01 **não** reproduz aqui — ver [O que não reproduz](#o-que-não-reproduz).

### Trilha 2 — Integração: segurança e confiabilidade · **~4–6 min**

```bash
npm run repro:integracao      # exige Docker + CLI do Supabase
```

Recria o banco do zero a partir das *migrations* versionadas e roda a suíte de integração contra o **PostgREST real**, com clientes autenticados por papel — não contra mocks.

| Medição | Cenário |
|---|---|
| M-04 | As *migrations* reproduzem um sistema funcional do zero |
| M-05 | Autenticação por papel + *trigger* `handle_new_user` |
| M-06…M-10 | RLS: escalonamento de privilégio, isolamento de serviços e *bookings*, PII, autoria de avaliações |
| M-11…M-13 | Confiabilidade: máquina de estados, integridade referencial, fluxo ponta a ponta |
| M-26 | Integridade do schema (`supabase db lint`) |

São **30 testes em 9 arquivos**. Cada cenário inclui tanto o caso indevido (que deve ser barrado) quanto o controle legítimo (que deve funcionar) — sem o segundo, um teste passaria por nunca exercitar o caminho real.

### Trilha 3 — O par antes/depois · **~5–7 min** ⭐

```bash
npm run repro:furos-antes     # exige Docker + CLI do Supabase
```

**É a demonstração mais forte do trabalho**, e a que merece explicação antes de rodar.

As *migrations* de correção e os testes que as reprovam entraram no **mesmo commit** (`5e324f5`): não existe commit onde o teste falhe naturalmente. Reproduzir o estado vulnerável exige, portanto, uma manipulação deliberada — que é exatamente o procedimento da coleta original. O script:

1. cria um *worktree* em `5e324f5`;
2. **remove** `20260716130000_fix_profiles_pii_exposure.sql` e `20260716130100_validate_review_provider.sql`;
3. recria o banco e roda a suíte: **dois testes falham em vermelho**, com o vazamento literal `"email": "provider_b@test.local"` na saída;
4. restaura as *migrations*, recria o banco e roda de novo: **tudo verde**.

O par antes/depois é o resultado — não o painel verde final. Sem a etapa 3, um resultado inteiramente favorável nada demonstraria: provaria apenas que os cenários eram fracos demais para reprovar o sistema.

### Trilha 4 — Desempenho · **~5–8 min**

```bash
npm run repro:desempenho
```

Cobre o *build* de produção e a carga sobre a API (M-18…M-20, autocannon — exige o stack local de pé).

**O Lighthouse (M-14…M-17) fica como passo manual**, porque exige servir o *build* e conduzir três execuções com reporte da mediana:

```bash
npm run build
npm run preview                                    # em outro terminal, porta 4173
npx lighthouse http://localhost:4173/ --only-categories=performance --view
```

Uma execução única basta para a banca ver a ordem de grandeza (score ~88, LCP ~3,2 s, **critério não atendido**); o valor publicado é a mediana de três.

---

## O que não reproduz

Quatro casos. Nenhum é omissão: cada um tem razão técnica, e três deles decorrem de o trabalho ter feito exatamente o que se propôs.

### 1. M-01 — cobertura do baseline (18,03%) · **não reproduz em commit algum**

O `ambiente.txt` da coleta declara `Arvore de trabalho limpa: NAO`. A verificação feita para este apêndice mostrou o que isso significa em concreto: o `coverage-summary.json` de 2026‑07‑15 já lista `ReviewForm.tsx` e `ProfileForm.tsx` (esta última com 62,5% de cobertura) — arquivos que só foram commitados em `25ecace`.

A árvore medida é, portanto, **o `src/` de `25ecace` combinado com a suíte de 11 testes de `b2897c2`** — combinação que não existe em nenhum commit do histórico. Em `b2897c2` a mesma medição dá **16,45%**.

O veredito do artigo não muda (o baseline reprova o critério em ambos os casos, e a conclusão — "a suíte cobre apenas quatro alvos pontuais" — permanece), mas **o número 18,03% não é reproduzível**, e é assim que deve ser lido. As demais medições do baseline (M-02 e M-03) reproduzem exatamente.

### 2. M-25 — `npm audit` · **reproduz o procedimento, não o número**

O `npm audit` consulta o **banco de advisories do registry npm, que é um serviço vivo**. A mesma árvore, o mesmo *lockfile* e a mesma máquina produzem contagens diferentes conforme novas vulnerabilidades são publicadas ou reclassificadas.

É irreprodutibilidade **por construção da ferramenta**, não por descuido do procedimento — e vale para qualquer SCA, inclusive o Snyk originalmente previsto. Por isso o registro fixa a data da consulta (2026‑07‑16: 12 altas, 8 moderadas, 0 críticas) e a leitura qualitativa que sustenta a conclusão: **11 dos 12 CVEs de severidade alta estão em ferramentas de build**, sem superfície de ataque em produção; **1 é de produção** (`react-router-dom`). Essa separação continua válida mesmo que a contagem mude.

```bash
npm run measure:sca     # grava em evidencias/AAAA-MM-DD/, não sobrescreve a evidência do artigo
```

### 3. M-14…M-17 — Lighthouse · **reproduz a faixa e o veredito, não o valor exato**

O Lighthouse tem variância inerente entre execuções — foi por isso que o protocolo fixou **três execuções com reporte da mediana**. Uma execução isolada pode dar ±3 pontos de *score* e ±0,3 s de LCP.

O que reproduz de forma estável é o que sustenta a conclusão: **score na casa dos 85–88 e LCP acima de 3 s, ambos abaixo da meta** (≥ 90 e ≤ 2,5 s). O veredito "não atende" é robusto à variância; o "88" não é.

### 4. DAST / OWASP ZAP · **nunca executado**

Decisão registrada, não pendência esquecida. Rodar o ZAP contra o `vite preview` local mediria os cabeçalhos do **servidor de preview**, não os do host de produção — que é quem define CSP, HSTS e afins. O resultado seria não representativo e, pior, poderia ser lido como um veredito de segurança do sistema.

Numa arquitetura SPA + BaaS sem SSR, a superfície de ataque relevante é a **API do serviço gerenciado**, já coberta com profundidade pela suíte de RLS/*triggers* (M-06…M-13, trilha 2). O DAST fica como trabalho futuro, a executar contra a URL de produção quando houver *deploy*.

---

## Se algo falhar na hora

| Sintoma | Causa provável | Saída |
|---|---|---|
| `Pré-requisito ausente: docker` | Docker Desktop não está em execução | Abrir o Docker Desktop e aguardar; ou cair para a **trilha 0** |
| `Pré-requisito ausente: supabase` | `npx` não conseguiu baixar a CLI (sem rede, ou primeira execução) | Rodar `npm run db:status` uma vez com rede para popular o cache; senão, **trilha 0** |
| `npm ci` demora | Sem cache do npm | Rodar `npm ci` **antes** da apresentação |
| Portas 54321‑54324 ocupadas | Stack já de pé, ou outro projeto | `npm run db:status`; se for outro projeto, `npm run db:stop` nele |
| Números diferentes dos do artigo | Rodou na árvore atual | Confirmar que **não** foi usado `--aqui` |

A trilha 0 não tem modo de falhar: lê arquivos versionados e imprime na tela.

---

## Garantias do script de reprodução

[`reproduzir.mjs`](medicoes/scripts/reproduzir.mjs) respeita duas invariantes, ambas relevantes para rodar diante de uma banca:

1. **Não altera a árvore de trabalho.** Tudo acontece em `git worktree` temporário sob `.repro/`, removido ao final. Um `git status` depois da demo sai limpo.
2. **Não sobrescreve evidência versionada.** As saídas vão para um diretório de rodada novo e datado, conforme a regra 4 do [protocolo](medicoes/README.md).

A segunda invariante corrigiu um risco real: `tests/load/load-services.mjs` gravava num caminho fixo dentro de `evidencias/2026-07-16/`. Um `npm run load:run` durante a apresentação teria **sobrescrito a evidência que o artigo cita**.

---

## Material suplementar relacionado

| Documento | Conteúdo |
|---|---|
| [Apêndice A — Diagramas e dicionário de dados](apendice-a-diagramas.md) | UML, BPMN, DER e dicionário de dados |
| [Registro de medições](medicoes/registro-medicoes.md) | Tabela mestra: valor, ferramenta, versão, evidência, veredito |
| [Protocolo de medição](medicoes/README.md) | Regras de coleta e regra anti-fabricação |
| [Explicação das métricas](medicoes/explicacao-metricas.md) | Cada métrica em linguagem acessível |
| [Evidências brutas](medicoes/evidencias/) | Saídas originais das ferramentas, por data |

### Como citar

> VIEIRA, Pedro Conrado Fernandes; COSTA, Richardy Gabriel Rodrigues da. **Apêndice B — Reprodução das medições**: material suplementar. Franca: Uni-FACEF, 2026. Disponível em: https://github.com/Richardy-Rodrigues/hubservi/blob/tcc-v1/docs/tcc/apendice-b-reproducao.md. Acesso em: [data].
