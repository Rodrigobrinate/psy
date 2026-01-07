# Integração com IA - Resumos Clínicos Automáticos

## Visão Geral

O sistema agora possui integração com **ChatGPT (OpenAI)** para gerar automaticamente resumos clínicos imparciais após cada sessão de atendimento.

## Como Funciona

### 1. Durante a Sessão
- O psicólogo faz anotações no campo de texto durante o atendimento
- As anotações são salvas automaticamente a cada 3 segundos

### 2. Ao Finalizar a Sessão
- Quando o status é alterado para "COMPLETED" (Concluído)
- O sistema automaticamente:
  1. Pega as anotações da sessão atual
  2. Verifica se o paciente já tem um resumo clínico anterior
  3. Envia para o ChatGPT:
     - Se for a primeira sessão: gera um resumo inicial
     - Se já houver resumo anterior: combina o histórico + nova sessão → gera resumo atualizado
  4. Salva o novo resumo no campo `clinicalSummary` do paciente

### 3. Visualização
- Na lista de pacientes, clique no ícone "Ver detalhes" (olho)
- O modal mostra:
  - **Resumo Clínico**: Resumo consolidado gerado pela IA (se disponível)
  - **Histórico de Atendimentos**: Lista completa de todas as sessões com:
    - Data e horário
    - Status (Agendado, Em Andamento, Concluído, Cancelado)
    - Duração
    - Anotações da sessão (primeiros 200 caracteres)

## Características do Resumo Gerado

A IA foi instruída para gerar resumos que sejam:

✅ **Imparciais e Objetivos** - Sem julgamentos pessoais
✅ **Tecnicamente Precisos** - Usa terminologia adequada da psicologia
✅ **Estruturados** - Organizado em seções lógicas
✅ **Clinicamente Relevantes** - Apenas informações importantes
✅ **Confidenciais** - Preserva privacidade do paciente
✅ **Focados em Dados Observáveis** - Baseado em fatos e relatos

### Estrutura do Resumo

1. **Histórico e Contexto** (se aplicável)
2. **Queixas e Demandas Principais**
3. **Observações Clínicas Relevantes**
4. **Evolução do Quadro** (comparado com sessões anteriores)
5. **Pontos de Atenção para Próximas Sessões**

## Configuração

### Requisitos

1. **Chave da API OpenAI**
   - Acesse: https://platform.openai.com/api-keys
   - Crie uma nova chave de API
   - Adicione ao arquivo `.env` do backend:

```env
OPENAI_API_KEY=sk-proj-...
```

2. **Modelo Utilizado**
   - `gpt-4o-nano` (modelo mais econômico)
   - Configurado com `temperature: 0.3` para respostas mais consistentes
   - Limite de 2000 tokens por resumo

### Custos Estimados

- Modelo: GPT-4o-nano
- Custo médio por resumo: ~$0.0001 - $0.0005 USD (muito baixo)
- Baseado em sessões com 500-2000 palavras de anotações
- Aproximadamente 10x mais barato que o gpt-4o-mini

## Fluxo Técnico

```
┌─────────────────────────┐
│  Sessão IN_PROGRESS     │
│  (anotações sendo       │
│   salvas a cada 3s)     │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  Status → COMPLETED     │
│  (botão Finalizar)      │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  AppointmentService     │
│  .updateAppointment()   │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  Verifica condições:    │
│  • Status mudou para    │
│    COMPLETED?           │
│  • Há anotações?        │
│  • OpenAI configurado?  │
└───────────┬─────────────┘
            │ SIM
            ▼
┌─────────────────────────┐
│  Busca resumo anterior  │
│  do paciente            │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  AIService              │
│  .generateSessionSummary│
│  (notas, paciente,      │
│   resumo anterior)      │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  OpenAI API             │
│  POST /chat/completions │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  Resumo gerado          │
│  (texto estruturado)    │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  Salva em               │
│  Patient.clinicalSummary│
└─────────────────────────┘
```

## Arquivos Modificados/Criados

### Backend
- ✅ `backend/src/services/AIService.ts` - Novo serviço de IA
- ✅ `backend/src/services/AppointmentService.ts` - Integração automática
- ✅ `backend/.env.example` - Documentação de variáveis

### Frontend
- ✅ `frontend/src/app/dashboard/patients/page.tsx` - Visualização de histórico

### Documentação
- ✅ `AI-INTEGRATION.md` - Este arquivo

## Tratamento de Erros

- Se a OpenAI API falhar, o erro é **logado** mas **não bloqueia** a conclusão da sessão
- O psicólogo pode continuar normalmente mesmo se a IA estiver indisponível
- Logs de erro aparecem no console do servidor para debug

## Segurança e Privacidade

⚠️ **IMPORTANTE**:
- As anotações são enviadas para a API da OpenAI
- Configure adequadamente conforme LGPD e regulamentações locais
- Considere anonimização adicional se necessário
- A OpenAI possui políticas de privacidade próprias: https://openai.com/policies/privacy-policy

### Boas Práticas
- Não inclua dados sensíveis desnecessários nas anotações
- Use iniciais ao invés de nomes completos de terceiros
- Revise os resumos gerados antes de compartilhar
- Mantenha backups dos dados originais

## Próximos Passos (Futuro)

- [ ] Opção para editar/revisar resumos gerados
- [ ] Sugestões de intervenções terapêuticas
- [ ] Detecção de padrões entre múltiplos pacientes
- [ ] Geração de relatórios profissionais em PDF
- [ ] Integração com transcrição de áudio (AssemblyAI)

## Suporte

Para dúvidas ou problemas:
1. Verifique se `OPENAI_API_KEY` está configurada corretamente
2. Confira os logs do servidor backend
3. Teste com uma sessão de exemplo
