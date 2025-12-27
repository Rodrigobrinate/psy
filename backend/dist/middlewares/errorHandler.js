"use strict";
/**
 * Error Handler Middleware
 * Tratamento global de erros para evitar vazamento de informações sensíveis
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = exports.errorHandler = exports.AppError = void 0;
const zod_1 = require("zod");
class AppError extends Error {
    constructor(message, statusCode = 500, isOperational = true) {
        super(message);
        this.message = message;
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Object.setPrototypeOf(this, AppError.prototype);
    }
}
exports.AppError = AppError;
const errorHandler = (err, req, res, next) => {
    // Zod Validation Errors
    if (err instanceof zod_1.ZodError) {
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
        error: process.env.NODE_ENV === 'production'
            ? 'Erro interno do servidor'
            : err.message,
    });
};
exports.errorHandler = errorHandler;
// Async handler para evitar try-catch em todo controller
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
exports.asyncHandler = asyncHandler;
//# sourceMappingURL=errorHandler.js.map