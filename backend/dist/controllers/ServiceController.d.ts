/**
 * Service Controller
 * Gerenciamento de serviços oferecidos pelo psicólogo
 */
import { Request, Response } from 'express';
export declare class ServiceController {
    /**
     * Lista todos os serviços do psicólogo
     */
    list: (req: Request, res: Response, next: import("express").NextFunction) => void;
    /**
     * Busca um serviço específico
     */
    get: (req: Request, res: Response, next: import("express").NextFunction) => void;
    /**
     * Cria um novo serviço
     */
    create: (req: Request, res: Response, next: import("express").NextFunction) => void;
    /**
     * Atualiza um serviço
     */
    update: (req: Request, res: Response, next: import("express").NextFunction) => void;
    /**
     * Desativa um serviço
     */
    deactivate: (req: Request, res: Response, next: import("express").NextFunction) => void;
}
//# sourceMappingURL=ServiceController.d.ts.map