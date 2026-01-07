/**
 * Financial Service
 * Regras de negócio para serviços e transações financeiras
 */
type TransactionType = 'INCOME' | 'EXPENSE';
export declare class FinancialService {
    listServices(psychologistId: string, includeInactive?: boolean): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        psychologistId: string;
        durationMinutes: number;
        description: string | null;
        defaultPrice: number;
    }[]>;
    getService(serviceId: string, psychologistId: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        psychologistId: string;
        durationMinutes: number;
        description: string | null;
        defaultPrice: number;
    }>;
    createService(psychologistId: string, data: {
        name: string;
        description?: string;
        defaultPrice: number;
        durationMinutes?: number;
    }): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        psychologistId: string;
        durationMinutes: number;
        description: string | null;
        defaultPrice: number;
    }>;
    updateService(serviceId: string, psychologistId: string, data: {
        name?: string;
        description?: string;
        defaultPrice?: number;
        durationMinutes?: number;
        isActive?: boolean;
    }): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        psychologistId: string;
        durationMinutes: number;
        description: string | null;
        defaultPrice: number;
    }>;
    deleteService(serviceId: string, psychologistId: string): Promise<{
        message: string;
    }>;
    listTransactions(psychologistId: string, filters?: {
        type?: TransactionType;
        startDate?: Date;
        endDate?: Date;
        patientId?: string;
        serviceId?: string;
    }): Promise<({
        patient: {
            name: string;
            id: string;
        } | null;
        service: {
            name: string;
            id: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        psychologistId: string;
        patientId: string | null;
        serviceId: string | null;
        description: string;
        type: import("../generated/prisma").$Enums.TransactionType;
        amount: number;
        date: Date;
        paymentMethod: string | null;
        isPaid: boolean;
        paidAt: Date | null;
        appointmentId: string | null;
    })[]>;
    createTransaction(psychologistId: string, data: {
        type: TransactionType;
        amount: number;
        description: string;
        date?: string;
        paymentMethod?: string;
        isPaid?: boolean;
        patientId?: string;
        serviceId?: string;
        appointmentId?: string;
    }): Promise<{
        patient: {
            name: string;
            id: string;
        } | null;
        service: {
            name: string;
            id: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        psychologistId: string;
        patientId: string | null;
        serviceId: string | null;
        description: string;
        type: import("../generated/prisma").$Enums.TransactionType;
        amount: number;
        date: Date;
        paymentMethod: string | null;
        isPaid: boolean;
        paidAt: Date | null;
        appointmentId: string | null;
    }>;
    updateTransaction(transactionId: string, psychologistId: string, data: {
        amount?: number;
        description?: string;
        date?: string;
        paymentMethod?: string;
        isPaid?: boolean;
    }): Promise<{
        patient: {
            name: string;
            id: string;
        } | null;
        service: {
            name: string;
            id: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        psychologistId: string;
        patientId: string | null;
        serviceId: string | null;
        description: string;
        type: import("../generated/prisma").$Enums.TransactionType;
        amount: number;
        date: Date;
        paymentMethod: string | null;
        isPaid: boolean;
        paidAt: Date | null;
        appointmentId: string | null;
    }>;
    deleteTransaction(transactionId: string, psychologistId: string): Promise<{
        message: string;
    }>;
    getFinancialSummary(psychologistId: string, month?: number, year?: number): Promise<{
        month: number;
        year: number;
        income: number;
        expenses: number;
        balance: number;
        pending: number;
        transactionCount: number;
    }>;
}
export {};
//# sourceMappingURL=FinancialService.d.ts.map