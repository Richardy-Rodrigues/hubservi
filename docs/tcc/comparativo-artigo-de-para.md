# Comparativo DE→PARA — artigo enviado ao professor vs. versão atualizada

| | |
|---|---|
| **DE** | `docs/Artigo_PedroConrado_RichardyRodrigues.docx` — enviado ao professor; snapshot do conteúdo em ~18/06/2026 |
| **PARA** | `docs/Artigo_PedroConrado_RichardyRodrigues_ATUALIZADO.docx` — gerado por `docs/tcc/gerar-artigo-docx.py` em 11/08/2026 |
| **Fonte do conteúdo** | `docs/tcc/TCC-Hubservi.md` |
| **Fonte dos números** | `docs/tcc/medicoes/registro-medicoes.md` (M-01…M-26, F-01…F-03), com evidências em `docs/tcc/medicoes/evidencias/` |

O DE foi produzido antes da execução das medições. O PARA mantém integralmente a apresentação do DE — página, tipografia, capa e os 13 diagramas renderizados — e substitui o conteúdo pelo estado atual do trabalho.

---

## 1. Conteúdo desatualizado corrigido

| Local | DE | PARA |
|---|---|---|
| Resumo / Abstract | Encerra em "a execução das medições e a análise dos resultados constituem **etapas subsequentes do cronograma**" | Encerra reportando a execução, com os achados-chave (3 defeitos corrigidos; p95 de 253 ms; LCP de 3,17 s) |
| §1.7 | (seção inexistente) | "A Seção 7 consolida os resultados das medições executadas" |
| §3.4 Instrumentos | Lista SonarQube, k6, JMeter, OWASP ZAP e Snyk como as ferramentas | Lista as ferramentas efetivamente usadas e registra cada substituição: `eslint-plugin-sonarjs` + `jscpd` ← SonarQube; autocannon ← k6/JMeter; `npm audit` ← Snyk; ZAP explicitamente pendente |
| §3.5 | "As métricas **serão** confrontadas…" + "Observação sobre o estágio atual: as etapas 5 e 6 produzem os resultados quantitativos" | Pretérito + o ciclo **medir → detectar → corrigir → re-medir** e a regra de registro anti-fabricação |
| §4.7 RLS | Tabela e texto descrevem `profiles` com "leitura de perfis de terceiros restrita a autenticados" — que é o estado **vulnerável** | Descreve a política pós-correção (leitura restrita ao próprio registro; contraparte via `public_profiles`), com nota remetendo a §7.3.2 |
| §4.6 | 8 regras de negócio | 9 regras — acrescida a validação de `review.provider_id` por *trigger*, criada durante a avaliação |
| §5 (abertura) | "nenhum valor apresentado nesta seção corresponde a medição já realizada" | Mantém o caráter de planejamento, mas em pretérito: critérios fixados **antes** da coleta, valores medidos na Seção 7 |
| §5.2.1–5.2.2 | Coluna Ferramenta com Snyk, k6, JMeter | Ferramentas reais; limiar de p95 deixa de ser "a definir" e passa a 800 ms, com a justificativa da calibração (execução exploratória de p95 ≈ 57 ms + heurística de 1 s) |
| §5.2.3 | "Meta de cobertura a definir (ex.: ≥ 70%)" | Limiar efetivamente adotado: piso global de 30% e ≥ 75% nos módulos críticos |
| §5.3 | Tabela "papel e instalação": SonarQube, k6/JMeter, ZAP e Snyk como "Não / A configurar" | Tabela "papel e disponibilidade": 11 linhas com ferramenta usada, prevista e situação; ZAP como única pendência |
| §5.4 | "Importante (regra anti-fabricação): os resultados **serão** obtidos em agosto de 2026" | Nota removida; registra as mitigações aplicadas (mediana de 3 execuções, fixação de parâmetros, evidências arquivadas) |
| §6 título | "Plano de avaliação arquitetural (ATAM)" | "Avaliação Arquitetural com ATAM" — deixou de ser plano |
| §6.4 | "análise **preliminar** e qualitativa; **será** confirmada na execução" | Análise confirmada pelas medições; o risco de LCP passa a trazer o valor medido |
| §7 título | "7 RESULTADOS PARCIAIS" | "7 RESULTADOS" |
| §7 abertura | "não são apresentados resultados quantitativos, pois as medições estão planejadas para etapa posterior" | "os objetivos 5 a 9 foram **executados**, antecipando o cronograma" |
| §7.3 | "Baseline técnico existente no repositório" — tabela qualitativa: "Cobertura: **não medida**", "SonarQube, Madge, dependency-cruiser: **não configurados**", "Lighthouse, k6, JMeter: **não configurados**", "OWASP ZAP, Snyk: **não configurados**" | "Resultados das medições" — seis subseções (7.3.1 a 7.3.6) com os valores medidos |
| §7.4 | "Síntese dos resultados parciais": o que foi consolidado até então | "Síntese dos resultados": tabela de veredito por atributo e por camada |
| §8 | Julho e Agosto como "Planejado"; nota "Marco crítico: a coleta ocorre em agosto de 2026; até lá, sem números de avaliação medidos" | Junho e Julho "Concluído", Agosto "Em andamento"; nota registra a antecipação para julho e a pendência do DAST |

## 2. Seções acrescentadas

| Seção | Por que importa |
|---|---|
| **§1.5 Delimitação do escopo** | Distingue **objeto** (a avaliação) de **instrumento** (o Hubservi) e justifica por que o sistema teve de ser desenvolvido pela equipe. É a premissa nº 1 registrada em `docs/tcc/README.md` para a banca, e sua ausência é a crítica mais provável ao DE. Inclui também a delimitação negativa (usabilidade, recomendação, microsserviços e testes de navegador fora do escopo) |
| **§3.2.1 Construção do instrumento** | TAP, Canvas, SWOT, EAP, 5W2H, requisitos RF-xx/RNF-xx e marcos M1–M5 — liga a construção do sistema à validade interna do experimento |
| **§1.7 Organização do artigo** | Mapa de leitura exigido pelo gênero |
| **§7.3.1 Achado transversal de reprodutibilidade** | As *migrations* versionadas não reconstruíam um sistema funcional (faltavam os *grants* a `anon`/`authenticated`/`service_role`). Achado característico do paradigma BaaS |
| **§9 Conclusão** | Inexistente no DE. Retoma a questão de pesquisa, os três defeitos, o veredito por camada, as limitações (DAST pendente, avaliação pela própria equipe, caso único) e os trabalhos futuros |

## 3. Resultados que passam a constar com valor medido

Nenhum destes números existia no DE.

| Atributo | Medição | Valor | ID |
|---|---|---|---|
| Segurança | Defeitos reais detectados, corrigidos e re-medidos | 2 de autorização + 1 de reprodutibilidade | F-01, F-02, F-03 |
| Segurança | Acessos indevidos após correção | 0, em 30 testes de integração / 9 arquivos | M-06…M-13 |
| Segurança | SCA (`npm audit`) | 12 altas, 8 moderadas, 0 críticas; 1 única de produção (`react-router-dom`) | M-25 |
| Segurança | `supabase db lint` | 0 erros | M-26 |
| Confiabilidade | Transições inválidas aceitas / órfãos em cascata | 0 / 0; fluxo crítico 100% no caso válido | M-05…M-13 |
| Testabilidade | Suíte | 11 → 44 testes unitários/componente + 30 de integração | M-01b |
| Testabilidade | Cobertura de linhas | 18,0% → 32,0%; módulos críticos 82–100% | M-01, M-01b |
| Desempenho | Latência p95 sob carga (30 conexões / 20 s) | 253 ms, critério ≤ 800 ms — **atende** | M-18 |
| Desempenho | Taxa de erro / vazão | 0% em 44.413 requisições; ≈ 2.221 req/s | M-19, M-20 |
| Desempenho | Lighthouse *score* | 85 → 88, meta ≥ 90 — **não atende** | M-14 |
| Desempenho | LCP | 3,49 s → 3,17 s, meta ≤ 2,5 s — **não atende** | M-15 |
| Desempenho | *Bundle* inicial após *code-splitting* | 679 KB → 489 KB (−28%) | M-14/M-15 |
| Desempenho | TBT / CLS | 11 ms → 0 ms / 0,000 | M-16, M-17 |
| Manutenibilidade | Dependências circulares | 0, confirmado por Madge (85 arquivos) e dependency-cruiser (93 módulos) | M-03, M-23 |
| Manutenibilidade | Violações de *lint* | 19 na configuração atual; 25 na recomendada | M-02, M-21 |
| Manutenibilidade | Duplicação em TSX | 4,55%, meta ≤ 3%; causa: 61 linhas quase idênticas entre os dois painéis | M-22 |

## 4. Correções de formatação

| Aspecto | DE | PARA |
|---|---|---|
| Numeração das seções 1 e 2 | Estilo `List Paragraph` com numeração automática e caixa mista ("Introdução", "Referencial Teórico"), enquanto 3 a 8 eram `Heading 1` em caixa alta literal | Todas as seções primárias em caixa alta literal, com o mesmo estilo |
| Corpo dos títulos | `Heading 1` em 16 pt e `Heading 2` em 14 pt (padrão do Pandoc) | 12 pt em negrito em todos os níveis, conforme NBR 6024 |
| Tabelas | Sem legenda e sem indicação de fonte | 22 tabelas com "Tabela N — …" e linha "Fonte:"; fios só horizontais (padrão IBGE) e cabeçalho repetido nas quebras de página |
| Figuras | Sem legenda e sem indicação de fonte | 13 figuras com "Figura N — …" e linha "Fonte:", referenciadas nominalmente no texto |
| Apêndice A | 9 blocos "Notas" repetidos como `Heading 2`, no mesmo nível de "4.1" | Notas incorporadas ao texto; dicionário de dados sob "A.1" |
| Referências | 11 entradas, incluindo Fowler, ISO/IEC 25023, Supabase e PostgreSQL, que **não são citados no corpo** (vieram da lista "complementares sugeridas — opcional") | 7 entradas, todas com citação correspondente no texto |
| Gantt (§8) | Ausente | Permanece ausente por decisão: a Tabela 15 já apresenta o cronograma mês a mês com a situação de cada etapa |

## 5. Preservado do arquivo enviado ao professor

Verificado programaticamente contra o DE — igualdade estrita:

- **Página**: A4 (21,0 × 29,7 cm), margens 3 cm esquerda/superior e 2 cm direita/inferior
- **Tipografia**: `Normal` em Times New Roman 12 pt, justificado, entrelinha simples, 6 pt depois
- **Capa**: título em caixa alta terminando em dois-pontos, subtítulo em caixa alta, autoria e orientação alinhados à direita com prefixo "Email:"
- **Autoria**: Pedro Conrado Fernandes Vieira e Richardy Gabriel Rodrigues da Costa, Graduandos em Engenharia de Software – Uni-FACEF; orientação do Prof. Daniel Facciolo Pires
- **Diagramas**: as 13 imagens são os mesmos arquivos do DE, na mesma ordem e com as mesmas dimensões (conferido por *hash* do conteúdo binário)

## 6. Pendências

1. **DAST / OWASP ZAP** — única medição do plano não executada; depende da publicação da URL de produção. Está declarada como pendente em §5.2.1, §5.3, §7.3.2 e §9.
2. **CVE de produção** — `react-router-dom` (XSS via *open redirect*), com correção disponível; reportado em §7.3.2 e na síntese de §7.4.

## Reprodução

```bash
python docs/tcc/gerar-artigo-docx.py
```

O script lê `docs/Artigo_PedroConrado_RichardyRodrigues.docx` apenas para herdar o layout e extrair as imagens; o arquivo de origem não é alterado.
