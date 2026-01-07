"use strict";
/**
 * Service Routes
 * Rotas para gerenciamento de serviços
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ServiceController_1 = require("../controllers/ServiceController");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
const serviceController = new ServiceController_1.ServiceController();
// Todas as rotas exigem autenticação
router.use(auth_1.authenticate);
// CRUD de serviços
router.get('/', serviceController.list);
router.get('/:id', serviceController.get);
router.post('/', serviceController.create);
router.patch('/:id', serviceController.update);
router.delete('/:id', serviceController.deactivate);
exports.default = router;
//# sourceMappingURL=service.routes.js.map