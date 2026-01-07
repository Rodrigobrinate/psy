/**
 * Appointment Service
 * Regras de negócio para gerenciamento de agendamentos
 */

import { prisma } from '../lib/prisma';
import { AppError } from '../middlewares/errorHandler';
import { CreateAppointmentInput, UpdateAppointmentInput } from '../lib/schemas';
import { AppointmentStatus } from '../generated/prisma';
import { AIService } from './AIService';

export class AppointmentService {
  private aiService: AIService;

  constructor() {
    this.aiService = new AIService();
  }

  /**
   * Lista todos os agendamentos de um psicólogo
   */
  async listAppointments(
    psychologistId: string,
    filters?: {
      startDate?: Date;
      endDate?: Date;
      status?: AppointmentStatus;
      patientId?: string;
    }
  ) {
    const where: any = { psychologistId };

    if (filters?.startDate && filters?.endDate) {
      where.scheduledAt = {
        gte: filters.startDate,
        lte: filters.endDate,
      };
    } else if (filters?.startDate) {
      where.scheduledAt = { gte: filters.startDate };
    } else if (filters?.endDate) {
      where.scheduledAt = { lte: filters.endDate };
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.patientId) {
      where.patientId = filters.patientId;
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            defaultPrice: true,
            durationMinutes: true,
          },
        },
      },
      orderBy: { scheduledAt: 'asc' },
    });

    return appointments;
  }

  /**
   * Busca agendamentos de um dia específico
   */
  async getAppointmentsByDate(psychologistId: string, date: Date) {
    // Extrair componentes de data ignorando UTC
    const dateString = date.toISOString().split('T')[0]; // "2026-01-06"
    const [year, month, day] = dateString.split('-').map(Number);

    // Criar datas no timezone local do servidor
    const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
    const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);

    return this.listAppointments(psychologistId, {
      startDate: startOfDay,
      endDate: endOfDay,
    });
  }

  /**
   * Busca um agendamento específico
   */
  async getAppointment(appointmentId: string, psychologistId: string) {
    const appointment = await prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        psychologistId,
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            birthDate: true,
            clinicalSummary: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            defaultPrice: true,
            durationMinutes: true,
          },
        },
      },
    });

    if (!appointment) {
      throw new AppError('Agendamento não encontrado', 404);
    }

    return appointment;
  }

  /**
   * Cria um novo agendamento
   */
  async createAppointment(psychologistId: string, data: CreateAppointmentInput) {
    // Verifica se o paciente pertence ao psicólogo
    const patient = await prisma.patient.findFirst({
      where: {
        id: data.patientId,
        psychologistId,
        isActive: true,
      },
    });

    if (!patient) {
      throw new AppError('Paciente não encontrado ou inativo', 404);
    }

    // Verifica se o serviço existe e pertence ao psicólogo (se fornecido)
    if (data.serviceId) {
      const service = await prisma.service.findFirst({
        where: {
          id: data.serviceId,
          psychologistId,
          isActive: true,
        },
      });

      if (!service) {
        throw new AppError('Serviço não encontrado ou inativo', 404);
      }
    }

    // Verifica conflito de horário
    const scheduledAt = new Date(data.scheduledAt);
    const endTime = new Date(scheduledAt.getTime() + (data.durationMinutes || 50) * 60000);

    const conflictingAppointment = await prisma.appointment.findFirst({
      where: {
        psychologistId,
        status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
        OR: [
          {
            // Novo agendamento começa durante outro
            scheduledAt: {
              lte: scheduledAt,
            },
            AND: {
              scheduledAt: {
                gte: new Date(scheduledAt.getTime() - 50 * 60000),
              },
            },
          },
        ],
      },
    });

    if (conflictingAppointment) {
      throw new AppError('Já existe um agendamento neste horário', 400);
    }

    const appointment = await prisma.appointment.create({
      data: {
        patientId: data.patientId,
        psychologistId,
        scheduledAt,
        durationMinutes: data.durationMinutes || 50,
        notes: data.notes,
        serviceId: data.serviceId,
        status: 'SCHEDULED',
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            defaultPrice: true,
            durationMinutes: true,
          },
        },
      },
    });

    return appointment;
  }

  /**
   * Atualiza um agendamento
   */
  async updateAppointment(
    appointmentId: string,
    psychologistId: string,
    data: UpdateAppointmentInput
  ) {
    const appointment = await prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        psychologistId,
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
            clinicalSummary: true,
          },
        },
      },
    });

    if (!appointment) {
      throw new AppError('Agendamento não encontrado', 404);
    }

    if (appointment.status === 'CANCELLED') {
      throw new AppError('Não é possível atualizar um agendamento cancelado', 400);
    }

    // Se estiver completando a sessão e houver notas, gerar resumo com IA
    let updatedPatientData: any = {};
    if (
      data.status === 'COMPLETED' &&
      appointment.status === 'IN_PROGRESS' &&
      (data.notes || appointment.notes)
    ) {
      const sessionNotes = data.notes || appointment.notes || '';

      if (sessionNotes.trim() && this.aiService.isConfigured()) {
        try {
          console.log('Gerando resumo clínico com IA...');
          const newSummary = await this.aiService.generateSessionSummary(
            sessionNotes,
            appointment.patient.name,
            appointment.patient.clinicalSummary
          );

          // Atualizar o resumo clínico do paciente
          updatedPatientData = {
            patient: {
              update: {
                clinicalSummary: newSummary,
              },
            },
          };
          console.log('Resumo clínico gerado e salvo com sucesso');
        } catch (error: any) {
          console.error('Erro ao gerar resumo com IA:', error.message);
          // Não bloqueia a conclusão da sessão se a IA falhar
        }
      }
    }

    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
        status: data.status,
        notes: data.notes,
        aiSuggestions: data.aiSuggestions,
        ...updatedPatientData,
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return updated;
  }

  /**
   * Cancela um agendamento
   */
  async cancelAppointment(appointmentId: string, psychologistId: string) {
    const appointment = await prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        psychologistId,
      },
    });

    if (!appointment) {
      throw new AppError('Agendamento não encontrado', 404);
    }

    if (appointment.status === 'COMPLETED') {
      throw new AppError('Não é possível cancelar um agendamento já concluído', 400);
    }

    if (appointment.status === 'CANCELLED') {
      throw new AppError('Agendamento já está cancelado', 400);
    }

    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: 'CANCELLED' },
    });

    return { message: 'Agendamento cancelado com sucesso' };
  }

  /**
   * Retorna estatísticas de agendamentos
   */
  async getAppointmentStats(psychologistId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const [todayCount, weekCount, upcomingCount] = await Promise.all([
      prisma.appointment.count({
        where: {
          psychologistId,
          scheduledAt: { gte: today, lte: endOfToday },
          status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
        },
      }),
      prisma.appointment.count({
        where: {
          psychologistId,
          scheduledAt: { gte: startOfWeek, lte: endOfWeek },
          status: { in: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED'] },
        },
      }),
      prisma.appointment.count({
        where: {
          psychologistId,
          scheduledAt: { gte: today },
          status: 'SCHEDULED',
        },
      }),
    ]);

    return {
      today: todayCount,
      thisWeek: weekCount,
      upcoming: upcomingCount,
    };
  }

  /**
   * Verifica se há uma sessão ativa (IN_PROGRESS)
   */
  async getActiveSession(psychologistId: string) {
    const activeSession = await prisma.appointment.findFirst({
      where: {
        psychologistId,
        status: 'IN_PROGRESS',
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: {
        scheduledAt: 'desc',
      },
    });

    return activeSession;
  }
}
