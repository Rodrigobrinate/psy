/**
 * Patient Routes
 */

import { Router } from 'express';
import { PatientController } from '../controllers/PatientController';
import { authenticate } from '../middlewares/auth';

const router = Router();
const patientController = new PatientController();

// Todas as rotas requerem autenticação
router.use(authenticate);

router.get('/', patientController.list);
router.get('/:id', patientController.get);
router.post('/', patientController.create);
router.put('/:id', patientController.update);
router.delete('/:id', patientController.delete);
router.delete('/:id/permanent', patientController.permanentDelete);

export default router;
