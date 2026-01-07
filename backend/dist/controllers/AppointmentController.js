"use strict";
/**
 * Appointment Controller
 * Handlers HTTP para agendamentos
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentController = void 0;
const AppointmentService_1 = require("../services/AppointmentService");
const schemas_1 = require("../lib/schemas");
const errorHandler_1 = require("../middlewares/errorHandler");
const appointmentService = new AppointmentService_1.AppointmentService();
class AppointmentController {
    constructor() {
        this.list = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const psychologistId = req.psychologist.psychologistId;
            const { startDate, endDate, status, patientId, date } = req.query;
            let filters = {};
            // Se uma data específica foi passada
            if (date) {
                const appointments = await appointmentService.getAppointmentsByDate(psychologistId, new Date(date));
                return res.json({ data: appointments });
            }
            if (startDate)
                filters.startDate = new Date(startDate);
            if (endDate)
                filters.endDate = new Date(endDate);
            if (status)
                filters.status = status;
            if (patientId)
                filters.patientId = patientId;
            const appointments = await appointmentService.listAppointments(psychologistId, filters);
            res.json({ data: appointments });
        });
        this.get = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const psychologistId = req.psychologist.psychologistId;
            const { id } = req.params;
            const appointment = await appointmentService.getAppointment(id, psychologistId);
            res.json({ data: appointment });
        });
        this.create = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const psychologistId = req.psychologist.psychologistId;
            const data = schemas_1.createAppointmentSchema.parse(req.body);
            const appointment = await appointmentService.createAppointment(psychologistId, data);
            res.status(201).json({
                message: 'Agendamento criado com sucesso',
                data: appointment,
            });
        });
        this.update = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const psychologistId = req.psychologist.psychologistId;
            const { id } = req.params;
            const data = schemas_1.updateAppointmentSchema.parse(req.body);
            const appointment = await appointmentService.updateAppointment(id, psychologistId, data);
            res.json({
                message: 'Agendamento atualizado com sucesso',
                data: appointment,
            });
        });
        this.cancel = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const psychologistId = req.psychologist.psychologistId;
            const { id } = req.params;
            const result = await appointmentService.cancelAppointment(id, psychologistId);
            res.json(result);
        });
        this.stats = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const psychologistId = req.psychologist.psychologistId;
            const stats = await appointmentService.getAppointmentStats(psychologistId);
            res.json({ data: stats });
        });
        this.activeSession = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const psychologistId = req.psychologist.psychologistId;
            const activeSession = await appointmentService.getActiveSession(psychologistId);
            res.json({ data: activeSession });
        });
    }
}
exports.AppointmentController = AppointmentController;
//# sourceMappingURL=AppointmentController.js.map