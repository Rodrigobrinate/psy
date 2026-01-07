/**
 * Schemas de Validação com Zod
 * Single Source of Truth para validação front-end e back-end
 */
import { z } from 'zod';
export declare const registerSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    name: z.ZodString;
    crp: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    email: string;
    crp: string;
    password: string;
    phone?: string | undefined;
}, {
    name: string;
    email: string;
    crp: string;
    password: string;
    phone?: string | undefined;
}>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const createPatientSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    phone: z.ZodOptional<z.ZodString>;
    birthDate: z.ZodOptional<z.ZodString>;
    cpf: z.ZodOptional<z.ZodPipeline<z.ZodEffects<z.ZodString, string, string>, z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>>>;
    clinicalSummary: z.ZodOptional<z.ZodString>;
    emergencyContact: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    email?: string | undefined;
    phone?: string | undefined;
    birthDate?: string | undefined;
    cpf?: string | undefined;
    clinicalSummary?: string | undefined;
    emergencyContact?: string | undefined;
}, {
    name: string;
    email?: string | undefined;
    phone?: string | undefined;
    birthDate?: string | undefined;
    cpf?: string | undefined;
    clinicalSummary?: string | undefined;
    emergencyContact?: string | undefined;
}>;
export declare const updatePatientSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>>;
    phone: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    birthDate: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    cpf: z.ZodOptional<z.ZodOptional<z.ZodPipeline<z.ZodEffects<z.ZodString, string, string>, z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>>>>;
    clinicalSummary: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    emergencyContact: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    email?: string | undefined;
    phone?: string | undefined;
    birthDate?: string | undefined;
    cpf?: string | undefined;
    clinicalSummary?: string | undefined;
    emergencyContact?: string | undefined;
}, {
    name?: string | undefined;
    email?: string | undefined;
    phone?: string | undefined;
    birthDate?: string | undefined;
    cpf?: string | undefined;
    clinicalSummary?: string | undefined;
    emergencyContact?: string | undefined;
}>;
export declare const createAppointmentSchema: z.ZodObject<{
    patientId: z.ZodString;
    scheduledAt: z.ZodString;
    durationMinutes: z.ZodDefault<z.ZodNumber>;
    notes: z.ZodOptional<z.ZodString>;
    serviceId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    scheduledAt: string;
    durationMinutes: number;
    patientId: string;
    notes?: string | undefined;
    serviceId?: string | undefined;
}, {
    scheduledAt: string;
    patientId: string;
    durationMinutes?: number | undefined;
    notes?: string | undefined;
    serviceId?: string | undefined;
}>;
export declare const updateAppointmentSchema: z.ZodObject<{
    scheduledAt: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]>>;
    notes: z.ZodOptional<z.ZodString>;
    aiSuggestions: z.ZodOptional<z.ZodAny>;
}, "strip", z.ZodTypeAny, {
    scheduledAt?: string | undefined;
    status?: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | undefined;
    notes?: string | undefined;
    aiSuggestions?: any;
}, {
    scheduledAt?: string | undefined;
    status?: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | undefined;
    notes?: string | undefined;
    aiSuggestions?: any;
}>;
export declare const createServiceSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    defaultPrice: z.ZodNumber;
    durationMinutes: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    name: string;
    durationMinutes: number;
    defaultPrice: number;
    description?: string | undefined;
}, {
    name: string;
    defaultPrice: number;
    durationMinutes?: number | undefined;
    description?: string | undefined;
}>;
export declare const updateServiceSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    defaultPrice: z.ZodOptional<z.ZodNumber>;
    durationMinutes: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    durationMinutes?: number | undefined;
    description?: string | undefined;
    defaultPrice?: number | undefined;
}, {
    name?: string | undefined;
    durationMinutes?: number | undefined;
    description?: string | undefined;
    defaultPrice?: number | undefined;
}>;
export declare const submitTestResponseSchema: z.ZodObject<{
    testId: z.ZodString;
    patientId: z.ZodString;
    applicationMode: z.ZodOptional<z.ZodEnum<["remote", "in_office"]>>;
    responses: z.ZodArray<z.ZodObject<{
        questionId: z.ZodString;
        selectedValue: z.ZodNumber;
        responseTime: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        questionId: string;
        selectedValue: number;
        responseTime?: number | undefined;
    }, {
        questionId: string;
        selectedValue: number;
        responseTime?: number | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    patientId: string;
    testId: string;
    responses: {
        questionId: string;
        selectedValue: number;
        responseTime?: number | undefined;
    }[];
    applicationMode?: "remote" | "in_office" | undefined;
}, {
    patientId: string;
    testId: string;
    responses: {
        questionId: string;
        selectedValue: number;
        responseTime?: number | undefined;
    }[];
    applicationMode?: "remote" | "in_office" | undefined;
}>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreatePatientInput = z.infer<typeof createPatientSchema>;
export type UpdatePatientInput = z.infer<typeof updatePatientSchema>;
export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>;
export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
export type SubmitTestResponseInput = z.infer<typeof submitTestResponseSchema>;
//# sourceMappingURL=schemas.d.ts.map