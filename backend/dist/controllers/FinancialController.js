"use strict";
/**
 * Financial Controller
 * Handlers HTTP para serviços e transações
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinancialController = void 0;
const FinancialService_1 = require("../services/FinancialService");
const errorHandler_1 = require("../middlewares/errorHandler");
const zod_1 = require("zod");
const financialService = new FinancialService_1.FinancialService();
// Schemas de validação
const createServiceSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
    description: zod_1.z.string().optional(),
    defaultPrice: zod_1.z.number().positive('Preço deve ser positivo'),
    durationMinutes: zod_1.z.number().int().min(15).max(240).optional(),
});
const updateServiceSchema = createServiceSchema.partial().extend({
    isActive: zod_1.z.boolean().optional(),
});
const createTransactionSchema = zod_1.z.object({
    type: zod_1.z.enum(['INCOME', 'EXPENSE']),
    amount: zod_1.z.number().positive('Valor deve ser positivo'),
    description: zod_1.z.string().min(1, 'Descrição é obrigatória'),
    date: zod_1.z.string().optional(),
    paymentMethod: zod_1.z.string().optional(),
    isPaid: zod_1.z.boolean().optional(),
    patientId: zod_1.z.string().uuid().optional(),
    serviceId: zod_1.z.string().uuid().optional(),
    appointmentId: zod_1.z.string().uuid().optional(),
});
const updateTransactionSchema = zod_1.z.object({
    amount: zod_1.z.number().positive().optional(),
    description: zod_1.z.string().optional(),
    date: zod_1.z.string().optional(),
    paymentMethod: zod_1.z.string().optional(),
    isPaid: zod_1.z.boolean().optional(),
});
class FinancialController {
    constructor() {
        // ====== SERVIÇOS ======
        this.listServices = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const psychologistId = req.psychologist.psychologistId;
            const includeInactive = req.query.includeInactive === 'true';
            const services = await financialService.listServices(psychologistId, includeInactive);
            res.json({ data: services });
        });
        this.getService = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const psychologistId = req.psychologist.psychologistId;
            const { id } = req.params;
            const service = await financialService.getService(id, psychologistId);
            res.json({ data: service });
        });
        this.createService = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const psychologistId = req.psychologist.psychologistId;
            const data = createServiceSchema.parse(req.body);
            const service = await financialService.createService(psychologistId, data);
            res.status(201).json({
                message: 'Serviço criado com sucesso',
                data: service,
            });
        });
        this.updateService = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const psychologistId = req.psychologist.psychologistId;
            const { id } = req.params;
            const data = updateServiceSchema.parse(req.body);
            const service = await financialService.updateService(id, psychologistId, data);
            res.json({
                message: 'Serviço atualizado com sucesso',
                data: service,
            });
        });
        this.deleteService = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const psychologistId = req.psychologist.psychologistId;
            const { id } = req.params;
            const result = await financialService.deleteService(id, psychologistId);
            res.json(result);
        });
        // ====== TRANSAÇÕES ======
        this.listTransactions = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const psychologistId = req.psychologist.psychologistId;
            const { type, startDate, endDate, patientId, serviceId } = req.query;
            const filters = {};
            if (type)
                filters.type = type;
            if (startDate)
                filters.startDate = new Date(startDate);
            if (endDate)
                filters.endDate = new Date(endDate);
            if (patientId)
                filters.patientId = patientId;
            if (serviceId)
                filters.serviceId = serviceId;
            const transactions = await financialService.listTransactions(psychologistId, filters);
            res.json({ data: transactions });
        });
        this.createTransaction = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const psychologistId = req.psychologist.psychologistId;
            const data = createTransactionSchema.parse(req.body);
            const transaction = await financialService.createTransaction(psychologistId, data);
            res.status(201).json({
                message: 'Transação criada com sucesso',
                data: transaction,
            });
        });
        this.updateTransaction = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const psychologistId = req.psychologist.psychologistId;
            const { id } = req.params;
            const data = updateTransactionSchema.parse(req.body);
            const transaction = await financialService.updateTransaction(id, psychologistId, data);
            res.json({
                message: 'Transação atualizada com sucesso',
                data: transaction,
            });
        });
        this.deleteTransaction = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const psychologistId = req.psychologist.psychologistId;
            const { id } = req.params;
            const result = await financialService.deleteTransaction(id, psychologistId);
            res.json(result);
        });
        // ====== RESUMO ======
        this.getSummary = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const psychologistId = req.psychologist.psychologistId;
            const { month, year } = req.query;
            const summary = await financialService.getFinancialSummary(psychologistId, month ? parseInt(month) : undefined, year ? parseInt(year) : undefined);
            res.json({ data: summary });
        });
    }
}
exports.FinancialController = FinancialController;
//# sourceMappingURL=FinancialController.js.map