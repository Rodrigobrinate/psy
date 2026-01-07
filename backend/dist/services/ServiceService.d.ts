/**
 * Service Service
 * Regras de negócio para gerenciamento de serviços
 */
import { CreateServiceInput, UpdateServiceInput } from '../lib/schemas';
export declare class ServiceService {
    /**
     * Lista todos os serviços de um psicólogo
     */
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
    /**
     * Busca um serviço específico
     */
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
    /**
     * Cria um novo serviço
     */
    createService(psychologistId: string, data: CreateServiceInput): Promise<{
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
    /**
     * Atualiza um serviço
     */
    updateService(serviceId: string, psychologistId: string, data: UpdateServiceInput): Promise<{
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
    /**
     * Desativa um serviço (soft delete)
     */
    deactivateService(serviceId: string, psychologistId: string): Promise<{
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
}
//# sourceMappingURL=ServiceService.d.ts.map