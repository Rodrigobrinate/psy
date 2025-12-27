"use strict";
/**
 * Auth Service
 * Regras de negócio para autenticação e autorização
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../lib/prisma");
const errorHandler_1 = require("../middlewares/errorHandler");
class AuthService {
    /**
     * Registra um novo psicólogo no sistema
     */
    async register(data) {
        // Verifica se o email já existe
        const existingPsychologist = await prisma_1.prisma.psychologist.findUnique({
            where: { email: data.email },
        });
        if (existingPsychologist) {
            throw new errorHandler_1.AppError('Email já cadastrado', 400);
        }
        // Verifica se o CRP já existe
        const existingCRP = await prisma_1.prisma.psychologist.findUnique({
            where: { crp: data.crp },
        });
        if (existingCRP) {
            throw new errorHandler_1.AppError('CRP já cadastrado', 400);
        }
        // Hash da senha
        const passwordHash = await bcryptjs_1.default.hash(data.password, 10);
        // Cria o psicólogo
        const psychologist = await prisma_1.prisma.psychologist.create({
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
    async login(data) {
        // Busca o psicólogo
        const psychologist = await prisma_1.prisma.psychologist.findUnique({
            where: { email: data.email },
        });
        if (!psychologist) {
            throw new errorHandler_1.AppError('Credenciais inválidas', 401);
        }
        // Verifica a senha
        const isValidPassword = await bcryptjs_1.default.compare(data.password, psychologist.passwordHash);
        if (!isValidPassword) {
            throw new errorHandler_1.AppError('Credenciais inválidas', 401);
        }
        // Gera tokens
        const tokens = this.generateTokens(psychologist.id, psychologist.email, psychologist.planType);
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
    generateTokens(psychologistId, email, planType) {
        const jwtSecret = process.env.JWT_SECRET || 'fallback-secret';
        const jwtExpires = process.env.JWT_EXPIRES_IN || '1h';
        const refreshSecret = process.env.REFRESH_TOKEN_SECRET || 'fallback-refresh-secret';
        const refreshExpires = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';
        const accessToken = jsonwebtoken_1.default.sign({ psychologistId, email, planType }, jwtSecret, { expiresIn: jwtExpires });
        const refreshToken = jsonwebtoken_1.default.sign({ psychologistId }, refreshSecret, { expiresIn: refreshExpires });
        return { accessToken, refreshToken };
    }
    /**
     * Renova o Access Token usando o Refresh Token
     */
    async refreshToken(refreshToken) {
        try {
            const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET || 'fallback-refresh-secret');
            // Busca o psicólogo atualizado
            const psychologist = await prisma_1.prisma.psychologist.findUnique({
                where: { id: decoded.psychologistId },
            });
            if (!psychologist) {
                throw new errorHandler_1.AppError('Psicólogo não encontrado', 404);
            }
            // Gera novos tokens
            const tokens = this.generateTokens(psychologist.id, psychologist.email, psychologist.planType);
            return tokens;
        }
        catch (error) {
            throw new errorHandler_1.AppError('Refresh token inválido', 401);
        }
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=AuthService.js.map