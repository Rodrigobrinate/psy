"use strict";
/**
 * Patient Service
 * Regras de negócio para gerenciamento de pacientes
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatientService = void 0;
const prisma_1 = require("../lib/prisma");
const errorHandler_1 = require("../middlewares/errorHandler");
class PatientService {
    /**
     * Lista todos os pacientes de um psicólogo (apenas ativos por padrão)
     */
    async listPatients(psychologistId, includeInactive = false) {
        const patients = await prisma_1.prisma.patient.findMany({
            where: {
                psychologistId,
                ...(includeInactive ? {} : { isActive: true, deletedAt: null }),
            },
            orderBy: { name: 'asc' },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                birthDate: true,
                createdAt: true,
                isActive: true,
            },
        });
        return patients;
    }
    /**
     * Busca um paciente específico
     */
    async getPatient(patientId, psychologistId) {
        const patient = await prisma_1.prisma.patient.findFirst({
            where: {
                id: patientId,
                psychologistId,
            },
            include: {
                appointments: {
                    orderBy: { scheduledAt: 'desc' },
                    take: 10,
                },
                testResults: {
                    orderBy: { appliedAt: 'desc' },
                    take: 10,
                    include: {
                        test: {
                            select: { name: true, code: true },
                        },
                    },
                },
            },
        });
        if (!patient) {
            throw new errorHandler_1.AppError('Paciente não encontrado', 404);
        }
        return patient;
    }
    /**
     * Cria um novo paciente
     */
    async createPatient(psychologistId, data) {
        // Validar CPF único se fornecido
        if (data.cpf) {
            const existingCPF = await prisma_1.prisma.patient.findUnique({
                where: { cpf: data.cpf },
            });
            if (existingCPF) {
                throw new errorHandler_1.AppError('CPF já cadastrado', 400);
            }
        }
        const patient = await prisma_1.prisma.patient.create({
            data: {
                ...data,
                birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
                psychologistId,
            },
        });
        return patient;
    }
    /**
     * Atualiza um paciente
     */
    async updatePatient(patientId, psychologistId, data) {
        // Verifica se o paciente pertence ao psicólogo
        const patient = await prisma_1.prisma.patient.findFirst({
            where: { id: patientId, psychologistId },
        });
        if (!patient) {
            throw new errorHandler_1.AppError('Paciente não encontrado', 404);
        }
        // Atualiza
        const updated = await prisma_1.prisma.patient.update({
            where: { id: patientId },
            data: {
                ...data,
                birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
            },
        });
        return updated;
    }
    /**
     * Soft delete de um paciente (LGPD)
     */
    async deletePatient(patientId, psychologistId) {
        const patient = await prisma_1.prisma.patient.findFirst({
            where: { id: patientId, psychologistId },
        });
        if (!patient) {
            throw new errorHandler_1.AppError('Paciente não encontrado', 404);
        }
        // Soft delete
        await prisma_1.prisma.patient.update({
            where: { id: patientId },
            data: {
                isActive: false,
                deletedAt: new Date(),
            },
        });
        return { message: 'Paciente desativado com sucesso' };
    }
    /**
     * Hard delete de um paciente (Direito ao Esquecimento - LGPD)
     */
    async permanentDeletePatient(patientId, psychologistId) {
        const patient = await prisma_1.prisma.patient.findFirst({
            where: { id: patientId, psychologistId },
        });
        if (!patient) {
            throw new errorHandler_1.AppError('Paciente não encontrado', 404);
        }
        // Hard delete (Prisma vai deletar em cascata as sessões e testes)
        await prisma_1.prisma.patient.delete({
            where: { id: patientId },
        });
        return { message: 'Todos os dados do paciente foram permanentemente removidos' };
    }
}
exports.PatientService = PatientService;
//# sourceMappingURL=PatientService.js.map