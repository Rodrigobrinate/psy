"use strict";
/**
 * Auth Controller
 * Orquestra requisições de autenticação
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const AuthService_1 = require("../services/AuthService");
const schemas_1 = require("../lib/schemas");
const errorHandler_1 = require("../middlewares/errorHandler");
const authService = new AuthService_1.AuthService();
class AuthController {
    constructor() {
        this.register = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            // Valida dados
            const validatedData = schemas_1.registerSchema.parse(req.body);
            // Chama service
            const result = await authService.register(validatedData);
            res.status(201).json({
                message: 'Psicólogo registrado com sucesso',
                data: result,
            });
        });
        this.login = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            // Valida dados
            const validatedData = schemas_1.loginSchema.parse(req.body);
            // Chama service
            const result = await authService.login(validatedData);
            res.json({
                message: 'Login realizado com sucesso',
                data: result,
            });
        });
        this.refreshToken = (0, errorHandler_1.asyncHandler)(async (req, res) => {
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
        this.me = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            // Retorna dados do psicólogo autenticado
            res.json({
                data: req.psychologist,
            });
        });
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=AuthController.js.map