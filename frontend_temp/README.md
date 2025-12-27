# Psy-Manager AI - Frontend

Interface web moderna para o sistema de gestão de consultórios psicológicos.

## Stack Tecnológica

- **Next.js 15**: Framework React com App Router
- **TypeScript**: Tipagem estática
- **Tailwind CSS 4**: Estilização utility-first
- **React 19**: Biblioteca UI

## Estrutura do Projeto

```
src/
├── app/                    # Pages (App Router)
│   ├── page.tsx           # Landing page
│   ├── login/             # Página de login
│   ├── register/          # Página de cadastro
│   └── dashboard/         # Páginas protegidas
├── components/            # Componentes reutilizáveis
│   ├── ui/               # Componentes base (Button, Input, Card, Alert)
│   ├── DashboardLayout.tsx
│   └── ProtectedRoute.tsx
├── contexts/             # React Contexts
│   └── AuthContext.tsx   # Gerenciamento de autenticação
└── lib/                  # Bibliotecas e utilidades
    ├── api.ts            # Cliente HTTP
    └── types.ts          # Types TypeScript
```

## Setup

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Crie um arquivo `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3004/api
```

### 3. Iniciar servidor de desenvolvimento

```bash
npm run dev
```

O frontend estará rodando em `http://localhost:3000`

## Funcionalidades Implementadas

### Autenticação
- ✅ Landing page responsiva
- ✅ Página de login
- ✅ Página de registro
- ✅ Context de autenticação com JWT
- ✅ Protected routes
- ✅ Logout

### Dashboard
- ✅ Layout com sidebar
- ✅ Dashboard home com estatísticas
- ✅ Navegação entre módulos
- ✅ Informações do usuário logado

### Componentes UI
- ✅ Button (com variantes e loading state)
- ✅ Input (com label e erro)
- ✅ Card (com header, title, content)
- ✅ Alert (success, error, warning, info)
- ✅ Loading (spinner e página completa)

## Páginas

### Públicas
- `/` - Landing page
- `/login` - Login
- `/register` - Cadastro

### Protegidas (requer autenticação)
- `/dashboard` - Dashboard principal
- `/dashboard/patients` - Gerenciamento de pacientes (próximo passo)
- `/dashboard/tests` - Testes psicológicos (próximo passo)
- `/dashboard/schedule` - Agenda (futuro)

## Integração com Backend

O frontend se comunica com o backend através do cliente HTTP (`lib/api.ts`) que:

- Gerencia automaticamente o token JWT
- Trata erros de forma consistente
- Fornece métodos tipados para todas as rotas da API

### Exemplo de uso:

```typescript
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { token } = useAuth();

  const loadData = async () => {
    const { data } = await api.listPatients(token!);
    // ...
  };
}
```

## Build para Produção

```bash
# Gerar build otimizado
npm run build

# Iniciar em modo produção
npm start
```

## Desenvolvimento

### Adicionar nova página protegida

```typescript
'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/DashboardLayout';

export default function MyPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        {/* Seu conteúdo aqui */}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
```

### Adicionar novo componente UI

Siga o padrão dos componentes existentes em `components/ui/`:
- Props tipadas com TypeScript
- Estilos com Tailwind CSS
- Suporte a className customizado
- Acessibilidade (aria-labels, roles)

## Próximos Passos

- [ ] Implementar CRUD completo de pacientes
- [ ] Implementar aplicação de testes psicológicos
- [ ] Adicionar gráficos de evolução (charts)
- [ ] Implementar agenda com calendário
- [ ] WebSocket para sugestões da IA em tempo real
- [ ] Upload de áudio para transcrição
- [ ] PWA (Progressive Web App)
- [ ] Testes unitários com Jest
- [ ] Testes E2E com Playwright

## Licença

Proprietary - Todos os direitos reservados
