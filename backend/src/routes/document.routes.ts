/**
 * Document Routes
 */

import { Router } from 'express';
import { DocumentController } from '../controllers/DocumentController';
import { authenticate } from '../middlewares/auth';

const router = Router();
const documentController = new DocumentController();

// Todas as rotas requerem autenticação
router.use(authenticate);

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

export default router;
