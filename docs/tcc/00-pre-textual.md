# Elementos pré-textuais

## Título

**Avaliação Técnica de uma Arquitetura Web baseada em BaaS/Serverless para Intermediação de Serviços**

**Subtítulo:** um estudo de caso da plataforma Hubservi

---

## Resumo

Arquiteturas web fundamentadas em *Backend as a Service* (BaaS) e em computação *serverless* têm sido amplamente adotadas no desenvolvimento de aplicações, por reduzirem o esforço de implementação e operação da infraestrutura de *backend*. Entretanto, equipes de desenvolvimento enfrentam dificuldade em validar tecnicamente se essas arquiteturas atendem aos atributos de qualidade esperados, como segurança, desempenho, testabilidade e manutenibilidade. Este trabalho tem como objetivo avaliar tecnicamente a arquitetura de software da plataforma Hubservi — uma aplicação web de intermediação de serviços construída como *Single Page Application* (SPA) em React e TypeScript, apoiada pelo BaaS Supabase sobre PostgreSQL —, utilizando métricas e testes de Engenharia de Software relacionados a segurança, desempenho, testabilidade, manutenibilidade e confiabilidade, à luz da norma ISO/IEC 25010. A pesquisa caracteriza-se como aplicada, de abordagem mista, com objetivos exploratórios e descritivos, conduzida por meio de estudo de caso combinado a experimento técnico. Como contribuição, propõe-se um procedimento de avaliação arquitetural que articula a norma ISO/IEC 25010, o método ATAM (*Architecture Tradeoff Analysis Method*) e um conjunto de ferramentas de teste automatizado, análise estática, desempenho e segurança. O procedimento foi executado sobre ambiente reprodutível e emitiu vereditos por atributo e por camada: três defeitos reais de autorização e de integridade foram detectados, corrigidos e re-medidos; a confiabilidade atende aos critérios definidos; o *backend* atende ao critério de desempenho, com latência de cauda (p97,5) de 253 ms e 0% de erro sob carga, ao passo que o carregamento inicial do *frontend* não o atinge, com LCP de 3,17 s após otimização, contra a meta de 2,5 s; e a manutenibilidade apresenta estrutura sólida, sem dependências circulares, com higiene de código abaixo do ideal. A capacidade de localizar deficiências específicas — e não de atestar qualidade uniforme — evidencia o valor do procedimento proposto.

**Palavras-chave:** Arquitetura de software. Avaliação arquitetural. ISO/IEC 25010. Backend as a Service. Serverless.

---

## Abstract

Web architectures based on *Backend as a Service* (BaaS) and *serverless* computing have been widely adopted in application development, as they reduce the effort of implementing and operating backend infrastructure. However, development teams struggle to technically validate whether such architectures meet the expected quality attributes, such as security, performance, testability, and maintainability. This work aims to technically evaluate the software architecture of the Hubservi platform — a web application for service intermediation built as a *Single Page Application* (SPA) using React and TypeScript, supported by the Supabase BaaS over PostgreSQL —, using Software Engineering metrics and tests related to security, performance, testability, maintainability, and reliability, in light of the ISO/IEC 25010 standard. The research is characterized as applied, with a mixed approach and exploratory and descriptive objectives, conducted through a case study combined with a technical experiment. As a contribution, it proposes an architectural evaluation procedure that articulates the ISO/IEC 25010 standard, the ATAM (*Architecture Tradeoff Analysis Method*), and a set of tools for automated testing, static analysis, performance, and security. This article presents the consolidated partial results — the problem definition, the modeling of the actual architecture, and the experimental planning —, while the execution of measurements and the analysis of results constitute subsequent stages of the schedule.

**Keywords:** Software architecture. Architectural evaluation. ISO/IEC 25010. Backend as a Service. Serverless.
