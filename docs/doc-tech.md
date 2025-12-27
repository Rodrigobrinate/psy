Esta Documentação Técnica define as diretrizes arquiteturais, o ecossistema de tecnologias e os padrões de desenvolvimento para o **Psy-Manager AI**. Como cientista da computação, este guia foca na escalabilidade, manutenção e, acima de tudo, na **segurança rigorosa** exigida por dados de saúde mental.

---

# Documentação Técnica: Arquitetura e Padrões de Desenvolvimento

## 1. Stack Tecnológica (The Stack)

| Camada | Tecnologia | Justificativa |
| --- | --- | --- |
| **Frontend** | **Next.js 15 (App Router)** | SSR para SEO (landing page) e SPA otimizado para o dashboard. |
| **Linguagem** | **TypeScript** | Tipagem estática para evitar erros em tempo de execução em dados sensíveis. |
| **Estilização** | **Tailwind CSS** | Agilidade no desenvolvimento de interfaces responsivas e customizáveis. |
| **Backend** | **Node.js + Express** | Alta performance para I/O assíncrono (streaming de áudio/transcrição). |
| **ORM** | **Prisma** | Type-safety no acesso ao banco de dados e migrações declarativas. |
| **Banco de Dados** | **PostgreSQL** | Robustez para relações complexas e suporte nativo a JSONB para testes. |
| **IA / Voz** | **AssemblyAI** | API especializada em transcrição com suporte a múltiplos oradores. |
| **Validação** | **Zod** | Esquemas de validação compartilhados entre front e back (Single Source of Truth). |

---

## 2. Padrões de Arquitetura (Patterns)

Adotaremos uma **Arquitetura em Camadas (Layered Architecture)** para garantir a separação de preocupações (SoC):

### 2.1. Estrutura do Backend

1. **Routes:** Apenas define os endpoints e chama o controller.
2. **Controllers:** Valida a entrada (via Zod) e orquestra a resposta HTTP. Não contém lógica de negócio.
3. **Services:** Onde reside a **Regra de Negócio**. Ex: Cálculo de scores de testes, chamadas à API da AssemblyAI.
4. **Repositories/Prisma:** Interface direta com o banco de dados.

### 2.2. Design Patterns Aplicados

* **Singleton:** Garantir uma única instância do `PrismaClient` para evitar esgotamento de conexões.
* **Strategy Pattern:** Para o cálculo de testes psicológicos. Cada teste (PHQ-9, GAD-7) terá sua própria classe de estratégia de cálculo, facilitando a adição de novos testes sem alterar o código core.
* **Middleware Pattern:** Para autenticação JWT, logs de auditoria e verificação de plano (Pro vs Basic).

---

## 3. Boas Práticas de Programação

### 3.1. Princípios SOLID

* **S (Single Responsibility):** Cada Service deve cuidar de apenas uma entidade (ex: `PatientService`, `AppointmentService`).
* **O (Open/Closed):** O sistema de testes deve ser aberto para extensão (novos testes) mas fechado para modificação.

### 3.2. Clean Code e Documentação

* **Nomenclatura Semântica:** Variáveis e funções devem descrever sua intenção (ex: `calculateTestResult` em vez de `calc`).
* **Tratamento de Erros Global:** Uso de um `ErrorMiddleware` para capturar exceções e retornar mensagens padronizadas (evitando vazamento de stack traces em produção).
* **Self-Documenting Code:** Priorizar código legível a comentários óbvios. Documentar apenas o "porquê" de decisões complexas.

---

## 4. Segurança e Compliance (Foco em Dados Sensíveis)

Dado que o sistema lida com prontuários psicológicos, a segurança não é opcional:

1. **Criptografia em Repouso:** Dados sensíveis (anotações de sessões) devem ser armazenados de forma segura. Considere o uso de `pgcrypto` no Postgres para campos de texto.
2. **LGPD & Ética:** * **Anonimização:** Em logs de erro, nunca salvar nomes de pacientes ou IDs.
* **Data Deletion:** Implementar o "Direito ao Esquecimento" (Soft delete vs Hard delete).


3. **JWT com Refresh Tokens:** Sessões curtas para o Access Token e armazenamento seguro do Refresh Token em `HttpOnly Cookies`.
4. **Rate Limiting:** Proteção contra brute-force e ataques de negação de serviço (DoS) na API.

---

## 5. Fluxo de Processamento de IA (Pipeline)

Para a funcionalidade do "Assistente em Tempo Real", seguiremos este fluxo:

1. **Frontend:** Captura pequenos chunks de áudio (Blob) a cada 60s.
2. **Backend:** Envia o arquivo para a **AssemblyAI**.
3. **Webhook/Polling:** Ao receber a transcrição, o sistema busca no banco o **Resumo do Paciente**.
4. **LLM Agent:** Um prompt estruturado envia: `[Contexto do Paciente] + [Transcrição Recente]`.
5. **Output:** Retorna 3 sugestões de perguntas para o psicólogo via **WebSocket (Socket.io)** para garantir latência mínima.

---

## Próximo Passo Sugerido

Como você está usando **Prisma**, o sucesso dessa arquitetura depende de um banco bem modelado.

**Gostaria que eu gerasse agora o arquivo `schema.prisma` completo, já contemplando as relações entre Psicólogo, Paciente, Sessões (com áudio/transcrição) e o histórico de Testes?**