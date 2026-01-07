/**
 * Service Controller
 * Gerenciamento de serviços oferecidos pelo psicólogo
 */

import { Request, Response } from 'express';
import { ServiceService } from '../services/ServiceService';
import { createServiceSchema, updateServiceSchema } from '../lib/schemas';
import { asyncHandler } from '../middlewares/errorHandler';

const serviceService = new ServiceService();

export class ServiceController {
  /**
   * Lista todos os serviços do psicólogo
   */
  list = asyncHandler(async (req: Request, res: Response) => {
    const psychologistId = req.psychologist!.psychologistId;
    const includeInactive = req.query.includeInactive === 'true';

    const services = await serviceService.listServices(psychologistId, includeInactive);

    res.json({ data: services });
  });

  /**
   * Busca um serviço específico
   */
  get = asyncHandler(async (req: Request, res: Response) => {
    const psychologistId = req.psychologist!.psychologistId;
    const { id } = req.params;

    const service = await serviceService.getService(id, psychologistId);

    res.json({ data: service });
  });

  /**
   * Cria um novo serviço
   */
  create = asyncHandler(async (req: Request, res: Response) => {
    const psychologistId = req.psychologist!.psychologistId;
    const data = createServiceSchema.parse(req.body);

    const service = await serviceService.createService(psychologistId, data);

    res.status(201).json({ data: service });
  });

  /**
   * Atualiza um serviço
   */
  update = asyncHandler(async (req: Request, res: Response) => {
    const psychologistId = req.psychologist!.psychologistId;
    const { id } = req.params;
    const data = updateServiceSchema.parse(req.body);

    const service = await serviceService.updateService(id, psychologistId, data);

    res.json({ data: service });
  });

  /**
   * Desativa um serviço
   */
  deactivate = asyncHandler(async (req: Request, res: Response) => {
    const psychologistId = req.psychologist!.psychologistId;
    const { id } = req.params;

    const service = await serviceService.deactivateService(id, psychologistId);

    res.json({ data: service });
  });
}
