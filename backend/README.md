# Psy-Manager AI - Backend

Sistema de gestão para psicólogos com IA integrada - API REST

## Stack Tecnológica

- **Node.js + Express**: Framework web
- **TypeScript**: Tipagem estática
- **Prisma**: ORM e migrations
- **PostgreSQL**: Banco de dados
- **Zod**: Validação de schemas
- **JWT**: Autenticação
- **bcrypt**: Hashing de senhas

## Arquitetura

Seguindo os princípios de **Clean Architecture** e **SOLID**:

```
src/
├── controllers/     # Orquestra requisições HTTP
├── services/        # Regras de negócio (Strategy Pattern)
├── middlewares/     # Auth, Error Handler, Rate Limit
├── routes/          # Definição de endpoints
├── lib/             # Prisma Client, Schemas (Zod)
└── generated/       # Prisma Client gerado
```

## Setup

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Edite o arquivo `.env` e configure:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/psymanager"
JWT_SECRET=your-super-secret-jwt-key
ASSEMBLYAI_API_KEY=your-api-key
```

### 3. Criar banco de dados

```bash
# Criar migrations
npx prisma migrate dev --name init

# Popular banco com testes psicológicos (PHQ-9, GAD-7)
npm run db:seed
```

### 4. Iniciar servidor de desenvolvimento

```bash
npm run dev
```

O servidor estará rodando em `http://localhost:3004`

## Endpoints Principais

### Autenticação

```http
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
GET  /api/auth/me (protegido)
```

### Pacientes

```http
GET    /api/patients (protegido)
GET    /api/patients/:id (protegido)
POST   /api/patients (protegido)
PUT    /api/patients/:id (protegido)
DELETE /api/patients/:id (protegido)
```

### Testes Psicológicos

```http
GET  /api/tests (protegido)
GET  /api/tests/:id (protegido)
POST /api/tests/submit (protegido)
GET  /api/tests/patient/:patientId/history (protegido)
```

## Exemplo de Uso

### 1. Registrar um psicólogo

```bash
curl -X POST http://localhost:3004/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "psicologo@example.com",
    "password": "senha123456",
    "name": "Dr. João Silva",
    "crp": "CRP 06/12345",
    "phone": "(11) 99999-9999"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:3004/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "psicologo@example.com",
    "password": "senha123456"
  }'
```

### 3. Criar um paciente

```bash
curl -X POST http://localhost:3004/api/patients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "name": "Maria Santos",
    "email": "maria@example.com",
    "phone": "(11) 88888-8888"
  }'
```

## Segurança

- **Rate Limiting**: 100 requisições por 15 minutos
- **JWT**: Tokens de acesso com expiração de 1h
- **Refresh Tokens**: Expiração de 7 dias
- **Bcrypt**: Hash de senhas com salt rounds = 10
- **CORS**: Configurado para aceitar apenas origem permitida
- **LGPD**: Soft delete e hard delete de pacientes

## Deploy (Produção)

### Build

```bash
npm run build
```

### Iniciar

```bash
npm start
```

### Variáveis de ambiente críticas

```env
NODE_ENV=production
DATABASE_URL=sua-url-de-producao
JWT_SECRET=secret-super-seguro-gerado-aleatoriamente
CORS_ORIGIN=https://seu-dominio.com
```

## Testes Psicológicos Incluídos

- **PHQ-9**: Patient Health Questionnaire (Depressão)
- **GAD-7**: Generalized Anxiety Disorder (Ansiedade)

Mais testes podem ser adicionados via seed ou API.

## Próximos Passos

- [ ] Implementar upload de áudio para transcrição (AssemblyAI)
- [ ] Integrar LLM para sugestões de perguntas em tempo real
- [ ] Adicionar WebSocket para streaming de sugestões
- [ ] Implementar mais testes psicológicos (ASRS-18, PCL-5, etc.)
- [ ] Análise de inconsistências com IA (Plano Pro)

## Licença

Proprietary - Todos os direitos reservados
