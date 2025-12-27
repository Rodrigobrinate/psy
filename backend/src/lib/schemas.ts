/**
 * Schemas de Validação com Zod
 * Single Source of Truth para validação front-end e back-end
 */

import { z } from 'zod';

// ====================================
// AUTH SCHEMAS
// ====================================

export const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  crp: z.string().regex(/^CRP\s\d{2}\/\d{5,6}$/, 'CRP inválido (formato: CRP XX/XXXXX)'),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

// ====================================
// PATIENT SCHEMAS
// ====================================

export const createPatientSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  birthDate: z.string().datetime().optional(),
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF inválido').optional(),
  clinicalSummary: z.string().optional(),
  emergencyContact: z.string().optional(),
});

export const updatePatientSchema = createPatientSchema.partial();

// ====================================
// APPOINTMENT SCHEMAS
// ====================================

export const createAppointmentSchema = z.object({
  patientId: z.string().uuid('ID do paciente inválido'),
  scheduledAt: z.string().datetime('Data/hora inválida'),
  durationMinutes: z.number().int().min(15).max(240).default(50),
  notes: z.string().optional(),
});

export const updateAppointmentSchema = z.object({
  scheduledAt: z.string().datetime().optional(),
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  notes: z.string().optional(),
  aiSuggestions: z.any().optional(),
});

// ====================================
// TEST SCHEMAS
// ====================================

export const submitTestResponseSchema = z.object({
  testId: z.string().uuid('ID do teste inválido'),
  patientId: z.string().uuid('ID do paciente inválido'),
  applicationMode: z.enum(['remote', 'in_office']).optional(),
  responses: z.array(
    z.object({
      questionId: z.string().uuid('ID da questão inválido'),
      selectedValue: z.number().int(),
      responseTime: z.number().int().optional(),
    })
  ),
});

// ====================================
// TYPE EXPORTS
// ====================================

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreatePatientInput = z.infer<typeof createPatientSchema>;
export type UpdatePatientInput = z.infer<typeof updatePatientSchema>;
export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>;
export type SubmitTestResponseInput = z.infer<typeof submitTestResponseSchema>;
