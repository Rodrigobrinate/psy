/**
 * Financial Service
 * Regras de negócio para serviços e transações financeiras
 */

import { prisma } from '../lib/prisma';
import { AppError } from '../middlewares/errorHandler';

// Type that matches Prisma enum (will be generated after migration)
type TransactionType = 'INCOME' | 'EXPENSE';

// ====================================
// SERVICE CRUD
// ====================================

export class FinancialService {
  // ====== SERVIÇOS ======

  async listServices(psychologistId: string, includeInactive = false) {
    const services = await prisma.service.findMany({
      where: {
        psychologistId,
        ...(includeInactive ? {} : { isActive: true }),
      },
      orderBy: { name: 'asc' },
    });

    return services;
  }

  async getService(serviceId: string, psychologistId: string) {
    const service = await prisma.service.findFirst({
      where: { id: serviceId, psychologistId },
    });

    if (!service) {
      throw new AppError('Serviço não encontrado', 404);
    }

    return service;
  }

  async createService(
    psychologistId: string,
    data: {
      name: string;
      description?: string;
      defaultPrice: number;
      durationMinutes?: number;
    }
  ) {
    const service = await prisma.service.create({
      data: {
        name: data.name,
        description: data.description,
        defaultPrice: data.defaultPrice,
        durationMinutes: data.durationMinutes || 50,
        psychologistId,
      },
    });

    return service;
  }

  async updateService(
    serviceId: string,
    psychologistId: string,
    data: {
      name?: string;
      description?: string;
      defaultPrice?: number;
      durationMinutes?: number;
      isActive?: boolean;
    }
  ) {
    const service = await prisma.service.findFirst({
      where: { id: serviceId, psychologistId },
    });

    if (!service) {
      throw new AppError('Serviço não encontrado', 404);
    }

    const updated = await prisma.service.update({
      where: { id: serviceId },
      data,
    });

    return updated;
  }

  async deleteService(serviceId: string, psychologistId: string) {
    const service = await prisma.service.findFirst({
      where: { id: serviceId, psychologistId },
    });

    if (!service) {
      throw new AppError('Serviço não encontrado', 404);
    }

    // Soft delete - desativa o serviço
    await prisma.service.update({
      where: { id: serviceId },
      data: { isActive: false },
    });

    return { message: 'Serviço desativado com sucesso' };
  }

  // ====== TRANSAÇÕES ======

  async listTransactions(
    psychologistId: string,
    filters?: {
      type?: TransactionType;
      startDate?: Date;
      endDate?: Date;
      patientId?: string;
      serviceId?: string;
    }
  ) {
    const where: any = { psychologistId };

    if (filters?.type) {
      where.type = filters.type;
    }

    if (filters?.startDate && filters?.endDate) {
      where.date = {
        gte: filters.startDate,
        lte: filters.endDate,
      };
    } else if (filters?.startDate) {
      where.date = { gte: filters.startDate };
    } else if (filters?.endDate) {
      where.date = { lte: filters.endDate };
    }

    if (filters?.patientId) {
      where.patientId = filters.patientId;
    }

    if (filters?.serviceId) {
      where.serviceId = filters.serviceId;
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        patient: {
          select: { id: true, name: true },
        },
        service: {
          select: { id: true, name: true },
        },
      },
      orderBy: { date: 'desc' },
    });

    return transactions;
  }

  async createTransaction(
    psychologistId: string,
    data: {
      type: TransactionType;
      amount: number;
      description: string;
      date?: string;
      paymentMethod?: string;
      isPaid?: boolean;
      patientId?: string;
      serviceId?: string;
      appointmentId?: string;
    }
  ) {
    // Validações
    if (data.patientId) {
      const patient = await prisma.patient.findFirst({
        where: { id: data.patientId, psychologistId },
      });
      if (!patient) {
        throw new AppError('Paciente não encontrado', 404);
      }
    }

    if (data.serviceId) {
      const service = await prisma.service.findFirst({
        where: { id: data.serviceId, psychologistId },
      });
      if (!service) {
        throw new AppError('Serviço não encontrado', 404);
      }
    }

    const transaction = await prisma.transaction.create({
      data: {
        type: data.type,
        amount: Math.abs(data.amount), // Sempre positivo
        description: data.description,
        date: data.date ? new Date(data.date) : new Date(),
        paymentMethod: data.paymentMethod,
        isPaid: data.isPaid ?? true,
        paidAt: data.isPaid !== false ? new Date() : null,
        psychologistId,
        patientId: data.patientId,
        serviceId: data.serviceId,
        appointmentId: data.appointmentId,
      },
      include: {
        patient: { select: { id: true, name: true } },
        service: { select: { id: true, name: true } },
      },
    });

    return transaction;
  }

  async updateTransaction(
    transactionId: string,
    psychologistId: string,
    data: {
      amount?: number;
      description?: string;
      date?: string;
      paymentMethod?: string;
      isPaid?: boolean;
    }
  ) {
    const transaction = await prisma.transaction.findFirst({
      where: { id: transactionId, psychologistId },
    });

    if (!transaction) {
      throw new AppError('Transação não encontrada', 404);
    }

    const updated = await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        amount: data.amount ? Math.abs(data.amount) : undefined,
        description: data.description,
        date: data.date ? new Date(data.date) : undefined,
        paymentMethod: data.paymentMethod,
        isPaid: data.isPaid,
        paidAt: data.isPaid === true && !transaction.isPaid ? new Date() : undefined,
      },
      include: {
        patient: { select: { id: true, name: true } },
        service: { select: { id: true, name: true } },
      },
    });

    return updated;
  }

  async deleteTransaction(transactionId: string, psychologistId: string) {
    const transaction = await prisma.transaction.findFirst({
      where: { id: transactionId, psychologistId },
    });

    if (!transaction) {
      throw new AppError('Transação não encontrada', 404);
    }

    await prisma.transaction.delete({
      where: { id: transactionId },
    });

    return { message: 'Transação excluída com sucesso' };
  }

  // ====== RESUMO FINANCEIRO ======

  async getFinancialSummary(psychologistId: string, month?: number, year?: number) {
    const now = new Date();
    const targetMonth = month ?? now.getMonth();
    const targetYear = year ?? now.getFullYear();

    const startOfMonth = new Date(targetYear, targetMonth, 1);
    const endOfMonth = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999);

    const transactions = await prisma.transaction.findMany({
      where: {
        psychologistId,
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    const income = transactions
      .filter((t) => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
      .filter((t) => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0);

    const pending = transactions
      .filter((t) => !t.isPaid)
      .reduce((sum, t) => sum + t.amount, 0);

    // Transações dos últimos 6 meses para gráfico
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const monthlyData = await prisma.transaction.groupBy({
      by: ['type'],
      where: {
        psychologistId,
        date: { gte: sixMonthsAgo },
      },
      _sum: { amount: true },
    });

    return {
      month: targetMonth,
      year: targetYear,
      income,
      expenses,
      balance: income - expenses,
      pending,
      transactionCount: transactions.length,
    };
  }
}
