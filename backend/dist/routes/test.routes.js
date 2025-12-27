"use strict";
/**
 * Test Routes
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const TestController_1 = require("../controllers/TestController");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
const testController = new TestController_1.TestController();
// Todas as rotas requerem autenticação
router.use(auth_1.authenticate);
router.get('/', testController.list);
router.get('/:id', testController.get);
router.post('/submit', testController.submitResponse);
router.get('/patient/:patientId/history', testController.getPatientHistory);
exports.default = router;
//# sourceMappingURL=test.routes.js.map