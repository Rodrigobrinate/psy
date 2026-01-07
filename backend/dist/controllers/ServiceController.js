"use strict";
/**
 * Service Controller
 * Gerenciamento de serviços oferecidos pelo psicólogo
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceController = void 0;
const ServiceService_1 = require("../services/ServiceService");
const schemas_1 = require("../lib/schemas");
const errorHandler_1 = require("../middlewares/errorHandler");
const serviceService = new ServiceService_1.ServiceService();
class ServiceController {
    constructor() {
        /**
         * Lista todos os serviços do psicólogo
         */
        this.list = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const psychologistId = req.psychologist.psychologistId;
            const includeInactive = req.query.includeInactive === 'true';
            const services = await serviceService.listServices(psychologistId, includeInactive);
            res.json({ data: services });
        });
        /**
         * Busca um serviço específico
         */
        this.get = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const psychologistId = req.psychologist.psychologistId;
            const { id } = req.params;
            const service = await serviceService.getService(id, psychologistId);
            res.json({ data: service });
        });
        /**
         * Cria um novo serviço
         */
        this.create = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const psychologistId = req.psychologist.psychologistId;
            const data = schemas_1.createServiceSchema.parse(req.body);
            const service = await serviceService.createService(psychologistId, data);
            res.status(201).json({ data: service });
        });
        /**
         * Atualiza um serviço
         */
        this.update = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const psychologistId = req.psychologist.psychologistId;
            const { id } = req.params;
            const data = schemas_1.updateServiceSchema.parse(req.body);
            const service = await serviceService.updateService(id, psychologistId, data);
            res.json({ data: service });
        });
        /**
         * Desativa um serviço
         */
        this.deactivate = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const psychologistId = req.psychologist.psychologistId;
            const { id } = req.params;
            const service = await serviceService.deactivateService(id, psychologistId);
            res.json({ data: service });
        });
    }
}
exports.ServiceController = ServiceController;
//# sourceMappingURL=ServiceController.js.map