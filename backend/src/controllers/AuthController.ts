/**
 * Auth Controller
 * Orquestra requisições de autenticação
 */

import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { registerSchema, loginSchema } from '../lib/schemas';
import { asyncHandler } from '../middlewares/errorHandler';

const authService = new AuthService();

export class AuthController {
  register = asyncHandler(async (req: Request, res: Response) => {
    // Valida dados
    const validatedData = registerSchema.parse(req.body);

    // Chama service
    const result = await authService.register(validatedData);

    res.status(201).json({
      message: 'Psicólogo registrado com sucesso',
      data: result,
    });
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    // Valida dados
    const validatedData = loginSchema.parse(req.body);

    // Chama service
    const result = await authService.login(validatedData);

    res.json({
      message: 'Login realizado com sucesso',
      data: result,
    });
  });

  refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token não fornecido' });
    }

    const tokens = await authService.refreshToken(refreshToken);

    res.json({
      message: 'Token renovado com sucesso',
      data: tokens,
    });
  });

  me = asyncHandler(async (req: Request, res: Response) => {
    // Retorna dados do psicólogo autenticado
    res.json({
      data: req.psychologist,
    });
  });
}
