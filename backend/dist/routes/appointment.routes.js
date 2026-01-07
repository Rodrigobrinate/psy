"use strict";
/**
 * Appointment Routes
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AppointmentController_1 = require("../controllers/AppointmentController");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
const appointmentController = new AppointmentController_1.AppointmentController();
// Todas as rotas requerem autenticação
router.use(auth_1.authenticate);
router.get('/', appointmentController.list);
router.get('/stats', appointmentController.stats);
router.get('/active-session', appointmentController.activeSession);
router.get('/:id', appointmentController.get);
router.post('/', appointmentController.create);
router.put('/:id', appointmentController.update);
router.patch('/:id/cancel', appointmentController.cancel);
exports.default = router;
//# sourceMappingURL=appointment.routes.js.map