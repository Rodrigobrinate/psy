/**
 * Test Controller
 * Orquestra requisições relacionadas a testes psicológicos
 */

import { Request, Response } from 'express';
import { TestService } from '../services/TestService';
import { submitTestResponseSchema } from '../lib/schemas';
import { asyncHandler } from '../middlewares/errorHandler';

const testService = new TestService();

export class TestController {
  list = asyncHandler(async (req: Request, res: Response) => {
    const category = req.query.category as string | undefined;

    const tests = await testService.listTests(category);

    res.json({
      data: tests,
      count: tests.length,
    });
  });

  get = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const test = await testService.getTestWithQuestions(id);

    res.json({ data: test });
  });

  submitResponse = asyncHandler(async (req: Request, res: Response) => {
    const psychologistId = req.psychologist!.psychologistId;
    const validatedData = submitTestResponseSchema.parse(req.body);

    const result = await testService.submitTestResponse(
      validatedData,
      psychologistId
    );

    res.status(201).json({
      message: 'Teste enviado e processado com sucesso',
      data: result,
    });
  });

  getPatientHistory = asyncHandler(async (req: Request, res: Response) => {
    const { patientId } = req.params;
    const psychologistId = req.psychologist!.psychologistId;

    const history = await testService.getPatientTestHistory(
      patientId,
      psychologistId
    );

    res.json({
      data: history,
      count: history.length,
    });
  });
}
