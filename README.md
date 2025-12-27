# Psy-Manager AI

Sistema completo de gestão de consultório psicológico com IA integrada.

## Visão Geral

O **Psy-Manager AI** é uma plataforma moderna e segura que permite psicólogos gerenciarem seus consultórios de forma eficiente, com recursos de:

- Gerenciamento de pacientes e prontuários
- Agendamento de sessões
- Aplicação e análise de testes psicológicos (PHQ-9, GAD-7, etc.)
- IA integrada para sugestões em tempo real (Plano Pro)
- Transcrição de áudio das sessões
- Conformidade com LGPD

## Arquitetura

O projeto segue uma arquitetura **monorepo** com:

```
psy/
├── backend/          # API REST (Node.js + Express + Prisma)
├── frontend/         # Interface Web (Next.js 15 + React 19)
└── docs/            # Documentação técnica
```

### Backend

- **Stack**: Node.js, Express, TypeScript, Prisma, PostgreSQL
- **Arquitetura**: Camadas (Routes → Controllers → Services → Repositories)
- **Padrões**: SOLID, Strategy Pattern, Singleton
- **Segurança**: JWT, bcrypt, Rate Limiting, CORS
- **Porta**: 3004

[📖 Ver documentação completa do backend](./backend/README.md)

### Frontend

- **Stack**: Next.js 15, React 19, TypeScript, Tailwind CSS 4
- **Features**: App Router, Server Components, Client Components
- **Autenticação**: Context API + JWT
- **Porta**: 3000

[📖 Ver documentação completa do frontend](./frontend/README.md)

## Requisitos

- **Node.js**: 18+
- **PostgreSQL**: 14+
- **npm**: 9+

## Setup Rápido

### 1. Clonar o repositório

```bash
git clone <repository-url>
cd psy
```

### 2. Setup do Backend

```bash
cd backend

# Instalar dependências
npm install

# Configurar .env (DATABASE_URL, JWT_SECRET, etc)
cp .env.example .env

# Criar banco de dados
createdb psymanager

# Rodar migrations
npx prisma migrate dev --name init

# Popular com testes psicológicos
npm run db:seed

# Iniciar servidor
npm run dev
```

Backend rodando em: `http://localhost:3004`

### 3. Setup do Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Configurar .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:3004/api" > .env.local

# Iniciar servidor
npm run dev
```

Frontend rodando em: `http://localhost:3000`

## Funcionalidades Implementadas

### Backend ✅

- [x] Autenticação JWT com refresh tokens
- [x] CRUD completo de pacientes
- [x] Soft delete e hard delete (LGPD)
- [x] Sistema de testes psicológicos com Strategy Pattern
- [x] Aplicação e correção automática de testes
- [x] Rate limiting e segurança
- [x] Validação com Zod
- [x] Seed com PHQ-9 e GAD-7

### Frontend ✅

- [x] Landing page responsiva
- [x] Sistema de autenticação (login/registro)
- [x] Dashboard com sidebar
- [x] Protected routes
- [x] Componentes UI reutilizáveis
- [x] Integração com API via HTTP client
- [x] Context de autenticação

## Estrutura do Banco de Dados

```
psychologists (psicólogos)
  ↓
patients (pacientes)
  ↓
├── appointments (sessões)
└── patient_test_results (resultados de testes)
      ↓
    test_responses (respostas individuais)
```

## Testes Psicológicos Disponíveis

| Código | Nome | Categoria | Questões |
|--------|------|-----------|----------|
| PHQ9 | Patient Health Questionnaire-9 | Depressão | 9 |
| GAD7 | Generalized Anxiety Disorder-7 | Ansiedade | 7 |

## Fluxo de Uso

1. **Cadastro**: Psicólogo cria conta com CRP
2. **Login**: Acessa o dashboard
3. **Adicionar Pacientes**: Cadastra pacientes
4. **Aplicar Testes**: Envia PHQ-9 ou GAD-7
5. **Acompanhar Evolução**: Visualiza gráficos de progresso
6. **Gerenciar Sessões**: Agendar e documentar consultas

## Segurança e Conformidade

- ✅ Criptografia de senhas com bcrypt
- ✅ Tokens JWT com expiração
- ✅ Rate limiting contra brute-force
- ✅ CORS configurável
- ✅ Validação de entrada (Zod)
- ✅ Soft delete para LGPD
- ✅ Logs sem informações sensíveis

## Desenvolvimento

### Estrutura de Branches (Sugestão)

- `main` - Produção
- `develop` - Desenvolvimento
- `feature/*` - Novas funcionalidades
- `fix/*` - Correções

### Padrões de Commit

```
feat: adiciona módulo de agenda
fix: corrige cálculo do PHQ-9
docs: atualiza README
refactor: melhora estrutura de services
```

## Próximos Passos

### Backend
- [ ] Upload de áudio (AssemblyAI)
- [ ] Integração com LLM (OpenAI/Anthropic)
- [ ] WebSocket para IA em tempo real
- [ ] Mais testes psicológicos (ASRS-18, PCL-5, BDI-II)
- [ ] Sistema de agendamento

### Frontend
- [ ] CRUD completo de pacientes (UI)
- [ ] Aplicação de testes (UI)
- [ ] Gráficos de evolução (Chart.js)
- [ ] Agenda com calendário
- [ ] Upload de áudio
- [ ] PWA

## Deploy

### Backend (Sugestão: Railway, Render, Fly.io)

```bash
cd backend
npm run build
npm start
```

### Frontend (Sugestão: Vercel, Netlify)

```bash
cd frontend
npm run build
npm start
```

## Tecnologias

### Backend
- Node.js
- Express
- TypeScript
- Prisma
- PostgreSQL
- Zod
- JWT
- bcrypt

### Frontend
- Next.js 15
- React 19
- TypeScript
- Tailwind CSS 4

## Licença

Proprietary - Todos os direitos reservados

## Contato

Para dúvidas ou sugestões, entre em contato.

---

**Desenvolvido com base nas especificações da documentação técnica em `docs/`**
