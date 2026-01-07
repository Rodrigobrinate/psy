/**
 * Service Service
 * Regras de negócio para gerenciamento de serviços
 */

import { prisma } from '../lib/prisma';
import { AppError } from '../middlewares/errorHandler';
import { CreateServiceInput, UpdateServiceInput } from '../lib/schemas';

export class ServiceService {
  /**
   * Lista todos os serviços de um psicólogo
   */
  async listServices(psychologistId: string, includeInactive: boolean = false) {
    const where: any = { psychologistId };

    if (!includeInactive) {
      where.isActive = true;
    }

    const services = await prisma.service.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    return services;
  }

  /**
   * Busca um serviço específico
   */
  async getService(serviceId: string, psychologistId: string) {
    const service = await prisma.service.findFirst({
      where: {
        id: serviceId,
        psychologistId,
      },
    });

    if (!service) {
      throw new AppError('Serviço não encontrado', 404);
    }

    return service;
  }

  /**
   * Cria um novo serviço
   */
  async createService(psychologistId: string, data: CreateServiceInput) {
    const service = await prisma.service.create({
      data: {
        ...data,
        psychologistId,
      },
    });

    return service;
  }

  /**
   * Atualiza um serviço
   */
  async updateService(
    serviceId: string,
    psychologistId: string,
    data: UpdateServiceInput
  ) {
    const service = await prisma.service.findFirst({
      where: {
        id: serviceId,
        psychologistId,
      },
    });

    if (!service) {
      throw new AppError('Serviço não encontrado', 404);
    }

    const updatedService = await prisma.service.update({
      where: { id: serviceId },
      data,
    });

    return updatedService;
  }

  /**
   * Desativa um serviço (soft delete)
   */
  async deactivateService(serviceId: string, psychologistId: string) {
    const service = await prisma.service.findFirst({
      where: {
        id: serviceId,
        psychologistId,
      },
    });

    if (!service) {
      throw new AppError('Serviço não encontrado', 404);
    }

    const updatedService = await prisma.service.update({
      where: { id: serviceId },
      data: { isActive: false },
    });

    return updatedService;
  }
}
