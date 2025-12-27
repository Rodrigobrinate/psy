# Quick Start - Psy-Manager AI

## Passo 1: Iniciar Backend

Abra um terminal e execute:

```bash
cd C:\Users\PC\Documents\psy\backend

# Rodar migrations (primeira vez)
npx prisma migrate dev --name init

# Popular banco com testes PHQ-9 e GAD-7 (primeira vez)
npm run db:seed

# Iniciar servidor
npm run dev
```

Backend rodando em: **http://localhost:3004**

## Passo 2: Iniciar Frontend

Abra um NOVO terminal (deixe o backend rodando) e execute:

```bash
cd C:\Users\PC\Documents\psy\frontend

# Iniciar servidor
npm run dev
```

Frontend rodando em: **http://localhost:3000**

## Passo 3: Testar o Sistema

1. **Abra o navegador**: http://localhost:3000

2. **Criar uma conta**:
   - Clique em "Começar Grátis"
   - Preencha:
     - Nome: Dr. João Silva
     - Email: joao@teste.com
     - CRP: CRP 06/12345
     - Telefone: (11) 99999-9999
     - Senha: senha12345
   - Clique em "Criar Conta"

3. **Você será redirecionado para o Dashboard** automaticamente após o cadastro

4. **Explore o Dashboard**:
   - Veja as estatísticas
   - Use a sidebar para navegar
   - Clique em "Novo Paciente" para testar (em desenvolvimento)
   - Clique em "Aplicar Teste" para ver os testes disponíveis (em desenvolvimento)

## Endpoints da API Disponíveis

Você pode testar diretamente com cURL ou Postman:

### 1. Registrar Psicólogo
```bash
curl -X POST http://localhost:3004/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@exemplo.com",
    "password": "senha12345",
    "name": "Dr. Maria Santos",
    "crp": "CRP 06/54321",
    "phone": "(11) 98888-8888"
  }'
```

### 2. Fazer Login
```bash
curl -X POST http://localhost:3004/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@exemplo.com",
    "password": "senha12345"
  }'
```

Copie o `accessToken` retornado para usar nas próximas requisições.

### 3. Listar Testes Psicológicos
```bash
curl -X GET http://localhost:3004/api/tests \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### 4. Criar um Paciente
```bash
curl -X POST http://localhost:3004/api/patients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "name": "Maria Silva",
    "email": "maria@exemplo.com",
    "phone": "(11) 97777-7777"
  }'
```

### 5. Listar Pacientes
```bash
curl -X GET http://localhost:3004/api/patients \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

## Ver Banco de Dados (Prisma Studio)

```bash
cd C:\Users\PC\Documents\psy\backend
npx prisma studio
```

Abre uma interface visual em: **http://localhost:5555**

Você pode ver e editar:
- Psicólogos cadastrados
- Pacientes
- Testes (PHQ-9 e GAD-7 já populados)
- Resultados de testes

## Troubleshooting

### Erro de conexão com banco
```bash
# Verifique se o PostgreSQL está acessível
psql -h 187.94.208.10 -p 5555 -U postgres -d psy
```

### Limpar e recomeçar
```bash
cd backend

# Reset completo do banco (apaga tudo!)
npx prisma migrate reset

# Popular novamente
npm run db:seed
```

### Porta em uso
```bash
# Windows - Matar processo na porta 3004 (backend)
netstat -ano | findstr :3004
taskkill /PID <numero_do_pid> /F

# Windows - Matar processo na porta 3000 (frontend)
netstat -ano | findstr :3000
taskkill /PID <numero_do_pid> /F
```

## Estrutura do Projeto

```
psy/
├── backend/               # Node.js + Express + Prisma
│   ├── src/
│   │   ├── controllers/  # AuthController, PatientController, TestController
│   │   ├── services/     # AuthService, PatientService, TestService
│   │   ├── middlewares/  # auth, errorHandler, rateLimiter
│   │   ├── routes/       # Definição de endpoints
│   │   └── lib/          # Prisma client, schemas Zod
│   └── prisma/
│       ├── schema.prisma # Database schema
│       └── seed.ts       # Populate PHQ-9 e GAD-7
│
└── frontend/             # Next.js 15 + React 19
    ├── src/
    │   ├── app/         # Pages (App Router)
    │   ├── components/  # Componentes reutilizáveis
    │   ├── contexts/    # AuthContext
    │   └── lib/         # API client
    └── public/
```

## Próximos Passos

Agora que o sistema está funcionando, você pode:

1. ✅ Criar contas e fazer login
2. ✅ Ver o dashboard
3. 🚧 Implementar CRUD de pacientes (próximo)
4. 🚧 Implementar aplicação de testes (próximo)
5. 🚧 Adicionar gráficos de evolução
6. 🚧 Implementar agenda

## Comandos Úteis

```bash
# Backend
npm run dev          # Desenvolvimento
npm run build        # Build produção
npm start            # Rodar build
npx prisma studio    # Ver banco de dados

# Frontend
npm run dev          # Desenvolvimento
npm run build        # Build produção
npm start            # Rodar build
npm run lint         # Verificar código
```

---

**Sistema 100% funcional e pronto para desenvolvimento!** 🚀
