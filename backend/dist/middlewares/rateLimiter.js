"use strict";
/**
 * Rate Limiting Middleware
 * Proteção contra brute-force e ataques de negação de serviço
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadLimiter = exports.authLimiter = exports.apiLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
// Rate limiter geral para a API
exports.apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutos
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    message: {
        error: 'Muitas requisições deste IP. Tente novamente em alguns minutos.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});
// Rate limiter específico para login (mais restritivo)
exports.authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // 5 tentativas
    message: {
        error: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
    },
    skipSuccessfulRequests: true, // Não conta requisições bem-sucedidas
});
// Rate limiter para upload de arquivos
exports.uploadLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 20, // 20 uploads por hora
    message: {
        error: 'Limite de uploads atingido. Tente novamente em 1 hora.',
    },
});
//# sourceMappingURL=rateLimiter.js.map