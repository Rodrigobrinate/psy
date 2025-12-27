# Nome do projeto
$projectName = Read-Host "Digite o nome do projeto"

# Criar pasta raiz
New-Item -ItemType Directory -Name $projectName
Set-Location $projectName

Write-Host "--- Iniciando Setup do Backend (Node + Express + TS + Prisma) ---" -ForegroundColor Cyan

# Setup Backend
New-Item -ItemType Directory -Name "backend"
Set-Location "backend"

# Inicializar NPM
npm init -y

# Instalar Dependências
npm install express cors dotenv @prisma/client
npm install -D typescript ts-node nodemon @types/express @types/node @types/cors prisma

# Inicializar TypeScript
npx tsc --init --outDir ./dist --rootDir ./src

# Inicializar Prisma (Postgres é o padrão)
npx prisma init --datasource-provider postgresql

# Criar estrutura de pastas do Backend
New-Item -ItemType Directory -Name "src/controllers"
New-Item -ItemType Directory -Name "src/routes"
New-Item -ItemType Directory -Name "src/services"
New-Item -ItemType Directory -Name "src/middlewares"

# Criar arquivo index.ts básico
$indexContent = @"
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API Psy-Manager Rodando 🚀');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:\${PORT}`);
});
"@
$indexContent | Out-File -FilePath "src/index.ts" -Encoding utf8

# Adicionar scripts ao package.json
$packageJson = Get-Content package.json | ConvertFrom-Json
$packageJson.scripts | Add-Member -MemberType NoteProperty -Name "dev" -Value "nodemon src/index.ts"
$packageJson.scripts | Add-Member -MemberType NoteProperty -Name "build" -Value "tsc"
$packageJson.scripts | Add-Member -MemberType NoteProperty -Name "start" -Value "node dist/index.js"
$packageJson | ConvertTo-Json | Out-File package.json -Encoding utf8

Set-Location ..

Write-Host "--- Iniciando Setup do Frontend (Next.js + Tailwind) ---" -ForegroundColor Cyan

# Setup Frontend usando create-next-app com flags automáticas
# --ts: TypeScript | --tailwind: Tailwind | --eslint: ESLint | --app: App Router | --src-dir: Pasta src
npx create-next-app@latest frontend --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --no-git

Write-Host "--- Estrutura criada com sucesso! ---" -ForegroundColor Green
Write-Host "Para começar:"
Write-Host "1. Configure o DATABASE_URL no backend/.env"
Write-Host "2. No backend: npm run dev"
Write-Host "3. No frontend: npm run dev"