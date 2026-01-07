"use strict";
/**
 * Document Routes
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const DocumentController_1 = require("../controllers/DocumentController");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
const documentController = new DocumentController_1.DocumentController();
// Todas as rotas requerem autenticação
router.use(auth_1.authenticate);
// Templates
router.get('/template', documentController.getTemplate);
// CRUD
router.get('/', documentController.listDocuments);
router.get('/:id', documentController.getDocument);
router.post('/', documentController.createDocument);
router.put('/:id', documentController.updateDocument);
router.delete('/:id', documentController.deleteDocument);
// Por paciente
router.get('/patient/:patientId', documentController.getPatientDocuments);
exports.default = router;
//# sourceMappingURL=document.routes.js.map