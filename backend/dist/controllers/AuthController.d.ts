/**
 * Auth Controller
 * Orquestra requisições de autenticação
 */
import { Request, Response } from 'express';
export declare class AuthController {
    register: (req: Request, res: Response, next: import("express").NextFunction) => void;
    login: (req: Request, res: Response, next: import("express").NextFunction) => void;
    refreshToken: (req: Request, res: Response, next: import("express").NextFunction) => void;
    me: (req: Request, res: Response, next: import("express").NextFunction) => void;
}
//# sourceMappingURL=AuthController.d.ts.map