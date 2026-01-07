"use strict";
/**
 * Document Controller
 * Handlers HTTP para documentos
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentController = void 0;
const DocumentService_1 = require("../services/DocumentService");
const errorHandler_1 = require("../middlewares/errorHandler");
const zod_1 = require("zod");
const documentService = new DocumentService_1.DocumentService();
// Schemas de validação
const createDocumentSchema = zod_1.z.object({
    type: zod_1.z.enum(['PRESCRIPTION', 'REPORT', 'CERTIFICATE', 'DECLARATION', 'REFERRAL', 'OTHER']),
    title: zod_1.z.string().min(1, 'Título é obrigatório'),
    content: zod_1.z.string().min(1, 'Conteúdo é obrigatório'),
    patientId: zod_1.z.string().uuid('ID do paciente inválido'),
    appointmentId: zod_1.z.string().uuid().optional(),
    medications: zod_1.z.array(zod_1.z.object({
        name: zod_1.z.string(),
        dosage: zod_1.z.string(),
        instructions: zod_1.z.string(),
        quantity: zod_1.z.string().optional(),
    })).optional(),
    cid10Code: zod_1.z.string().optional(),
    diagnosis: zod_1.z.string().optional(),
    validUntil: zod_1.z.string().optional(),
});
const updateDocumentSchema = zod_1.z.object({
    title: zod_1.z.string().optional(),
    content: zod_1.z.string().optional(),
    medications: zod_1.z.array(zod_1.z.object({
        name: zod_1.z.string(),
        dosage: zod_1.z.string(),
        instructions: zod_1.z.string(),
        quantity: zod_1.z.string().optional(),
    })).optional(),
    cid10Code: zod_1.z.string().optional(),
    diagnosis: zod_1.z.string().optional(),
    validUntil: zod_1.z.string().optional(),
});
class DocumentController {
    constructor() {
        this.listDocuments = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const psychologistId = req.psychologist.psychologistId;
            const { type, patientId, startDate, endDate } = req.query;
            const filters = {};
            if (type)
                filters.type = type;
            if (patientId)
                filters.patientId = patientId;
            if (startDate)
                filters.startDate = new Date(startDate);
            if (endDate)
                filters.endDate = new Date(endDate);
            const documents = await documentService.listDocuments(psychologistId, filters);
            res.json({ data: documents });
        });
        this.getDocument = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const psychologistId = req.psychologist.psychologistId;
            const { id } = req.params;
            const document = await documentService.getDocument(id, psychologistId);
            res.json({ data: document });
        });
        this.createDocument = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const psychologistId = req.psychologist.psychologistId;
            const data = createDocumentSchema.parse(req.body);
            const document = await documentService.createDocument(psychologistId, data);
            res.status(201).json({
                message: 'Documento criado com sucesso',
                data: document,
            });
        });
        this.updateDocument = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const psychologistId = req.psychologist.psychologistId;
            const { id } = req.params;
            const data = updateDocumentSchema.parse(req.body);
            const document = await documentService.updateDocument(id, psychologistId, data);
            res.json({
                message: 'Documento atualizado com sucesso',
                data: document,
            });
        });
        this.deleteDocument = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const psychologistId = req.psychologist.psychologistId;
            const { id } = req.params;
            const result = await documentService.deleteDocument(id, psychologistId);
            res.json(result);
        });
        this.getPatientDocuments = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const psychologistId = req.psychologist.psychologistId;
            const { patientId } = req.params;
            const documents = await documentService.getPatientDocuments(patientId, psychologistId);
            res.json({ data: documents });
        });
        this.getTemplate = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const psychologistId = req.psychologist.psychologistId;
            const { type, patientId } = req.query;
            if (!type || !patientId) {
                return res.status(400).json({ error: 'Tipo e paciente são obrigatórios' });
            }
            // Buscar dados do psicólogo e paciente
            const { prisma } = await Promise.resolve().then(() => __importStar(require('../lib/prisma')));
            const [psychologist, patient] = await Promise.all([
                prisma.psychologist.findUnique({ where: { id: psychologistId } }),
                prisma.patient.findFirst({ where: { id: patientId, psychologistId } }),
            ]);
            if (!psychologist || !patient) {
                return res.status(404).json({ error: 'Psicólogo ou paciente não encontrado' });
            }
            const template = documentService.getDocumentTemplate(type, patient.name, psychologist.name, psychologist.crp);
            res.json({ data: template });
        });
    }
}
exports.DocumentController = DocumentController;
//# sourceMappingURL=DocumentController.js.map