/**
 * Appointment Controller
 * Handlers HTTP para agendamentos
 */

import { Request, Response } from 'express';
import { AppointmentService } from '../services/AppointmentService';
import { createAppointmentSchema, updateAppointmentSchema } from '../lib/schemas';
import { asyncHandler } from '../middlewares/errorHandler';
import { AppointmentStatus } from '../generated/prisma';

const appointmentService = new AppointmentService();

export class AppointmentController {
  list = asyncHandler(async (req: Request, res: Response) => {
    const psychologistId = req.psychologist!.psychologistId;
    const { startDate, endDate, status, patientId, date } = req.query;

    let filters: any = {};

    // Se uma data específica foi passada
    if (date) {
      const appointments = await appointmentService.getAppointmentsByDate(
        psychologistId,
        new Date(date as string)
      );
      return res.json({ data: appointments });
    }

    if (startDate) filters.startDate = new Date(startDate as string);
    if (endDate) filters.endDate = new Date(endDate as string);
    if (status) filters.status = status as AppointmentStatus;
    if (patientId) filters.patientId = patientId as string;

    const appointments = await appointmentService.listAppointments(psychologistId, filters);
    res.json({ data: appointments });
  });

  get = asyncHandler(async (req: Request, res: Response) => {
    const psychologistId = req.psychologist!.psychologistId;
    const { id } = req.params;

    const appointment = await appointmentService.getAppointment(id, psychologistId);
    res.json({ data: appointment });
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const psychologistId = req.psychologist!.psychologistId;
    const data = createAppointmentSchema.parse(req.body);

    const appointment = await appointmentService.createAppointment(psychologistId, data);
    res.status(201).json({
      message: 'Agendamento criado com sucesso',
      data: appointment,
    });
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const psychologistId = req.psychologist!.psychologistId;
    const { id } = req.params;
    const data = updateAppointmentSchema.parse(req.body);

    const appointment = await appointmentService.updateAppointment(id, psychologistId, data);
    res.json({
      message: 'Agendamento atualizado com sucesso',
      data: appointment,
    });
  });

  cancel = asyncHandler(async (req: Request, res: Response) => {
    const psychologistId = req.psychologist!.psychologistId;
    const { id } = req.params;

    const result = await appointmentService.cancelAppointment(id, psychologistId);
    res.json(result);
  });

  stats = asyncHandler(async (req: Request, res: Response) => {
    const psychologistId = req.psychologist!.psychologistId;

    const stats = await appointmentService.getAppointmentStats(psychologistId);
    res.json({ data: stats });
  });

  activeSession = asyncHandler(async (req: Request, res: Response) => {
    const psychologistId = req.psychologist!.psychologistId;

    const activeSession = await appointmentService.getActiveSession(psychologistId);
    res.json({ data: activeSession });
  });
}
