/**
 * Financial Controller
 * Handlers HTTP para serviços e transações
 */

import { Request, Response } from 'express';
import { FinancialService } from '../services/FinancialService';
import { asyncHandler } from '../middlewares/errorHandler';
import { z } from 'zod';

const financialService = new FinancialService();

// Schemas de validação
const createServiceSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  description: z.string().optional(),
  defaultPrice: z.number().positive('Preço deve ser positivo'),
  durationMinutes: z.number().int().min(15).max(240).optional(),
});

const updateServiceSchema = createServiceSchema.partial().extend({
  isActive: z.boolean().optional(),
});

const createTransactionSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']),
  amount: z.number().positive('Valor deve ser positivo'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  date: z.string().optional(),
  paymentMethod: z.string().optional(),
  isPaid: z.boolean().optional(),
  patientId: z.string().uuid().optional(),
  serviceId: z.string().uuid().optional(),
  appointmentId: z.string().uuid().optional(),
});

const updateTransactionSchema = z.object({
  amount: z.number().positive().optional(),
  description: z.string().optional(),
  date: z.string().optional(),
  paymentMethod: z.string().optional(),
  isPaid: z.boolean().optional(),
});

export class FinancialController {
  // ====== SERVIÇOS ======

  listServices = asyncHandler(async (req: Request, res: Response) => {
    const psychologistId = req.psychologist!.psychologistId;
    const includeInactive = req.query.includeInactive === 'true';

    const services = await financialService.listServices(psychologistId, includeInactive);
    res.json({ data: services });
  });

  getService = asyncHandler(async (req: Request, res: Response) => {
    const psychologistId = req.psychologist!.psychologistId;
    const { id } = req.params;

    const service = await financialService.getService(id, psychologistId);
    res.json({ data: service });
  });

  createService = asyncHandler(async (req: Request, res: Response) => {
    const psychologistId = req.psychologist!.psychologistId;
    const data = createServiceSchema.parse(req.body);

    const service = await financialService.createService(psychologistId, data);
    res.status(201).json({
      message: 'Serviço criado com sucesso',
      data: service,
    });
  });

  updateService = asyncHandler(async (req: Request, res: Response) => {
    const psychologistId = req.psychologist!.psychologistId;
    const { id } = req.params;
    const data = updateServiceSchema.parse(req.body);

    const service = await financialService.updateService(id, psychologistId, data);
    res.json({
      message: 'Serviço atualizado com sucesso',
      data: service,
    });
  });

  deleteService = asyncHandler(async (req: Request, res: Response) => {
    const psychologistId = req.psychologist!.psychologistId;
    const { id } = req.params;

    const result = await financialService.deleteService(id, psychologistId);
    res.json(result);
  });

  // ====== TRANSAÇÕES ======

  listTransactions = asyncHandler(async (req: Request, res: Response) => {
    const psychologistId = req.psychologist!.psychologistId;
    const { type, startDate, endDate, patientId, serviceId } = req.query;

    const filters: any = {};
    if (type) filters.type = type as 'INCOME' | 'EXPENSE';
    if (startDate) filters.startDate = new Date(startDate as string);
    if (endDate) filters.endDate = new Date(endDate as string);
    if (patientId) filters.patientId = patientId as string;
    if (serviceId) filters.serviceId = serviceId as string;

    const transactions = await financialService.listTransactions(psychologistId, filters);
    res.json({ data: transactions });
  });

  createTransaction = asyncHandler(async (req: Request, res: Response) => {
    const psychologistId = req.psychologist!.psychologistId;
    const data = createTransactionSchema.parse(req.body);

    const transaction = await financialService.createTransaction(psychologistId, data as any);
    res.status(201).json({
      message: 'Transação criada com sucesso',
      data: transaction,
    });
  });

  updateTransaction = asyncHandler(async (req: Request, res: Response) => {
    const psychologistId = req.psychologist!.psychologistId;
    const { id } = req.params;
    const data = updateTransactionSchema.parse(req.body);

    const transaction = await financialService.updateTransaction(id, psychologistId, data);
    res.json({
      message: 'Transação atualizada com sucesso',
      data: transaction,
    });
  });

  deleteTransaction = asyncHandler(async (req: Request, res: Response) => {
    const psychologistId = req.psychologist!.psychologistId;
    const { id } = req.params;

    const result = await financialService.deleteTransaction(id, psychologistId);
    res.json(result);
  });

  // ====== RESUMO ======

  getSummary = asyncHandler(async (req: Request, res: Response) => {
    const psychologistId = req.psychologist!.psychologistId;
    const { month, year } = req.query;

    const summary = await financialService.getFinancialSummary(
      psychologistId,
      month ? parseInt(month as string) : undefined,
      year ? parseInt(year as string) : undefined
    );

    res.json({ data: summary });
  });
}
