/**
 * Service Routes
 * Rotas para gerenciamento de serviços
 */

import { Router } from 'express';
import { ServiceController } from '../controllers/ServiceController';
import { authenticate } from '../middlewares/auth';

const router = Router();
const serviceController = new ServiceController();

// Todas as rotas exigem autenticação
router.use(authenticate);

// CRUD de serviços
router.get('/', serviceController.list);
router.get('/:id', serviceController.get);
router.post('/', serviceController.create);
router.patch('/:id', serviceController.update);
router.delete('/:id', serviceController.deactivate);

export default router;
