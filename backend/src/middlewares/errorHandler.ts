/**
 * Error Handler Middleware
 * Tratamento global de erros para evitar vazamento de informações sensíveis
 */

import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorHandler = (
  err: Error | AppError | ZodError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Zod Validation Errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Erro de validação',
      details: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  // Application Errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
    });
  }

  // Unknown Errors (não expor stack trace em produção)
  console.error('❌ Unexpected Error:', err);

  return res.status(500).json({
    error:
      process.env.NODE_ENV === 'production'
        ? 'Erro interno do servidor'
        : err.message,
  });
};

// Async handler para evitar try-catch em todo controller
export const asyncHandler =
  (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
