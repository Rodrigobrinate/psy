/**
 * Patient Controller
 * Orquestra requisições relacionadas a pacientes
 */

import { Request, Response } from 'express';
import { PatientService } from '../services/PatientService';
import { createPatientSchema, updatePatientSchema } from '../lib/schemas';
import { asyncHandler } from '../middlewares/errorHandler';

const patientService = new PatientService();

export class PatientController {
  list = asyncHandler(async (req: Request, res: Response) => {
    const psychologistId = req.psychologist!.psychologistId;
    const includeInactive = req.query.includeInactive === 'true';

    const patients = await patientService.listPatients(
      psychologistId,
      includeInactive
    );

    res.json({
      data: patients,
      count: patients.length,
    });
  });

  get = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const psychologistId = req.psychologist!.psychologistId;

    const patient = await patientService.getPatient(id, psychologistId);

    res.json({ data: patient });
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const psychologistId = req.psychologist!.psychologistId;
    const validatedData = createPatientSchema.parse(req.body);

    const patient = await patientService.createPatient(
      psychologistId,
      validatedData
    );

    res.status(201).json({
      message: 'Paciente criado com sucesso',
      data: patient,
    });
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const psychologistId = req.psychologist!.psychologistId;
    const validatedData = updatePatientSchema.parse(req.body);

    const patient = await patientService.updatePatient(
      id,
      psychologistId,
      validatedData
    );

    res.json({
      message: 'Paciente atualizado com sucesso',
      data: patient,
    });
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const psychologistId = req.psychologist!.psychologistId;

    const result = await patientService.deletePatient(id, psychologistId);

    res.json(result);
  });

  permanentDelete = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const psychologistId = req.psychologist!.psychologistId;

    const result = await patientService.permanentDeletePatient(
      id,
      psychologistId
    );

    res.json(result);
  });
}
