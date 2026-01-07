/**
 * Appointment Routes
 */

import { Router } from 'express';
import { AppointmentController } from '../controllers/AppointmentController';
import { authenticate } from '../middlewares/auth';

const router = Router();
const appointmentController = new AppointmentController();

// Todas as rotas requerem autenticação
router.use(authenticate);

router.get('/', appointmentController.list);
router.get('/stats', appointmentController.stats);
router.get('/active-session', appointmentController.activeSession);
router.get('/:id', appointmentController.get);
router.post('/', appointmentController.create);
router.put('/:id', appointmentController.update);
router.patch('/:id/cancel', appointmentController.cancel);

export default router;
