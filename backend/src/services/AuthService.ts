/**
 * Auth Service
 * Regras de negócio para autenticação e autorização
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { AppError } from '../middlewares/errorHandler';
import { RegisterInput, LoginInput } from '../lib/schemas';

export class AuthService {
  /**
   * Registra um novo psicólogo no sistema
   */
  async register(data: RegisterInput) {
    // Verifica se o email já existe
    const existingPsychologist = await prisma.psychologist.findUnique({
      where: { email: data.email },
    });

    if (existingPsychologist) {
      throw new AppError('Email já cadastrado', 400);
    }

    // Verifica se o CRP já existe
    const existingCRP = await prisma.psychologist.findUnique({
      where: { crp: data.crp },
    });

    if (existingCRP) {
      throw new AppError('CRP já cadastrado', 400);
    }

    // Hash da senha
    const passwordHash = await bcrypt.hash(data.password, 10);

    // Cria o psicólogo
    const psychologist = await prisma.psychologist.create({
      data: {
        email: data.email,
        passwordHash,
        name: data.name,
        crp: data.crp,
        phone: data.phone,
      },
      select: {
        id: true,
        email: true,
        name: true,
        crp: true,
        planType: true,
        createdAt: true,
      },
    });

    // Gera tokens
    const tokens = this.generateTokens(psychologist.id, psychologist.email, psychologist.planType);

    return {
      psychologist,
      ...tokens,
    };
  }

  /**
   * Realiza login de um psicólogo
   */
  async login(data: LoginInput) {
    // Busca o psicólogo
    const psychologist = await prisma.psychologist.findUnique({
      where: { email: data.email },
    });

    if (!psychologist) {
      throw new AppError('Credenciais inválidas', 401);
    }

    // Verifica a senha
    const isValidPassword = await bcrypt.compare(
      data.password,
      psychologist.passwordHash
    );

    if (!isValidPassword) {
      throw new AppError('Credenciais inválidas', 401);
    }

    // Gera tokens
    const tokens = this.generateTokens(
      psychologist.id,
      psychologist.email,
      psychologist.planType
    );

    return {
      psychologist: {
        id: psychologist.id,
        email: psychologist.email,
        name: psychologist.name,
        crp: psychologist.crp,
        planType: psychologist.planType,
      },
      ...tokens,
    };
  }

  /**
   * Gera Access Token e Refresh Token
   */
  private generateTokens(
    psychologistId: string,
    email: string,
    planType: 'BASIC' | 'PRO'
  ) {
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret';
    const jwtExpires = process.env.JWT_EXPIRES_IN || '1h';
    const refreshSecret = process.env.REFRESH_TOKEN_SECRET || 'fallback-refresh-secret';
    const refreshExpires = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

    const accessToken = jwt.sign(
      { psychologistId, email, planType },
      jwtSecret,
      { expiresIn: jwtExpires } as jwt.SignOptions
    );

    const refreshToken = jwt.sign(
      { psychologistId },
      refreshSecret,
      { expiresIn: refreshExpires } as jwt.SignOptions
    );

    return { accessToken, refreshToken };
  }

  /**
   * Renova o Access Token usando o Refresh Token
   */
  async refreshToken(refreshToken: string) {
    try {
      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET || 'fallback-refresh-secret'
      ) as { psychologistId: string };

      // Busca o psicólogo atualizado
      const psychologist = await prisma.psychologist.findUnique({
        where: { id: decoded.psychologistId },
      });

      if (!psychologist) {
        throw new AppError('Psicólogo não encontrado', 404);
      }

      // Gera novos tokens
      const tokens = this.generateTokens(
        psychologist.id,
        psychologist.email,
        psychologist.planType
      );

      return tokens;
    } catch (error) {
      throw new AppError('Refresh token inválido', 401);
    }
  }
}
