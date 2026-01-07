/**
 * AI Service
 * Integração com OpenAI para geração de resumos de sessões
 */

export class AIService {
  private apiKey: string;
  private apiUrl = 'https://api.openai.com/v1/chat/completions';

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';
    if (!this.apiKey) {
      console.warn('OPENAI_API_KEY não configurada. Funcionalidades de IA estarão desabilitadas.');
    }
  }

  /**
   * Gera um resumo imparcial de uma sessão de atendimento
   */
  async generateSessionSummary(
    sessionNotes: string,
    patientName: string,
    previousSummary?: string | null
  ): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key não configurada');
    }

    const prompt = this.buildPrompt(sessionNotes, patientName, previousSummary);

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-nano',
          messages: [
            {
              role: 'system',
              content: this.getSystemPrompt(),
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.3,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        const error: any = await response.json();
        throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
      }

      const data: any = await response.json();
      const summary = data.choices[0]?.message?.content;

      if (!summary) {
        throw new Error('Nenhum resumo foi gerado pela IA');
      }

      return summary.trim();
    } catch (error: any) {
      console.error('Erro ao gerar resumo com IA:', error);
      throw new Error(`Erro ao gerar resumo: ${error.message}`);
    }
  }

  /**
   * Prompt do sistema que define o comportamento da IA
   */
  private getSystemPrompt(): string {
    return `Você é um assistente especializado em psicologia clínica. Sua função é gerar resumos clínicos imparciais e profissionais de sessões de atendimento psicológico.

DIRETRIZES IMPORTANTES:
- Mantenha total imparcialidade e objetividade
- Use terminologia técnica adequada da psicologia
- Organize as informações de forma clara e estruturada
- Inclua apenas informações clinicamente relevantes
- Preserve a confidencialidade (não mencione nomes de terceiros sem necessidade)
- Identifique padrões, sintomas e progressos observados
- Evite julgamentos pessoais ou interpretações não fundamentadas
- Mantenha foco em dados observáveis e relatos do paciente
- Se houver um resumo anterior, integre as novas informações mantendo a cronologia

ESTRUTURA ESPERADA:
1. Histórico e Contexto (se aplicável)
2. Queixas e Demandas Principais
3. Observações Clínicas Relevantes
4. Evolução do Quadro (comparado com sessões anteriores, se houver)
5. Pontos de Atenção para Próximas Sessões

Seja conciso mas abrangente. Priorize qualidade sobre quantidade.`;
  }

  /**
   * Constrói o prompt para geração do resumo
   */
  private buildPrompt(
    sessionNotes: string,
    patientName: string,
    previousSummary?: string | null
  ): string {
    if (previousSummary) {
      return `Paciente: ${patientName}

RESUMO CLÍNICO ANTERIOR:
${previousSummary}

ANOTAÇÕES DA SESSÃO ATUAL:
${sessionNotes}

Por favor, gere um resumo clínico ATUALIZADO que integre o histórico anterior com as novas informações da sessão atual. Mantenha a cronologia e destaque a evolução do quadro.`;
    }

    return `Paciente: ${patientName}

ANOTAÇÕES DA SESSÃO:
${sessionNotes}

Por favor, gere um resumo clínico profissional e imparcial desta primeira sessão, destacando as informações mais relevantes para o acompanhamento do paciente.`;
  }

  /**
   * Verifica se a API key está configurada
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }
}
