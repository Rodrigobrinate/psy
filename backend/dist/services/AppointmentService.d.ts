/**
 * Appointment Service
 * Regras de negócio para gerenciamento de agendamentos
 */
import { CreateAppointmentInput, UpdateAppointmentInput } from '../lib/schemas';
import { AppointmentStatus } from '../generated/prisma';
export declare class AppointmentService {
    private aiService;
    constructor();
    /**
     * Lista todos os agendamentos de um psicólogo
     */
    listAppointments(psychologistId: string, filters?: {
        startDate?: Date;
        endDate?: Date;
        status?: AppointmentStatus;
        patientId?: string;
    }): Promise<({
        patient: {
            name: string;
            id: string;
            email: string | null;
            phone: string | null;
        };
        service: {
            name: string;
            id: string;
            durationMinutes: number;
            defaultPrice: number;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        psychologistId: string;
        scheduledAt: Date;
        status: import("../generated/prisma").$Enums.AppointmentStatus;
        durationMinutes: number;
        notes: string | null;
        aiSuggestions: import("../generated/prisma/runtime/client").JsonValue | null;
        audioUrl: string | null;
        transcription: string | null;
        transcriptionProcessedAt: Date | null;
        patientId: string;
        serviceId: string | null;
    })[]>;
    /**
     * Busca agendamentos de um dia específico
     */
    getAppointmentsByDate(psychologistId: string, date: Date): Promise<({
        patient: {
            name: string;
            id: string;
            email: string | null;
            phone: string | null;
        };
        service: {
            name: string;
            id: string;
            durationMinutes: number;
            defaultPrice: number;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        psychologistId: string;
        scheduledAt: Date;
        status: import("../generated/prisma").$Enums.AppointmentStatus;
        durationMinutes: number;
        notes: string | null;
        aiSuggestions: import("../generated/prisma/runtime/client").JsonValue | null;
        audioUrl: string | null;
        transcription: string | null;
        transcriptionProcessedAt: Date | null;
        patientId: string;
        serviceId: string | null;
    })[]>;
    /**
     * Busca um agendamento específico
     */
    getAppointment(appointmentId: string, psychologistId: string): Promise<{
        patient: {
            name: string;
            id: string;
            email: string | null;
            phone: string | null;
            birthDate: Date | null;
            clinicalSummary: string | null;
        };
        service: {
            name: string;
            id: string;
            durationMinutes: number;
            defaultPrice: number;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        psychologistId: string;
        scheduledAt: Date;
        status: import("../generated/prisma").$Enums.AppointmentStatus;
        durationMinutes: number;
        notes: string | null;
        aiSuggestions: import("../generated/prisma/runtime/client").JsonValue | null;
        audioUrl: string | null;
        transcription: string | null;
        transcriptionProcessedAt: Date | null;
        patientId: string;
        serviceId: string | null;
    }>;
    /**
     * Cria um novo agendamento
     */
    createAppointment(psychologistId: string, data: CreateAppointmentInput): Promise<{
        patient: {
            name: string;
            id: string;
            email: string | null;
        };
        service: {
            name: string;
            id: string;
            durationMinutes: number;
            defaultPrice: number;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        psychologistId: string;
        scheduledAt: Date;
        status: import("../generated/prisma").$Enums.AppointmentStatus;
        durationMinutes: number;
        notes: string | null;
        aiSuggestions: import("../generated/prisma/runtime/client").JsonValue | null;
        audioUrl: string | null;
        transcription: string | null;
        transcriptionProcessedAt: Date | null;
        patientId: string;
        serviceId: string | null;
    }>;
    /**
     * Atualiza um agendamento
     */
    updateAppointment(appointmentId: string, psychologistId: string, data: UpdateAppointmentInput): Promise<{
        patient: {
            name: string;
            id: string;
            email: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        psychologistId: string;
        scheduledAt: Date;
        status: import("../generated/prisma").$Enums.AppointmentStatus;
        durationMinutes: number;
        notes: string | null;
        aiSuggestions: import("../generated/prisma/runtime/client").JsonValue | null;
        audioUrl: string | null;
        transcription: string | null;
        transcriptionProcessedAt: Date | null;
        patientId: string;
        serviceId: string | null;
    }>;
    /**
     * Cancela um agendamento
     */
    cancelAppointment(appointmentId: string, psychologistId: string): Promise<{
        message: string;
    }>;
    /**
     * Retorna estatísticas de agendamentos
     */
    getAppointmentStats(psychologistId: string): Promise<{
        today: number;
        thisWeek: number;
        upcoming: number;
    }>;
    /**
     * Verifica se há uma sessão ativa (IN_PROGRESS)
     */
    getActiveSession(psychologistId: string): Promise<({
        patient: {
            name: string;
            id: string;
            email: string | null;
            phone: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        psychologistId: string;
        scheduledAt: Date;
        status: import("../generated/prisma").$Enums.AppointmentStatus;
        durationMinutes: number;
        notes: string | null;
        aiSuggestions: import("../generated/prisma/runtime/client").JsonValue | null;
        audioUrl: string | null;
        transcription: string | null;
        transcriptionProcessedAt: Date | null;
        patientId: string;
        serviceId: string | null;
    }) | null>;
}
//# sourceMappingURL=AppointmentService.d.ts.map