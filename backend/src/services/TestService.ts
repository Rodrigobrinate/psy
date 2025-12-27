/**
 * Test Service
 * Regras de negócio para testes psicológicos
 * Implementa Strategy Pattern para cálculo de diferentes testes
 */

import { prisma } from '../lib/prisma';
import { AppError } from '../middlewares/errorHandler';
import { SubmitTestResponseInput } from '../lib/schemas';
import { SeverityLevel } from '../generated/prisma';

// ====================================
// STRATEGY PATTERN: Test Calculators
// ====================================

interface TestCalculatorStrategy {
  calculateScore(responses: { selectedValue: number; weight: number }[]): number;
  getSeverityLevel(score: number, scoringRules: any): SeverityLevel;
}

class StandardTestCalculator implements TestCalculatorStrategy {
  calculateScore(responses: { selectedValue: number; weight: number }[]): number {
    return responses.reduce((sum, r) => sum + r.selectedValue * r.weight, 0);
  }

  getSeverityLevel(score: number, scoringRules: any): SeverityLevel {
    const ranges = scoringRules.ranges || [];

    for (const range of ranges) {
      if (score >= range.min && score <= range.max) {
        return range.level as SeverityLevel;
      }
    }

    return 'MINIMAL';
  }
}

// Pode adicionar outras estratégias no futuro (ex: WeightedAverageCalculator)
class WeightedAverageCalculator implements TestCalculatorStrategy {
  calculateScore(responses: { selectedValue: number; weight: number }[]): number {
    const totalWeight = responses.reduce((sum, r) => sum + r.weight, 0);
    const weightedSum = responses.reduce((sum, r) => sum + r.selectedValue * r.weight, 0);
    return weightedSum / totalWeight;
  }

  getSeverityLevel(score: number, scoringRules: any): SeverityLevel {
    const ranges = scoringRules.ranges || [];
    for (const range of ranges) {
      if (score >= range.min && score <= range.max) {
        return range.level as SeverityLevel;
      }
    }
    return 'MINIMAL';
  }
}

// ====================================
// SERVICE
// ====================================

export class TestService {
  private calculatorStrategy: TestCalculatorStrategy;

  constructor(strategy: TestCalculatorStrategy = new StandardTestCalculator()) {
    this.calculatorStrategy = strategy;
  }

  /**
   * Lista todos os testes disponíveis
   */
  async listTests(category?: string) {
    const tests = await prisma.test.findMany({
      where: category ? { category: category as any } : undefined,
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
        category: true,
        minScore: true,
        maxScore: true,
        hasTimer: true,
        isPublicDomain: true,
        requiresLicense: true,
      },
      orderBy: { name: 'asc' },
    });

    return tests;
  }

  /**
   * Busca um teste específico com suas questões
   */
  async getTestWithQuestions(testId: string) {
    const test = await prisma.test.findUnique({
      where: { id: testId },
      include: {
        questions: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    if (!test) {
      throw new AppError('Teste não encontrado', 404);
    }

    return test;
  }

  /**
   * Processa respostas de um teste e calcula o resultado
   */
  async submitTestResponse(data: SubmitTestResponseInput, psychologistId: string) {
    // Busca o teste e as questões
    const test = await prisma.test.findUnique({
      where: { id: data.testId },
      include: { questions: true },
    });

    if (!test) {
      throw new AppError('Teste não encontrado', 404);
    }

    // Verifica se o paciente pertence ao psicólogo
    const patient = await prisma.patient.findFirst({
      where: {
        id: data.patientId,
        psychologistId,
      },
    });

    if (!patient) {
      throw new AppError('Paciente não encontrado ou não autorizado', 404);
    }

    // Valida se todas as questões foram respondidas
    if (data.responses.length !== test.questions.length) {
      throw new AppError('Todas as questões devem ser respondidas', 400);
    }

    // Prepara dados para cálculo
    const responsesWithWeights = data.responses.map((response) => {
      const question = test.questions.find((q) => q.id === response.questionId);
      if (!question) {
        throw new AppError(`Questão ${response.questionId} não encontrada`, 400);
      }

      return {
        selectedValue: response.selectedValue,
        weight: question.weight,
      };
    });

    // Calcula score usando Strategy Pattern
    const totalScore = this.calculatorStrategy.calculateScore(responsesWithWeights);
    const severityLevel = this.calculatorStrategy.getSeverityLevel(
      totalScore,
      test.scoringRules
    );

    // Gera interpretação automática
    const interpretation = this.generateInterpretation(test.name, severityLevel, totalScore);

    // Salva resultado no banco
    const result = await prisma.patientTestResult.create({
      data: {
        testId: data.testId,
        patientId: data.patientId,
        totalScore,
        severityLevel,
        interpretation,
        applicationMode: data.applicationMode,
        responses: {
          create: data.responses.map((r) => ({
            questionId: r.questionId,
            selectedValue: r.selectedValue,
            responseTime: r.responseTime,
          })),
        },
      },
      include: {
        test: {
          select: { name: true, code: true },
        },
        responses: {
          include: {
            question: {
              select: { questionText: true },
            },
          },
        },
      },
    });

    return result;
  }

  /**
   * Busca histórico de resultados de um paciente
   */
  async getPatientTestHistory(patientId: string, psychologistId: string) {
    // Verifica autorização
    const patient = await prisma.patient.findFirst({
      where: { id: patientId, psychologistId },
    });

    if (!patient) {
      throw new AppError('Paciente não encontrado', 404);
    }

    const results = await prisma.patientTestResult.findMany({
      where: { patientId },
      include: {
        test: {
          select: { name: true, code: true, category: true },
        },
      },
      orderBy: { appliedAt: 'desc' },
    });

    return results;
  }

  /**
   * Gera interpretação automática baseada no resultado
   */
  private generateInterpretation(
    testName: string,
    severityLevel: SeverityLevel,
    score: number
  ): string {
    const levelDescriptions: Record<SeverityLevel, string> = {
      MINIMAL: 'Os sintomas são mínimos ou inexistentes.',
      MILD: 'Os sintomas são leves e podem não interferir significativamente nas atividades diárias.',
      MODERATE: 'Os sintomas são moderados e podem começar a impactar o funcionamento diário.',
      MODERATELY_SEVERE: 'Os sintomas são moderadamente graves e interferem consideravelmente nas atividades.',
      SEVERE: 'Os sintomas são graves e requerem atenção clínica imediata.',
    };

    return `Resultado do ${testName}: Pontuação total de ${score} pontos, indicando nível ${severityLevel.toLowerCase()}. ${levelDescriptions[severityLevel]}`;
  }
}
