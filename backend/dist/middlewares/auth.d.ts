/**
 * Authentication Middleware
 * Verifica JWT e anexa o psicólogo autenticado ao Request
 */
import { Request, Response, NextFunction } from 'express';
export interface AuthPayload {
    psychologistId: string;
    email: string;
    planType: 'BASIC' | 'PRO';
}
declare global {
    namespace Express {
        interface Request {
            psychologist?: AuthPayload;
        }
    }
}
export declare const authenticate: (req: Request, res: Response, next: NextFunction) => void;
export declare const requireProPlan: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.d.ts.map