# Guia de Teste - Sistema de Agendamentos

## Problema Atual
Os agendamentos não estão aparecendo na página de agenda.

## Passos para Testar e Resolver

### 1. Verificar se o Backend está Rodando

```bash
cd backend
npm run dev
```

**Verificar:** A mensagem `✅ Database connection successful` deve aparecer.

### 2. Verificar se o Frontend está Rodando

```bash
cd frontend
npm run dev
```

**Verificar:** O frontend deve estar acessível em `http://localhost:3000` ou `http://localhost:3002`.

### 3. Teste Rápido com HTML de Teste

Abra o arquivo `test-api.html` no navegador (já deve estar aberto).

**Passos:**
1. **Login**: Digite email e senha e clique em "Login"
   - Email padrão: `test@test.com`
   - Senha padrão: `123456`
   - Deve retornar um token de acesso

2. **Listar Pacientes**: Clique em "Listar Pacientes"
   - Se não houver pacientes, você precisa criar um primeiro
   - Vá para a página de pacientes no dashboard

3. **Criar Paciente** (se necessário):
   - Acesse: `http://localhost:3000/dashboard/patients`
   - Clique em "Novo Paciente"
   - Preencha os dados e salve

4. **Criar Agendamento via HTML de Teste**:
   - Selecione um paciente no dropdown
   - Escolha data e horário
   - Clique em "Criar Agendamento"

5. **Verificar Agendamentos**:
   - Clique em "Listar Agendamentos"
   - Deve mostrar os agendamentos criados

### 4. Verificar Console do Navegador

Abra o console do navegador (F12) na página de agendamentos e verifique:

```javascript
// Deve aparecer logs como:
Buscando agendamentos para: 2026-01-06
Agendamentos recebidos: {data: Array(0)}
Pacientes recebidos: {data: Array(1)}
Stats recebidas: {data: {today: 0, thisWeek: 0, upcoming: 0}}
```

### 5. Problemas Comuns e Soluções

#### Problema: "Nenhum agendamento para esta data"

**Causa:** Você está buscando agendamentos para a data selecionada, mas não existem agendamentos para essa data.

**Solução:**
1. Crie um agendamento para a data atual
2. Ou use os botões de navegação para ver outras datas

#### Problema: "Erro ao carregar dados"

**Causa:** Backend não está rodando ou há erro de conexão.

**Solução:**
1. Verifique se o backend está rodando na porta 3004
2. Verifique se o frontend está configurado para acessar `http://localhost:3004/api`
3. Verifique o console do backend para ver erros

#### Problema: Token expirado ou inválido

**Causa:** O token de autenticação expirou.

**Solução:**
1. Faça logout e login novamente
2. Verifique se o token está sendo enviado corretamente

### 6. Criar Agendamento pelo Dashboard

1. Acesse: `http://localhost:3000/dashboard/schedule`
2. Clique em "Novo Agendamento" ou clique em um horário vazio na grade
3. Selecione um paciente
4. Escolha data e horário
5. Clique em "Agendar"

**O agendamento deve aparecer imediatamente na grade de horários.**

### 7. Verificar Banco de Dados (Opcional)

Se você tiver acesso ao banco PostgreSQL, execute:

```sql
-- Ver todos os agendamentos
SELECT
  a.id,
  a.scheduled_at,
  a.status,
  p.name as patient_name
FROM appointments a
JOIN patients p ON p.id = a.patient_id
ORDER BY a.scheduled_at DESC;
```

## Resultado Esperado

Após seguir os passos acima:

1. ✅ Você deve conseguir criar agendamentos
2. ✅ Os agendamentos devem aparecer na grade de horários
3. ✅ As estatísticas (Hoje, Esta Semana, Próximas) devem atualizar
4. ✅ Ao clicar em um agendamento, o modal de detalhes deve abrir
5. ✅ Ao clicar em "Iniciar Sessão", deve redirecionar para a página de execução

## Debugging Adicional

Se ainda assim os agendamentos não aparecerem, verifique:

### No Console do Navegador:
- Veja os logs que adicionamos (Buscando agendamentos para:, Agendamentos recebidos:, etc.)
- Verifique se há erros de rede (aba Network do DevTools)

### No Backend:
- Veja se as requisições estão chegando
- Verifique se há erros no console do backend

### Checklist de Verificação:
- [ ] Backend rodando na porta 3004
- [ ] Frontend rodando na porta 3000 ou 3002
- [ ] Banco de dados conectado
- [ ] Usuário autenticado (token válido)
- [ ] Pelo menos 1 paciente cadastrado
- [ ] Agendamento criado para a data selecionada

## Contato

Se o problema persistir, forneça:
1. Screenshot do console do navegador
2. Screenshot da página de agendamentos
3. Logs do backend
4. Resultado da query SQL (se possível)
