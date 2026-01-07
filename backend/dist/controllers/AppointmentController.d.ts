/**
 * Appointment Controller
 * Handlers HTTP para agendamentos
 */
import { Request, Response } from 'express';
export declare class AppointmentController {
    list: (req: Request, res: Response, next: import("express").NextFunction) => void;
    get: (req: Request, res: Response, next: import("express").NextFunction) => void;
    create: (req: Request, res: Response, next: import("express").NextFunction) => void;
    update: (req: Request, res: Response, next: import("express").NextFunction) => void;
    cancel: (req: Request, res: Response, next: import("express").NextFunction) => void;
    stats: (req: Request, res: Response, next: import("express").NextFunction) => void;
    activeSession: (req: Request, res: Response, next: import("express").NextFunction) => void;
}
//# sourceMappingURL=AppointmentController.d.ts.map