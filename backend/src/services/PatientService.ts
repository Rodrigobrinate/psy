/**
 * Patient Service
 * Regras de negócio para gerenciamento de pacientes
 */

import { prisma } from '../lib/prisma';
import { AppError } from '../middlewares/errorHandler';
import { CreatePatientInput, UpdatePatientInput } from '../lib/schemas';

export class PatientService {
  /**
   * Lista todos os pacientes de um psicólogo (apenas ativos por padrão)
   */
  async listPatients(psychologistId: string, includeInactive = false) {
    const patients = await prisma.patient.findMany({
      where: {
        psychologistId,
        ...(includeInactive ? {} : { isActive: true, deletedAt: null }),
      },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        birthDate: true,
        createdAt: true,
        isActive: true,
      },
    });

    return patients;
  }

  /**
   * Busca um paciente específico
   */
  async getPatient(patientId: string, psychologistId: string) {
    const patient = await prisma.patient.findFirst({
      where: {
        id: patientId,
        psychologistId,
      },
      include: {
        appointments: {
          orderBy: { scheduledAt: 'desc' },
          take: 10,
        },
        testResults: {
          orderBy: { appliedAt: 'desc' },
          take: 10,
          include: {
            test: {
              select: { name: true, code: true },
            },
          },
        },
      },
    });

    if (!patient) {
      throw new AppError('Paciente não encontrado', 404);
    }

    return patient;
  }

  /**
   * Cria um novo paciente
   */
  async createPatient(psychologistId: string, data: CreatePatientInput) {
    // Validar CPF único se fornecido
    if (data.cpf) {
      const existingCPF = await prisma.patient.findUnique({
        where: { cpf: data.cpf },
      });

      if (existingCPF) {
        throw new AppError('CPF já cadastrado', 400);
      }
    }

    const patient = await prisma.patient.create({
      data: {
        ...data,
        birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
        psychologistId,
      },
    });

    return patient;
  }

  /**
   * Atualiza um paciente
   */
  async updatePatient(
    patientId: string,
    psychologistId: string,
    data: UpdatePatientInput
  ) {
    // Verifica se o paciente pertence ao psicólogo
    const patient = await prisma.patient.findFirst({
      where: { id: patientId, psychologistId },
    });

    if (!patient) {
      throw new AppError('Paciente não encontrado', 404);
    }

    // Atualiza
    const updated = await prisma.patient.update({
      where: { id: patientId },
      data: {
        ...data,
        birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
      },
    });

    return updated;
  }

  /**
   * Soft delete de um paciente (LGPD)
   */
  async deletePatient(patientId: string, psychologistId: string) {
    const patient = await prisma.patient.findFirst({
      where: { id: patientId, psychologistId },
    });

    if (!patient) {
      throw new AppError('Paciente não encontrado', 404);
    }

    // Soft delete
    await prisma.patient.update({
      where: { id: patientId },
      data: {
        isActive: false,
        deletedAt: new Date(),
      },
    });

    return { message: 'Paciente desativado com sucesso' };
  }

  /**
   * Hard delete de um paciente (Direito ao Esquecimento - LGPD)
   */
  async permanentDeletePatient(patientId: string, psychologistId: string) {
    const patient = await prisma.patient.findFirst({
      where: { id: patientId, psychologistId },
    });

    if (!patient) {
      throw new AppError('Paciente não encontrado', 404);
    }

    // Hard delete (Prisma vai deletar em cascata as sessões e testes)
    await prisma.patient.delete({
      where: { id: patientId },
    });

    return { message: 'Todos os dados do paciente foram permanentemente removidos' };
  }
}
