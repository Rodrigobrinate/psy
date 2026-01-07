"use strict";
/**
 * Service Service
 * Regras de negócio para gerenciamento de serviços
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceService = void 0;
const prisma_1 = require("../lib/prisma");
const errorHandler_1 = require("../middlewares/errorHandler");
class ServiceService {
    /**
     * Lista todos os serviços de um psicólogo
     */
    async listServices(psychologistId, includeInactive = false) {
        const where = { psychologistId };
        if (!includeInactive) {
            where.isActive = true;
        }
        const services = await prisma_1.prisma.service.findMany({
            where,
            orderBy: { name: 'asc' },
        });
        return services;
    }
    /**
     * Busca um serviço específico
     */
    async getService(serviceId, psychologistId) {
        const service = await prisma_1.prisma.service.findFirst({
            where: {
                id: serviceId,
                psychologistId,
            },
        });
        if (!service) {
            throw new errorHandler_1.AppError('Serviço não encontrado', 404);
        }
        return service;
    }
    /**
     * Cria um novo serviço
     */
    async createService(psychologistId, data) {
        const service = await prisma_1.prisma.service.create({
            data: {
                ...data,
                psychologistId,
            },
        });
        return service;
    }
    /**
     * Atualiza um serviço
     */
    async updateService(serviceId, psychologistId, data) {
        const service = await prisma_1.prisma.service.findFirst({
            where: {
                id: serviceId,
                psychologistId,
            },
        });
        if (!service) {
            throw new errorHandler_1.AppError('Serviço não encontrado', 404);
        }
        const updatedService = await prisma_1.prisma.service.update({
            where: { id: serviceId },
            data,
        });
        return updatedService;
    }
    /**
     * Desativa um serviço (soft delete)
     */
    async deactivateService(serviceId, psychologistId) {
        const service = await prisma_1.prisma.service.findFirst({
            where: {
                id: serviceId,
                psychologistId,
            },
        });
        if (!service) {
            throw new errorHandler_1.AppError('Serviço não encontrado', 404);
        }
        const updatedService = await prisma_1.prisma.service.update({
            where: { id: serviceId },
            data: { isActive: false },
        });
        return updatedService;
    }
}
exports.ServiceService = ServiceService;
//# sourceMappingURL=ServiceService.js.map