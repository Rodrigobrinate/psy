/**
 * Authentication Middleware
 * Verifica JWT e anexa o psicólogo autenticado ao Request
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler';

export interface AuthPayload {
  psychologistId: string;
  email: string;
  planType: 'BASIC' | 'PRO';
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      psychologist?: AuthPayload;
    }
  }
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Token não fornecido', 401);
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'fallback-secret'
    ) as AuthPayload;

    req.psychologist = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new AppError('Token inválido', 401));
    }
    if (error instanceof jwt.TokenExpiredError) {
      return next(new AppError('Token expirado', 401));
    }
    next(error);
  }
};

// Middleware para verificar plano Pro
export const requireProPlan = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.psychologist) {
    return next(new AppError('Não autenticado', 401));
  }

  if (req.psychologist.planType !== 'PRO') {
    return next(
      new AppError(
        'Esta funcionalidade requer o plano Pro. Faça upgrade para desbloquear.',
        403
      )
    );
  }

  next();
};
