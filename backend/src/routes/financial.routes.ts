/**
 * Financial Routes
 */

import { Router } from 'express';
import { FinancialController } from '../controllers/FinancialController';
import { authenticate } from '../middlewares/auth';

const router = Router();
const financialController = new FinancialController();

// Todas as rotas requerem autenticação
router.use(authenticate);

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

export default router;
