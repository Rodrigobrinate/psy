/**
 * Patient Controller
 * Orquestra requisições relacionadas a pacientes
 */
import { Request, Response } from 'express';
export declare class PatientController {
    list: (req: Request, res: Response, next: import("express").NextFunction) => void;
    get: (req: Request, res: Response, next: import("express").NextFunction) => void;
    create: (req: Request, res: Response, next: import("express").NextFunction) => void;
    update: (req: Request, res: Response, next: import("express").NextFunction) => void;
    delete: (req: Request, res: Response, next: import("express").NextFunction) => void;
    permanentDelete: (req: Request, res: Response, next: import("express").NextFunction) => void;
}
//# sourceMappingURL=PatientController.d.ts.map