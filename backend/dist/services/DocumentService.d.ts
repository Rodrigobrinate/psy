/**
 * Document Service
 * Regras de negócio para documentos (receitas, laudos, atestados)
 */
import { Prisma } from '../generated/prisma';
type DocumentType = 'PRESCRIPTION' | 'REPORT' | 'CERTIFICATE' | 'DECLARATION' | 'REFERRAL' | 'OTHER';
interface Medication {
    name: string;
    dosage: string;
    instructions: string;
    quantity?: string;
}
export declare class DocumentService {
    /**
     * Lista todos os documentos de um psicólogo
     */
    listDocuments(psychologistId: string, filters?: {
        type?: DocumentType;
        patientId?: string;
        startDate?: Date;
        endDate?: Date;
    }): Promise<({
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
        patientId: string;
        type: import("../generated/prisma").$Enums.DocumentType;
        appointmentId: string | null;
        title: string;
        content: string;
        medications: Prisma.JsonValue | null;
        cid10Code: string | null;
        diagnosis: string | null;
        issuedAt: Date;
        validUntil: Date | null;
    })[]>;
    /**
     * Busca um documento específico
     */
    getDocument(documentId: string, psychologistId: string): Promise<{
        psychologist: {
            name: string;
            id: string;
            email: string;
            crp: string;
            digitalSignature: string | null;
        };
        patient: {
            name: string;
            id: string;
            email: string | null;
            phone: string | null;
            birthDate: Date | null;
            cpf: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        psychologistId: string;
        patientId: string;
        type: import("../generated/prisma").$Enums.DocumentType;
        appointmentId: string | null;
        title: string;
        content: string;
        medications: Prisma.JsonValue | null;
        cid10Code: string | null;
        diagnosis: string | null;
        issuedAt: Date;
        validUntil: Date | null;
    }>;
    /**
     * Cria um novo documento
     */
    createDocument(psychologistId: string, data: {
        type: DocumentType;
        title: string;
        content: string;
        patientId: string;
        appointmentId?: string;
        medications?: Medication[];
        cid10Code?: string;
        diagnosis?: string;
        validUntil?: string;
    }): Promise<{
        patient: {
            name: string;
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        psychologistId: string;
        patientId: string;
        type: import("../generated/prisma").$Enums.DocumentType;
        appointmentId: string | null;
        title: string;
        content: string;
        medications: Prisma.JsonValue | null;
        cid10Code: string | null;
        diagnosis: string | null;
        issuedAt: Date;
        validUntil: Date | null;
    }>;
    /**
     * Atualiza um documento
     */
    updateDocument(documentId: string, psychologistId: string, data: {
        title?: string;
        content?: string;
        medications?: Medication[];
        cid10Code?: string;
        diagnosis?: string;
        validUntil?: string;
    }): Promise<{
        patient: {
            name: string;
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        psychologistId: string;
        patientId: string;
        type: import("../generated/prisma").$Enums.DocumentType;
        appointmentId: string | null;
        title: string;
        content: string;
        medications: Prisma.JsonValue | null;
        cid10Code: string | null;
        diagnosis: string | null;
        issuedAt: Date;
        validUntil: Date | null;
    }>;
    /**
     * Exclui um documento
     */
    deleteDocument(documentId: string, psychologistId: string): Promise<{
        message: string;
    }>;
    /**
     * Lista documentos de um paciente
     */
    getPatientDocuments(patientId: string, psychologistId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        psychologistId: string;
        patientId: string;
        type: import("../generated/prisma").$Enums.DocumentType;
        appointmentId: string | null;
        title: string;
        content: string;
        medications: Prisma.JsonValue | null;
        cid10Code: string | null;
        diagnosis: string | null;
        issuedAt: Date;
        validUntil: Date | null;
    }[]>;
    /**
     * Gera conteúdo padrão para um tipo de documento
     */
    getDocumentTemplate(type: DocumentType, patientName: string, psychologistName: string, crp: string): {
        title: string;
        content: string;
    };
}
export {};
//# sourceMappingURL=DocumentService.d.ts.map