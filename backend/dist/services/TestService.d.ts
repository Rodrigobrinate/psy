/**
 * Test Service
 * Regras de negócio para testes psicológicos
 * Implementa Strategy Pattern para cálculo de diferentes testes
 */
import { SubmitTestResponseInput } from '../lib/schemas';
import { SeverityLevel } from '../generated/prisma';
interface TestCalculatorStrategy {
    calculateScore(responses: {
        selectedValue: number;
        weight: number;
    }[]): number;
    getSeverityLevel(score: number, scoringRules: any): SeverityLevel;
}
export declare class TestService {
    private calculatorStrategy;
    constructor(strategy?: TestCalculatorStrategy);
    /**
     * Lista todos os testes disponíveis
     */
    listTests(category?: string): Promise<{
        name: string;
        id: string;
        code: string;
        description: string;
        category: import("../generated/prisma").$Enums.TestCategory;
        minScore: number;
        maxScore: number;
        hasTimer: boolean;
        isPublicDomain: boolean;
        requiresLicense: boolean;
    }[]>;
    /**
     * Busca um teste específico com suas questões
     */
    getTestWithQuestions(testId: string): Promise<{
        questions: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            testId: string;
            orderIndex: number;
            questionText: string;
            answerOptions: import("../generated/prisma/runtime/client").JsonValue;
            weight: number;
            isReversed: boolean;
        }[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        code: string;
        description: string;
        category: import("../generated/prisma").$Enums.TestCategory;
        minScore: number;
        maxScore: number;
        hasTimer: boolean;
        timerSeconds: number | null;
        scoringRules: import("../generated/prisma/runtime/client").JsonValue;
        isPublicDomain: boolean;
        requiresLicense: boolean;
    }>;
    /**
     * Processa respostas de um teste e calcula o resultado
     */
    submitTestResponse(data: SubmitTestResponseInput, psychologistId: string): Promise<{
        test: {
            name: string;
            code: string;
        };
        responses: ({
            question: {
                questionText: string;
            };
        } & {
            id: string;
            createdAt: Date;
            resultId: string;
            questionId: string;
            selectedValue: number;
            responseTime: number | null;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        patientId: string;
        testId: string;
        totalScore: number;
        severityLevel: import("../generated/prisma").$Enums.SeverityLevel;
        interpretation: string | null;
        appliedAt: Date;
        applicationMode: string | null;
        aiInconsistencyFlag: boolean;
        aiAnalysis: string | null;
    }>;
    /**
     * Busca histórico de resultados de um paciente
     */
    getPatientTestHistory(patientId: string, psychologistId: string): Promise<({
        test: {
            name: string;
            code: string;
            category: import("../generated/prisma").$Enums.TestCategory;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        patientId: string;
        testId: string;
        totalScore: number;
        severityLevel: import("../generated/prisma").$Enums.SeverityLevel;
        interpretation: string | null;
        appliedAt: Date;
        applicationMode: string | null;
        aiInconsistencyFlag: boolean;
        aiAnalysis: string | null;
    })[]>;
    /**
     * Gera interpretação automática baseada no resultado
     */
    private generateInterpretation;
}
export {};
//# sourceMappingURL=TestService.d.ts.map