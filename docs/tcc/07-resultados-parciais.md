# 7 Resultados parciais

Esta seção consolida os resultados já alcançados, correspondentes aos objetivos específicos 1 a 4. Em conformidade com a regra metodológica adotada (Seção 3.5), **não são apresentados resultados quantitativos de avaliação**, pois as medições (objetivos 5 a 9) estão planejadas para etapa posterior (Seção 8). Reporta-se apenas o que está efetivamente consolidado e o *baseline* já presente no repositório.

## 7.1 Definição e delimitação do estudo

- **Foco redefinido:** o trabalho foi reorientado da temática de recomendação para a **avaliação técnica da arquitetura de software**, mantendo o Hubservi como objeto de estudo. A recomendação permanece como módulo secundário (ordenação por popularidade/avaliação).
- **Modelo arquitetural consolidado:** **SPA + BaaS + Serverless**, corrigindo incoerência documental anterior que mencionava microsserviços (inexistentes no sistema real).
- **Atributos de qualidade selecionados** (ISO/IEC 25010): segurança, eficiência de desempenho, manutenibilidade (com ênfase em testabilidade) e confiabilidade.
- **Metodologia definida:** pesquisa aplicada, abordagem mista, objetivos exploratório-descritivos, estudo de caso com experimento técnico.

## 7.2 Modelagem e documentação da arquitetura (produtos)

Foram produzidos e estão disponíveis em `docs/tcc/`:

- Descrição técnica completa da arquitetura, componentes, fluxos, persistência e regras de negócio (Seção 4);
- Modelos UML — casos de uso, classes, sequência (autenticação, contratação e avaliação), componentes e implantação;
- Modelo de processos de negócio (BPMN) para contratação e gerenciamento de booking;
- Modelo de dados — DER e dicionário de dados, fiéis ao esquema real das *migrations*.

Esses artefatos atendem aos objetivos específicos 2 e 3 e fundamentam a árvore de utilidade e os cenários do ATAM (Seção 6).

## 7.3 Baseline técnico existente no repositório

A inspeção do repositório evidenciou o seguinte estado atual (qualitativo, sem medições):

| Item | Situação atual | Fonte |
|------|----------------|-------|
| Testes automatizados | Vitest e React Testing Library **configurados**; presença de arquivos de teste para componentes e fluxos selecionados | `vitest.config.ts`, `src/**/__tests__/`, `src/test/` |
| Análise estática (lint) | ESLint 9 (*flat config*) **configurado** | `eslint.config.js` |
| Regras de negócio no banco | RLS habilitado em todas as tabelas; *triggers* e restrições implementados | `supabase/migrations/*` |
| Cobertura de testes (%) | **Não medida** — meta a definir e coletar na execução | — |
| SonarQube, Madge, dependency-cruiser | **Não configurados** | — |
| Lighthouse, k6, JMeter | **Não configurados** | — |
| OWASP ZAP, Snyk | **Não configurados** | — |

> Observa-se que existe um *baseline* de testes e *lint*, mas **as métricas de qualidade ainda não foram coletadas**, e as ferramentas de análise estática avançada, desempenho e segurança ainda **não estão configuradas**. Esses são, precisamente, os trabalhos da fase de execução.

## 7.4 Síntese dos resultados parciais

Até o presente estágio, o trabalho consolidou a delimitação do problema, a seleção dos atributos de qualidade, a modelagem e documentação fiel da arquitetura real e o planejamento experimental e arquitetural (métricas e ATAM). Esses produtos constituem a base sobre a qual a fase de execução coletará as evidências quantitativas e qualitativas necessárias para responder à questão de pesquisa. Nenhuma conclusão sobre o atendimento dos atributos de qualidade é emitida neste estágio, justamente por depender das medições ainda não realizadas.
