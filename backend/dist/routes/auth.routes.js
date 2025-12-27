"use strict";
/**
 * Auth Routes
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuthController_1 = require("../controllers/AuthController");
const auth_1 = require("../middlewares/auth");
const rateLimiter_1 = require("../middlewares/rateLimiter");
const router = (0, express_1.Router)();
const authController = new AuthController_1.AuthController();
// Rotas públicas (com rate limiting)
router.post('/register', rateLimiter_1.authLimiter, authController.register);
router.post('/login', rateLimiter_1.authLimiter, authController.login);
router.post('/refresh', authController.refreshToken);
// Rotas protegidas
router.get('/me', auth_1.authenticate, authController.me);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map