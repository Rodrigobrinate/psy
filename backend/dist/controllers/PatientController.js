"use strict";
/**
 * Patient Controller
 * Orquestra requisições relacionadas a pacientes
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatientController = void 0;
const PatientService_1 = require("../services/PatientService");
const schemas_1 = require("../lib/schemas");
const errorHandler_1 = require("../middlewares/errorHandler");
const patientService = new PatientService_1.PatientService();
class PatientController {
    constructor() {
        this.list = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const psychologistId = req.psychologist.psychologistId;
            const includeInactive = req.query.includeInactive === 'true';
            const patients = await patientService.listPatients(psychologistId, includeInactive);
            res.json({
                data: patients,
                count: patients.length,
            });
        });
        this.get = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const psychologistId = req.psychologist.psychologistId;
            const patient = await patientService.getPatient(id, psychologistId);
            res.json({ data: patient });
        });
        this.create = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const psychologistId = req.psychologist.psychologistId;
            const validatedData = schemas_1.createPatientSchema.parse(req.body);
            const patient = await patientService.createPatient(psychologistId, validatedData);
            res.status(201).json({
                message: 'Paciente criado com sucesso',
                data: patient,
            });
        });
        this.update = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const psychologistId = req.psychologist.psychologistId;
            const validatedData = schemas_1.updatePatientSchema.parse(req.body);
            const patient = await patientService.updatePatient(id, psychologistId, validatedData);
            res.json({
                message: 'Paciente atualizado com sucesso',
                data: patient,
            });
        });
        this.delete = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const psychologistId = req.psychologist.psychologistId;
            const result = await patientService.deletePatient(id, psychologistId);
            res.json(result);
        });
        this.permanentDelete = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const psychologistId = req.psychologist.psychologistId;
            const result = await patientService.permanentDeletePatient(id, psychologistId);
            res.json(result);
        });
    }
}
exports.PatientController = PatientController;
//# sourceMappingURL=PatientController.js.map