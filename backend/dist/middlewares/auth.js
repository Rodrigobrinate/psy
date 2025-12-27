"use strict";
/**
 * Authentication Middleware
 * Verifica JWT e anexa o psicólogo autenticado ao Request
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireProPlan = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errorHandler_1 = require("./errorHandler");
const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new errorHandler_1.AppError('Token não fornecido', 401);
        }
        const token = authHeader.split(' ')[1];
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'fallback-secret');
        req.psychologist = decoded;
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            return next(new errorHandler_1.AppError('Token inválido', 401));
        }
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            return next(new errorHandler_1.AppError('Token expirado', 401));
        }
        next(error);
    }
};
exports.authenticate = authenticate;
// Middleware para verificar plano Pro
const requireProPlan = (req, res, next) => {
    if (!req.psychologist) {
        return next(new errorHandler_1.AppError('Não autenticado', 401));
    }
    if (req.psychologist.planType !== 'PRO') {
        return next(new errorHandler_1.AppError('Esta funcionalidade requer o plano Pro. Faça upgrade para desbloquear.', 403));
    }
    next();
};
exports.requireProPlan = requireProPlan;
//# sourceMappingURL=auth.js.map