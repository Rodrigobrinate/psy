"use strict";
/**
 * Financial Routes
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const FinancialController_1 = require("../controllers/FinancialController");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
const financialController = new FinancialController_1.FinancialController();
// Todas as rotas requerem autenticação
router.use(auth_1.authenticate);
// Serviços
router.get('/services', financialController.listServices);
router.get('/services/:id', financialController.getService);
router.post('/services', financialController.createService);
router.put('/services/:id', financialController.updateService);
router.delete('/services/:id', financialController.deleteService);
// Transações
router.get('/transactions', financialController.listTransactions);
router.post('/transactions', financialController.createTransaction);
router.put('/transactions/:id', financialController.updateTransaction);
router.delete('/transactions/:id', financialController.deleteTransaction);
// Resumo
router.get('/summary', financialController.getSummary);
exports.default = router;
//# sourceMappingURL=financial.routes.js.map