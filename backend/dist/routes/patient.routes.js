"use strict";
/**
 * Patient Routes
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const PatientController_1 = require("../controllers/PatientController");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
const patientController = new PatientController_1.PatientController();
// Todas as rotas requerem autenticação
router.use(auth_1.authenticate);
router.get('/', patientController.list);
router.get('/:id', patientController.get);
router.post('/', patientController.create);
router.put('/:id', patientController.update);
router.delete('/:id', patientController.delete);
router.delete('/:id/permanent', patientController.permanentDelete);
exports.default = router;
//# sourceMappingURL=patient.routes.js.map