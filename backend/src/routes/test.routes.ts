/**
 * Test Routes
 */

import { Router } from 'express';
import { TestController } from '../controllers/TestController';
import { authenticate } from '../middlewares/auth';

const router = Router();
const testController = new TestController();

// Todas as rotas requerem autenticação
router.use(authenticate);

router.get('/', testController.list);
router.get('/:id', testController.get);
router.post('/submit', testController.submitResponse);
router.get('/patient/:patientId/history', testController.getPatientHistory);

export default router;
