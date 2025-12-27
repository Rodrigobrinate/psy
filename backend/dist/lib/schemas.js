"use strict";
/**
 * Schemas de Validação com Zod
 * Single Source of Truth para validação front-end e back-end
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitTestResponseSchema = exports.updateAppointmentSchema = exports.createAppointmentSchema = exports.updatePatientSchema = exports.createPatientSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
// ====================================
// AUTH SCHEMAS
// ====================================
exports.registerSchema = zod_1.z.object({
    email: zod_1.z.string().email('Email inválido'),
    password: zod_1.z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
    name: zod_1.z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
    crp: zod_1.z.string().regex(/^CRP\s\d{2}\/\d{5,6}$/, 'CRP inválido (formato: CRP XX/XXXXX)'),
    phone: zod_1.z.string().optional(),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Email inválido'),
    password: zod_1.z.string().min(1, 'Senha é obrigatória'),
});
// ====================================
// PATIENT SCHEMAS
// ====================================
exports.createPatientSchema = zod_1.z.object({
    name: zod_1.z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
    email: zod_1.z.string().email('Email inválido').optional().or(zod_1.z.literal('')),
    phone: zod_1.z.string().optional(),
    birthDate: zod_1.z.string().datetime().optional(),
    cpf: zod_1.z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF inválido').optional(),
    clinicalSummary: zod_1.z.string().optional(),
    emergencyContact: zod_1.z.string().optional(),
});
exports.updatePatientSchema = exports.createPatientSchema.partial();
// ====================================
// APPOINTMENT SCHEMAS
// ====================================
exports.createAppointmentSchema = zod_1.z.object({
    patientId: zod_1.z.string().uuid('ID do paciente inválido'),
    scheduledAt: zod_1.z.string().datetime('Data/hora inválida'),
    durationMinutes: zod_1.z.number().int().min(15).max(240).default(50),
    notes: zod_1.z.string().optional(),
});
exports.updateAppointmentSchema = zod_1.z.object({
    scheduledAt: zod_1.z.string().datetime().optional(),
    status: zod_1.z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
    notes: zod_1.z.string().optional(),
    aiSuggestions: zod_1.z.any().optional(),
});
// ====================================
// TEST SCHEMAS
// ====================================
exports.submitTestResponseSchema = zod_1.z.object({
    testId: zod_1.z.string().uuid('ID do teste inválido'),
    patientId: zod_1.z.string().uuid('ID do paciente inválido'),
    applicationMode: zod_1.z.enum(['remote', 'in_office']).optional(),
    responses: zod_1.z.array(zod_1.z.object({
        questionId: zod_1.z.string().uuid('ID da questão inválido'),
        selectedValue: zod_1.z.number().int(),
        responseTime: zod_1.z.number().int().optional(),
    })),
});
//# sourceMappingURL=schemas.js.map