# Guia de Início Rápido - Psy-Manager AI

Este guia vai te ajudar a rodar o projeto completo em sua máquina.

## Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js 18+** ([Download](https://nodejs.org/))
- **PostgreSQL 14+** ([Download](https://www.postgresql.org/download/))
- **Git** ([Download](https://git-scm.com/))

## Passo 1: Configurar o PostgreSQL

### Criar o banco de dados

```bash
# Abra o terminal do PostgreSQL ou pgAdmin

# Crie o banco de dados
createdb psymanager

# Ou usando SQL:
# CREATE DATABASE psymanager;
```

## Passo 2: Configurar o Backend

```bash
# Navegue até a pasta do backend
cd backend

# Instale as dependências
npm install

# Configure as variáveis de ambiente
# Edite o arquivo .env e atualize as seguintes variáveis:
# - DATABASE_URL (ex: postgresql://postgres:sua-senha@localhost:5432/psymanager)
# - JWT_SECRET (gere um secret aleatório)
# - JWT_EXPIRES_IN=1h
# - REFRESH_TOKEN_SECRET (gere outro secret aleatório)
# - REFRESH_TOKEN_EXPIRES_IN=7d

# Rode as migrations para criar as tabelas
npx prisma migrate dev --name init

# Popule o banco com os testes psicológicos (PHQ-9 e GAD-7)
npm run db:seed

# Inicie o servidor backend
npm run dev
```

O backend estará rodando em: **http://localhost:3004**

Para testar se está funcionando, acesse: http://localhost:3004

## Passo 3: Configurar o Frontend

**Abra um novo terminal** (mantenha o backend rodando)

```bash
# Navegue até a pasta do frontend
cd frontend

# Instale as dependências
npm install

# O arquivo .env.local já está configurado com:
# NEXT_PUBLIC_API_URL=http://localhost:3004/api

# Inicie o servidor frontend
npm run dev
```

O frontend estará rodando em: **http://localhost:3000**

## Passo 4: Testar a Aplicação

1. Abra seu navegador em **http://localhost:3000**
2. Clique em "Começar Grátis" ou "Criar Conta"
3. Preencha o formulário de cadastro:
   - Nome: Dr. João Silva
   - Email: joao@example.com
   - CRP: CRP 06/12345
   - Telefone: (11) 99999-9999
   - Senha: senha12345
4. Clique em "Criar Conta"
5. Você será redirecionado para o dashboard

## Estrutura do Projeto

```
psy/
├── backend/           # API REST
│   ├── src/          # Código fonte
│   ├── prisma/       # Schema e migrations
│   └── .env          # Configurações (DATABASE_URL, JWT_SECRET)
│
├── frontend/         # Interface Web
│   ├── src/         # Código fonte
│   └── .env.local   # Configurações (API_URL)
│
└── docs/            # Documentação técnica
```

## Comandos Úteis

### Backend

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Iniciar em produção
npm start

# Ver banco de dados (Prisma Studio)
npx prisma studio

# Criar nova migration
npx prisma migrate dev --name nome-da-migration

# Popular banco com testes
npm run db:seed
```

### Frontend

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Iniciar em produção
npm start

# Lint
npm run lint
```

## Troubleshooting

### Erro de conexão com o banco

- Verifique se o PostgreSQL está rodando
- Confirme as credenciais no arquivo `backend/.env`
- Teste a conexão: `psql -U postgres -d psymanager`

### Erro "Module not found"

```bash
# Limpe node_modules e reinstale
cd backend && rm -rf node_modules && npm install
cd ../frontend && rm -rf node_modules && npm install
```

### Porta já em uso

```bash
# Backend (porta 3004)
lsof -ti:3004 | xargs kill -9

# Frontend (porta 3000)
lsof -ti:3000 | xargs kill -9
```

### Erro no Prisma

```bash
# Regenere o Prisma Client
cd backend
npx prisma generate

# Reset completo do banco (cuidado, apaga todos os dados!)
npx prisma migrate reset
```

## Próximos Passos

Agora que o projeto está rodando:

1. Explore o dashboard
2. Cadastre alguns pacientes
3. Aplique testes psicológicos
4. Veja os resultados e interpretações automáticas

## Suporte

Para dúvidas ou problemas:

1. Verifique a documentação em `backend/README.md` e `frontend/README.md`
2. Consulte os logs no terminal
3. Abra uma issue no repositório

---

**Desenvolvido com Next.js 15, React 19, Node.js, Express, Prisma e PostgreSQL**
