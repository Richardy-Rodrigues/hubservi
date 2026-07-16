# 3 Metodologia

## 3.1 Classificação da pesquisa

A pesquisa é classificada segundo quatro dimensões usuais na metodologia científica: natureza, abordagem, objetivos e procedimentos técnicos.

| Dimensão | Classificação | Justificativa |
|----------|---------------|---------------|
| **Natureza** | Aplicada | Visa gerar conhecimento de aplicação prática — um procedimento de avaliação técnica — dirigido à solução de um problema concreto de validação arquitetural. |
| **Abordagem** | Mista (quantitativa e qualitativa) | Combina a coleta de métricas objetivas (cobertura, tempos de resposta, complexidade, vulnerabilidades) com a análise qualitativa de decisões arquiteturais via ATAM. |
| **Objetivos** | Exploratória e descritiva | Explora a aplicação de métodos de avaliação a um paradigma arquitetural pouco coberto pela literatura clássica (BaaS/Serverless) e descreve detalhadamente a arquitetura e os resultados da avaliação. |
| **Procedimentos** | Estudo de caso com experimento técnico | Investiga em profundidade um caso real (Hubservi) e conduz um experimento técnico controlado de coleta de métricas e execução de testes. |

## 3.2 Objeto de estudo

O objeto de estudo é a plataforma **Hubservi**, aplicação web de intermediação de serviços construída como SPA em React e TypeScript e apoiada pelo BaaS Supabase sobre PostgreSQL. A escolha justifica-se por ser um caso representativo do paradigma SPA + BaaS + Serverless, com regras de negócio expressivas residentes no banco (políticas de RLS, *triggers* e *views*), o que a torna adequada à investigação do problema de pesquisa. A arquitetura do objeto é detalhada na Seção 4.

## 3.3 Etapas metodológicas

A condução do trabalho organiza-se em seis etapas, alinhadas aos objetivos específicos (Seção 1.4.2):

1. **Levantamento de requisitos arquiteturais e atributos de qualidade.** Identificação dos *Architecturally Significant Requirements* (ASR) e seleção das características de qualidade da ISO/IEC 25010 (2011) relevantes ao domínio: segurança, eficiência de desempenho, manutenibilidade (com ênfase em testabilidade) e confiabilidade.

2. **Modelagem da arquitetura.** Recuperação e representação da arquitetura real a partir do código-fonte e das *migrations*, produzindo modelos UML (casos de uso, classes, sequência, componentes e implantação), modelo de processos de negócio (BPMN) e o modelo de dados (DER e dicionário de dados). Os artefatos encontram-se em `docs/tcc/diagramas/`.

3. **Documentação técnica.** Descrição dos componentes, fluxos, persistência e regras de negócio (Seção 4), assegurando rastreabilidade entre cada afirmação e sua fonte no repositório.

4. **Definição de cenários de avaliação.** Construção de uma árvore de utilidade ATAM e especificação de cenários de atributo de qualidade no formato de seis partes (Seção 6), além do mapeamento atributo → cenário → métrica → critério → ferramenta (Seção 5).

5. **Execução da avaliação técnica.** *(Etapa planejada — Seção 8.)* Execução de testes automatizados, análise estática de código, testes de segurança e testes de desempenho, conforme o plano de métricas.

6. **Análise dos resultados.** *(Etapa planejada — Seção 8.)* Interpretação das métricas coletadas à luz dos critérios definidos e dos *tradeoffs* identificados no ATAM, com discussão dos achados e recomendações.

## 3.4 Instrumentos e ferramentas

A coleta de dados apoia-se em um conjunto de ferramentas, organizado por atributo de qualidade e detalhado na Seção 5:

- **Testes automatizados:** Vitest e React Testing Library.
- **Análise estática:** ESLint e SonarQube.
- **Análise de dependências e modularização:** Madge e dependency-cruiser.
- **Desempenho:** Lighthouse, k6 e JMeter.
- **Segurança:** OWASP ZAP e Snyk.

## 3.5 Procedimentos de análise

As métricas quantitativas serão confrontadas com os critérios de aceitação previamente definidos (limiares e metas), e os achados qualitativos serão organizados segundo os conceitos do ATAM (riscos, pontos de sensibilidade e pontos de compromisso). A triangulação entre as evidências quantitativas e a análise arquitetural qualitativa sustenta a resposta à questão de pesquisa.

> **Observação sobre o estágio atual.** Em conformidade com o cronograma (Seção 8), este artigo reporta os produtos das etapas 1 a 4. As etapas 5 e 6 — que produzem os resultados quantitativos — estão planejadas e ainda não foram executadas; consequentemente, nenhum valor de métrica medido é apresentado, apenas o *baseline* já existente no repositório e as metas de avaliação (Seções 5 e 7).
