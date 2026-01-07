"use strict";
/**
 * Financial Service
 * Regras de negócio para serviços e transações financeiras
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinancialService = void 0;
const prisma_1 = require("../lib/prisma");
const errorHandler_1 = require("../middlewares/errorHandler");
// ====================================
// SERVICE CRUD
// ====================================
class FinancialService {
    // ====== SERVIÇOS ======
    async listServices(psychologistId, includeInactive = false) {
        const services = await prisma_1.prisma.service.findMany({
            where: {
                psychologistId,
                ...(includeInactive ? {} : { isActive: true }),
            },
            orderBy: { name: 'asc' },
        });
        return services;
    }
    async getService(serviceId, psychologistId) {
        const service = await prisma_1.prisma.service.findFirst({
            where: { id: serviceId, psychologistId },
        });
        if (!service) {
            throw new errorHandler_1.AppError('Serviço não encontrado', 404);
        }
        return service;
    }
    async createService(psychologistId, data) {
        const service = await prisma_1.prisma.service.create({
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
    async updateService(serviceId, psychologistId, data) {
        const service = await prisma_1.prisma.service.findFirst({
            where: { id: serviceId, psychologistId },
        });
        if (!service) {
            throw new errorHandler_1.AppError('Serviço não encontrado', 404);
        }
        const updated = await prisma_1.prisma.service.update({
            where: { id: serviceId },
            data,
        });
        return updated;
    }
    async deleteService(serviceId, psychologistId) {
        const service = await prisma_1.prisma.service.findFirst({
            where: { id: serviceId, psychologistId },
        });
        if (!service) {
            throw new errorHandler_1.AppError('Serviço não encontrado', 404);
        }
        // Soft delete - desativa o serviço
        await prisma_1.prisma.service.update({
            where: { id: serviceId },
            data: { isActive: false },
        });
        return { message: 'Serviço desativado com sucesso' };
    }
    // ====== TRANSAÇÕES ======
    async listTransactions(psychologistId, filters) {
        const where = { psychologistId };
        if (filters?.type) {
            where.type = filters.type;
        }
        if (filters?.startDate && filters?.endDate) {
            where.date = {
                gte: filters.startDate,
                lte: filters.endDate,
            };
        }
        else if (filters?.startDate) {
            where.date = { gte: filters.startDate };
        }
        else if (filters?.endDate) {
            where.date = { lte: filters.endDate };
        }
        if (filters?.patientId) {
            where.patientId = filters.patientId;
        }
        if (filters?.serviceId) {
            where.serviceId = filters.serviceId;
        }
        const transactions = await prisma_1.prisma.transaction.findMany({
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
    async createTransaction(psychologistId, data) {
        // Validações
        if (data.patientId) {
            const patient = await prisma_1.prisma.patient.findFirst({
                where: { id: data.patientId, psychologistId },
            });
            if (!patient) {
                throw new errorHandler_1.AppError('Paciente não encontrado', 404);
            }
        }
        if (data.serviceId) {
            const service = await prisma_1.prisma.service.findFirst({
                where: { id: data.serviceId, psychologistId },
            });
            if (!service) {
                throw new errorHandler_1.AppError('Serviço não encontrado', 404);
            }
        }
        const transaction = await prisma_1.prisma.transaction.create({
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
    async updateTransaction(transactionId, psychologistId, data) {
        const transaction = await prisma_1.prisma.transaction.findFirst({
            where: { id: transactionId, psychologistId },
        });
        if (!transaction) {
            throw new errorHandler_1.AppError('Transação não encontrada', 404);
        }
        const updated = await prisma_1.prisma.transaction.update({
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
    async deleteTransaction(transactionId, psychologistId) {
        const transaction = await prisma_1.prisma.transaction.findFirst({
            where: { id: transactionId, psychologistId },
        });
        if (!transaction) {
            throw new errorHandler_1.AppError('Transação não encontrada', 404);
        }
        await prisma_1.prisma.transaction.delete({
            where: { id: transactionId },
        });
        return { message: 'Transação excluída com sucesso' };
    }
    // ====== RESUMO FINANCEIRO ======
    async getFinancialSummary(psychologistId, month, year) {
        const now = new Date();
        const targetMonth = month ?? now.getMonth();
        const targetYear = year ?? now.getFullYear();
        const startOfMonth = new Date(targetYear, targetMonth, 1);
        const endOfMonth = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999);
        const transactions = await prisma_1.prisma.transaction.findMany({
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
        const monthlyData = await prisma_1.prisma.transaction.groupBy({
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
exports.FinancialService = FinancialService;
//# sourceMappingURL=FinancialService.js.map