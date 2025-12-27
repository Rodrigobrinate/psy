/**
 * Error Handler Middleware
 * Tratamento global de erros para evitar vazamento de informações sensíveis
 */
import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
export declare class AppError extends Error {
    message: string;
    statusCode: number;
    isOperational: boolean;
    constructor(message: string, statusCode?: number, isOperational?: boolean);
}
export declare const errorHandler: (err: Error | AppError | ZodError, req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
export declare const asyncHandler: (fn: Function) => (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=errorHandler.d.ts.map