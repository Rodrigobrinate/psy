/**
 * Patient Service
 * Regras de negócio para gerenciamento de pacientes
 */
import { CreatePatientInput, UpdatePatientInput } from '../lib/schemas';
export declare class PatientService {
    /**
     * Lista todos os pacientes de um psicólogo (apenas ativos por padrão)
     */
    listPatients(psychologistId: string, includeInactive?: boolean): Promise<{
        name: string;
        id: string;
        email: string | null;
        phone: string | null;
        createdAt: Date;
        birthDate: Date | null;
        isActive: boolean;
    }[]>;
    /**
     * Busca um paciente específico
     */
    getPatient(patientId: string, psychologistId: string): Promise<{
        appointments: {
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
        }[];
        testResults: ({
            test: {
                name: string;
                code: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            patientId: string;
            testId: string;
            totalScore: number;
            severityLevel: import("../generated/prisma").$Enums.SeverityLevel;
            interpretation: string | null;
            appliedAt: Date;
            applicationMode: string | null;
            aiInconsistencyFlag: boolean;
            aiAnalysis: string | null;
        })[];
    } & {
        name: string;
        id: string;
        email: string | null;
        phone: string | null;
        createdAt: Date;
        updatedAt: Date;
        birthDate: Date | null;
        cpf: string | null;
        clinicalSummary: string | null;
        emergencyContact: string | null;
        isActive: boolean;
        deletedAt: Date | null;
        psychologistId: string;
    }>;
    /**
     * Cria um novo paciente
     */
    createPatient(psychologistId: string, data: CreatePatientInput): Promise<{
        name: string;
        id: string;
        email: string | null;
        phone: string | null;
        createdAt: Date;
        updatedAt: Date;
        birthDate: Date | null;
        cpf: string | null;
        clinicalSummary: string | null;
        emergencyContact: string | null;
        isActive: boolean;
        deletedAt: Date | null;
        psychologistId: string;
    }>;
    /**
     * Atualiza um paciente
     */
    updatePatient(patientId: string, psychologistId: string, data: UpdatePatientInput): Promise<{
        name: string;
        id: string;
        email: string | null;
        phone: string | null;
        createdAt: Date;
        updatedAt: Date;
        birthDate: Date | null;
        cpf: string | null;
        clinicalSummary: string | null;
        emergencyContact: string | null;
        isActive: boolean;
        deletedAt: Date | null;
        psychologistId: string;
    }>;
    /**
     * Soft delete de um paciente (LGPD)
     */
    deletePatient(patientId: string, psychologistId: string): Promise<{
        message: string;
    }>;
    /**
     * Hard delete de um paciente (Direito ao Esquecimento - LGPD)
     */
    permanentDeletePatient(patientId: string, psychologistId: string): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=PatientService.d.ts.map