/**
 * Document Controller
 * Handlers HTTP para documentos
 */

import { Request, Response } from 'express';
import { DocumentService } from '../services/DocumentService';
import { asyncHandler } from '../middlewares/errorHandler';
import { z } from 'zod';

const documentService = new DocumentService();

// Schemas de validação
const createDocumentSchema = z.object({
  type: z.enum(['PRESCRIPTION', 'REPORT', 'CERTIFICATE', 'DECLARATION', 'REFERRAL', 'OTHER']),
  title: z.string().min(1, 'Título é obrigatório'),
  content: z.string().min(1, 'Conteúdo é obrigatório'),
  patientId: z.string().uuid('ID do paciente inválido'),
  appointmentId: z.string().uuid().optional(),
  medications: z.array(z.object({
    name: z.string(),
    dosage: z.string(),
    instructions: z.string(),
    quantity: z.string().optional(),
  })).optional(),
  cid10Code: z.string().optional(),
  diagnosis: z.string().optional(),
  validUntil: z.string().optional(),
});

const updateDocumentSchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
  medications: z.array(z.object({
    name: z.string(),
    dosage: z.string(),
    instructions: z.string(),
    quantity: z.string().optional(),
  })).optional(),
  cid10Code: z.string().optional(),
  diagnosis: z.string().optional(),
  validUntil: z.string().optional(),
});

export class DocumentController {
  listDocuments = asyncHandler(async (req: Request, res: Response) => {
    const psychologistId = req.psychologist!.psychologistId;
    const { type, patientId, startDate, endDate } = req.query;

    const filters: any = {};
    if (type) filters.type = type as string;
    if (patientId) filters.patientId = patientId as string;
    if (startDate) filters.startDate = new Date(startDate as string);
    if (endDate) filters.endDate = new Date(endDate as string);

    const documents = await documentService.listDocuments(psychologistId, filters);
    res.json({ data: documents });
  });

  getDocument = asyncHandler(async (req: Request, res: Response) => {
    const psychologistId = req.psychologist!.psychologistId;
    const { id } = req.params;

    const document = await documentService.getDocument(id, psychologistId);
    res.json({ data: document });
  });

  createDocument = asyncHandler(async (req: Request, res: Response) => {
    const psychologistId = req.psychologist!.psychologistId;
    const data = createDocumentSchema.parse(req.body);

    const document = await documentService.createDocument(psychologistId, data as any);
    res.status(201).json({
      message: 'Documento criado com sucesso',
      data: document,
    });
  });

  updateDocument = asyncHandler(async (req: Request, res: Response) => {
    const psychologistId = req.psychologist!.psychologistId;
    const { id } = req.params;
    const data = updateDocumentSchema.parse(req.body);

    const document = await documentService.updateDocument(id, psychologistId, data);
    res.json({
      message: 'Documento atualizado com sucesso',
      data: document,
    });
  });

  deleteDocument = asyncHandler(async (req: Request, res: Response) => {
    const psychologistId = req.psychologist!.psychologistId;
    const { id } = req.params;

    const result = await documentService.deleteDocument(id, psychologistId);
    res.json(result);
  });

  getPatientDocuments = asyncHandler(async (req: Request, res: Response) => {
    const psychologistId = req.psychologist!.psychologistId;
    const { patientId } = req.params;

    const documents = await documentService.getPatientDocuments(patientId, psychologistId);
    res.json({ data: documents });
  });

  getTemplate = asyncHandler(async (req: Request, res: Response) => {
    const psychologistId = req.psychologist!.psychologistId;
    const { type, patientId } = req.query;

    if (!type || !patientId) {
      return res.status(400).json({ error: 'Tipo e paciente são obrigatórios' });
    }

    // Buscar dados do psicólogo e paciente
    const { prisma } = await import('../lib/prisma');
    
    const [psychologist, patient] = await Promise.all([
      prisma.psychologist.findUnique({ where: { id: psychologistId } }),
      prisma.patient.findFirst({ where: { id: patientId as string, psychologistId } }),
    ]);

    if (!psychologist || !patient) {
      return res.status(404).json({ error: 'Psicólogo ou paciente não encontrado' });
    }

    const template = documentService.getDocumentTemplate(
      type as any,
      patient.name,
      psychologist.name,
      psychologist.crp
    );

    res.json({ data: template });
  });
}
