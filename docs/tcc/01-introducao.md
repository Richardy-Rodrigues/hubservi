# 1 Introdução

## 1.1 Contexto

A intermediação de serviços — atividade que conecta pessoas que demandam um serviço a profissionais capazes de executá-lo — tem migrado progressivamente para plataformas digitais. Aplicações web nesse domínio precisam suportar cadastro e descoberta de serviços, solicitação e gerenciamento de atendimentos e avaliação reputacional, com requisitos não triviais de segurança, desempenho e confiabilidade, uma vez que manipulam dados pessoais e transações entre partes que, em geral, não se conhecem previamente.

Em paralelo, o modelo de desenvolvimento de aplicações web tem sido reconfigurado pela popularização de arquiteturas baseadas em *Backend as a Service* (BaaS) e em computação *serverless*. Nesses modelos, responsabilidades tradicionalmente implementadas em servidores próprios — autenticação, persistência, autorização e regras de acesso — são delegadas a serviços gerenciados por terceiros, acessados diretamente pelo cliente por meio de APIs e bibliotecas. Plataformas como o Supabase materializam esse paradigma ao expor, sobre um banco PostgreSQL, autenticação integrada e autorização declarativa via *Row Level Security* (RLS), eliminando boa parte da camada de servidor de aplicação convencional.

A plataforma Hubservi, objeto deste estudo, é uma aplicação web de intermediação de serviços construída como *Single Page Application* (SPA) em React e TypeScript, apoiada pelo Supabase. Trata-se, portanto, de um caso representativo da arquitetura **SPA + BaaS + Serverless**, na qual a lógica de negócio se distribui entre o cliente (validações, fluxos de interface e orquestração de chamadas) e o banco de dados (regras declarativas de autorização, *triggers* e *views*).

## 1.2 Problema de pesquisa

A adoção de arquiteturas BaaS/Serverless reduz o esforço de implementação e operação de infraestrutura, mas desloca atributos de qualidade críticos — em especial a segurança e a confiabilidade — para configurações declarativas (políticas de RLS, *triggers*, restrições de integridade) e para a fronteira cliente–serviço gerenciado. Esse deslocamento dificulta a verificação de que a arquitetura efetivamente atende aos atributos de qualidade esperados: a ausência de uma camada de servidor de aplicação própria altera o que deve ser testado, onde residem os pontos de falha e como o desempenho e a manutenibilidade devem ser medidos.

Formaliza-se, assim, o problema de pesquisa:

> Equipes de desenvolvimento de aplicações web têm dificuldade em validar tecnicamente se uma arquitetura baseada em *Backend as a Service* (BaaS) e *Serverless* atende aos atributos de qualidade esperados, como segurança, desempenho, testabilidade e manutenibilidade.

## 1.3 Questão de pesquisa

Decorre do problema a seguinte questão de pesquisa:

> Como avaliar tecnicamente uma arquitetura web baseada em BaaS/Serverless por meio de métricas e testes de Engenharia de Software, considerando atributos de qualidade em uma plataforma de intermediação de serviços?

## 1.4 Objetivos

### 1.4.1 Objetivo geral

Avaliar tecnicamente a arquitetura de software da plataforma Hubservi, baseada em React, TypeScript, Supabase e PostgreSQL, utilizando métricas e testes relacionados à segurança, ao desempenho, à testabilidade e à manutenibilidade.

### 1.4.2 Objetivos específicos

1. Identificar os requisitos arquiteturais e os atributos de qualidade relevantes para a plataforma.
2. Modelar a arquitetura da plataforma.
3. Documentar os componentes, fluxos, persistência e regras de negócio.
4. Definir cenários de avaliação arquitetural.
5. Executar testes automatizados.
6. Executar análise estática de código.
7. Executar testes de segurança.
8. Executar testes de desempenho.
9. Analisar os resultados obtidos.

> **Nota de escopo deste artigo.** Os objetivos específicos 1 a 4 (delimitação, modelagem, documentação e definição de cenários) e os objetivos 5 a 9 (execução de testes automatizados, análise estática, testes de segurança e de desempenho, e análise) foram executados; os resultados são reportados na Seção 7 e derivam do registro reprodutível em `docs/tcc/medicoes/`.

## 1.5 Delimitação do escopo

**Objeto de pesquisa e instrumento.** O objeto deste trabalho é a **avaliação técnica** de uma arquitetura web baseada em BaaS/Serverless; a plataforma Hubservi é o **instrumento** por meio do qual essa avaliação se torna possível. A distinção é necessária porque o trabalho envolve dois produtos de naturezas distintas: um sistema de software, desenvolvido integralmente pela equipe, e um procedimento de avaliação, aplicado sobre esse sistema. Apenas o segundo constitui a contribuição científica pretendida. Conforme exposto na Seção 1.6, a lacuna identificada é de ordem metodológica — não é evidente *como* aplicar métricas e testes de Engenharia de Software para validar atributos de qualidade em um arranjo no qual autorização e integridade migram para o banco de dados. O que se oferece como contribuição, portanto, é um roteiro de avaliação reprodutível e transferível a outras aplicações que adotem o mesmo paradigma, e não a plataforma em si.

**Justificativa do desenvolvimento do sistema.** A construção do Hubservi não constitui objetivo do trabalho, mas **pré-requisito metodológico** dele. Avaliar políticas de RLS, *triggers*, restrições de integridade e a fronteira entre cliente e serviço gerenciado exige acesso irrestrito ao código-fonte, ao esquema do banco de dados, às configurações de autorização e ao ambiente de execução — condições inviáveis de obter sobre uma plataforma de terceiros, cujo código e cuja base de dados não são acessíveis ao pesquisador. O desenvolvimento próprio é o que assegura a validade interna do experimento: permite controlar as variáveis do ambiente, reproduzir as medições sobre um estado conhecido e conduzir o ciclo de detecção e correção de defeitos sem restrições de acesso. Os quatro fluxos críticos implementados — autenticação, cadastro e busca de serviços, contratação (*booking*) e avaliação (*review*), descritos na Seção 4 — constituem a superfície sobre a qual os cenários de avaliação da Seção 5 são exercitados.

**Delimitação negativa.** Não integram o escopo deste trabalho: (i) a avaliação de **usabilidade e acessibilidade**, por estarem fora das quatro características da ISO/IEC 25010 (2011) selecionadas como relevantes para o problema de pesquisa — segurança, eficiência de desempenho, manutenibilidade e confiabilidade —, ainda que constem como requisitos não funcionais do produto; (ii) o **módulo de recomendação**, que permanece secundário e limitado à ordenação de resultados por popularidade e avaliação média, não sendo objeto de avaliação; (iii) arquiteturas de **microsserviços**, uma vez que o sistema avaliado adota o modelo SPA + BaaS + Serverless, sem camada de servidor de aplicação própria; e (iv) testes **fim a fim conduzidos por ferramenta dedicada de automação de navegador**, dado que, em uma arquitetura BaaS, a superfície de integração relevante é a própria API do serviço gerenciado — os fluxos ponta a ponta são, por essa razão, verificados por testes de integração executados contra a API, conforme a Seção 5.

## 1.6 Justificativa

A literatura de arquitetura de software dispõe de métodos consolidados de avaliação — notadamente o ATAM (*Architecture Tradeoff Analysis Method*), de Clements, Kazman e Klein (2002) — e de modelos de qualidade reconhecidos, como o estabelecido pela norma ISO/IEC 25010 (2011). Tais referenciais, contudo, foram concebidos predominantemente sob o pressuposto de arquiteturas com camada de servidor de aplicação explícita. A crescente adoção de arquiteturas BaaS/Serverless, nas quais responsabilidades de autorização e integridade migram para o banco de dados e para serviços gerenciados, cria uma lacuna prática: não é evidente *como* aplicar métricas e testes de Engenharia de Software para validar tecnicamente esses atributos de qualidade nesse novo arranjo.

Justifica-se, portanto, conduzir um estudo de caso que (i) modele e documente rigorosamente uma arquitetura BaaS/Serverless real, (ii) defina cenários e métricas de avaliação alinhados aos atributos de qualidade da ISO/IEC 25010, e (iii) organize um procedimento reprodutível de avaliação. A contribuição é tanto prática — para a equipe da plataforma Hubservi — quanto metodológica, ao oferecer um roteiro de avaliação técnica transferível a outras aplicações que adotem o mesmo paradigma.

## 1.7 Organização do artigo

O restante do artigo está organizado da seguinte forma. A Seção 2 apresenta o referencial teórico sobre arquitetura de software, avaliação arquitetural, qualidade de software e arquiteturas BaaS/Serverless. A Seção 3 descreve a metodologia adotada. A Seção 4 documenta a arquitetura da plataforma Hubservi. A Seção 5 detalha o planejamento experimental e o plano de métricas. A Seção 6 apresenta o plano de avaliação arquitetural com base no ATAM. A Seção 7 consolida os resultados parciais. A Seção 8 expõe o cronograma. Por fim, são listadas as referências.
