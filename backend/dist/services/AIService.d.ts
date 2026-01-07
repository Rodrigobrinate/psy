/**
 * AI Service
 * Integração com OpenAI para geração de resumos de sessões
 */
export declare class AIService {
    private apiKey;
    private apiUrl;
    constructor();
    /**
     * Gera um resumo imparcial de uma sessão de atendimento
     */
    generateSessionSummary(sessionNotes: string, patientName: string, previousSummary?: string | null): Promise<string>;
    /**
     * Prompt do sistema que define o comportamento da IA
     */
    private getSystemPrompt;
    /**
     * Constrói o prompt para geração do resumo
     */
    private buildPrompt;
    /**
     * Verifica se a API key está configurada
     */
    isConfigured(): boolean;
}
//# sourceMappingURL=AIService.d.ts.map