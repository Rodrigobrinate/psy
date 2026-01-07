/**
 * Document Service
 * Regras de negócio para documentos (receitas, laudos, atestados)
 */

import { prisma } from '../lib/prisma';
import { AppError } from '../middlewares/errorHandler';
import { Prisma } from '../generated/prisma';

// Type that matches Prisma enum (will be generated after migration)
type DocumentType = 'PRESCRIPTION' | 'REPORT' | 'CERTIFICATE' | 'DECLARATION' | 'REFERRAL' | 'OTHER';

interface Medication {
  name: string;
  dosage: string;
  instructions: string;
  quantity?: string;
}

export class DocumentService {
  /**
   * Lista todos os documentos de um psicólogo
   */
  async listDocuments(
    psychologistId: string,
    filters?: {
      type?: DocumentType;
      patientId?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ) {
    const where: any = { psychologistId };

    if (filters?.type) {
      where.type = filters.type;
    }

    if (filters?.patientId) {
      where.patientId = filters.patientId;
    }

    if (filters?.startDate && filters?.endDate) {
      where.issuedAt = {
        gte: filters.startDate,
        lte: filters.endDate,
      };
    }

    const documents = await prisma.document.findMany({
      where,
      include: {
        patient: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { issuedAt: 'desc' },
    });

    return documents;
  }

  /**
   * Busca um documento específico
   */
  async getDocument(documentId: string, psychologistId: string) {
    const document = await prisma.document.findFirst({
      where: { id: documentId, psychologistId },
      include: {
        patient: {
          select: { id: true, name: true, email: true, phone: true, birthDate: true, cpf: true },
        },
        psychologist: {
          select: { id: true, name: true, crp: true, email: true, digitalSignature: true },
        },
      },
    });

    if (!document) {
      throw new AppError('Documento não encontrado', 404);
    }

    return document;
  }

  /**
   * Cria um novo documento
   */
  async createDocument(
    psychologistId: string,
    data: {
      type: DocumentType;
      title: string;
      content: string;
      patientId: string;
      appointmentId?: string;
      medications?: Medication[];
      cid10Code?: string;
      diagnosis?: string;
      validUntil?: string;
    }
  ) {
    // Verifica se o paciente existe e pertence ao psicólogo
    const patient = await prisma.patient.findFirst({
      where: { id: data.patientId, psychologistId },
    });

    if (!patient) {
      throw new AppError('Paciente não encontrado', 404);
    }

    const document = await prisma.document.create({
      data: {
        type: data.type,
        title: data.title,
        content: data.content,
        medications: data.medications ? (data.medications as unknown as Prisma.InputJsonValue) : undefined,
        cid10Code: data.cid10Code,
        diagnosis: data.diagnosis,
        validUntil: data.validUntil ? new Date(data.validUntil) : undefined,
        psychologistId,
        patientId: data.patientId,
        appointmentId: data.appointmentId,
      },
      include: {
        patient: { select: { id: true, name: true } },
      },
    });

    return document;
  }

  /**
   * Atualiza um documento
   */
  async updateDocument(
    documentId: string,
    psychologistId: string,
    data: {
      title?: string;
      content?: string;
      medications?: Medication[];
      cid10Code?: string;
      diagnosis?: string;
      validUntil?: string;
    }
  ) {
    const document = await prisma.document.findFirst({
      where: { id: documentId, psychologistId },
    });

    if (!document) {
      throw new AppError('Documento não encontrado', 404);
    }

    const updated = await prisma.document.update({
      where: { id: documentId },
      data: {
        title: data.title,
        content: data.content,
        medications: data.medications ? (data.medications as unknown as Prisma.InputJsonValue) : undefined,
        cid10Code: data.cid10Code,
        diagnosis: data.diagnosis,
        validUntil: data.validUntil ? new Date(data.validUntil) : undefined,
      },
      include: {
        patient: { select: { id: true, name: true } },
      },
    });

    return updated;
  }

  /**
   * Exclui um documento
   */
  async deleteDocument(documentId: string, psychologistId: string) {
    const document = await prisma.document.findFirst({
      where: { id: documentId, psychologistId },
    });

    if (!document) {
      throw new AppError('Documento não encontrado', 404);
    }

    await prisma.document.delete({
      where: { id: documentId },
    });

    return { message: 'Documento excluído com sucesso' };
  }

  /**
   * Lista documentos de um paciente
   */
  async getPatientDocuments(patientId: string, psychologistId: string) {
    // Verifica se o paciente pertence ao psicólogo
    const patient = await prisma.patient.findFirst({
      where: { id: patientId, psychologistId },
    });

    if (!patient) {
      throw new AppError('Paciente não encontrado', 404);
    }

    const documents = await prisma.document.findMany({
      where: { patientId, psychologistId },
      orderBy: { issuedAt: 'desc' },
    });

    return documents;
  }

  /**
   * Gera conteúdo padrão para um tipo de documento
   */
  getDocumentTemplate(type: DocumentType, patientName: string, psychologistName: string, crp: string) {
    const date = new Date().toLocaleDateString('pt-BR');

    switch (type) {
      case 'PRESCRIPTION':
        return {
          title: `Receita - ${patientName}`,
          content: `
<div style="font-family: Arial, sans-serif; padding: 20px;">
  <h2 style="text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px;">RECEITUÁRIO</h2>
  
  <p><strong>Paciente:</strong> ${patientName}</p>
  <p><strong>Data:</strong> ${date}</p>
  
  <div style="margin: 30px 0; min-height: 200px;">
    <p><strong>Prescrição:</strong></p>
    <!-- Medicamentos serão inseridos aqui -->
  </div>
  
  <div style="margin-top: 50px; text-align: center;">
    <p>_________________________________</p>
    <p><strong>${psychologistName}</strong></p>
    <p>CRP: ${crp}</p>
  </div>
</div>
          `.trim(),
        };

      case 'REPORT':
        return {
          title: `Laudo Psicológico - ${patientName}`,
          content: `
<div style="font-family: Arial, sans-serif; padding: 20px;">
  <h2 style="text-align: center;">LAUDO PSICOLÓGICO</h2>
  
  <h3>1. IDENTIFICAÇÃO</h3>
  <p><strong>Paciente:</strong> ${patientName}</p>
  <p><strong>Data da Avaliação:</strong> ${date}</p>
  
  <h3>2. DESCRIÇÃO DA DEMANDA</h3>
  <p>[Descrever a demanda e motivo do encaminhamento]</p>
  
  <h3>3. PROCEDIMENTOS UTILIZADOS</h3>
  <p>[Descrever os procedimentos, testes e técnicas utilizadas]</p>
  
  <h3>4. ANÁLISE</h3>
  <p>[Análise dos resultados obtidos]</p>
  
  <h3>5. CONCLUSÃO</h3>
  <p>[Conclusões e recomendações]</p>
  
  <div style="margin-top: 50px; text-align: center;">
    <p>_________________________________</p>
    <p><strong>${psychologistName}</strong></p>
    <p>CRP: ${crp}</p>
  </div>
</div>
          `.trim(),
        };

      case 'CERTIFICATE':
        return {
          title: `Atestado - ${patientName}`,
          content: `
<div style="font-family: Arial, sans-serif; padding: 20px;">
  <h2 style="text-align: center;">ATESTADO PSICOLÓGICO</h2>
  
  <p style="margin-top: 30px;">
    Atesto, para os devidos fins, que <strong>${patientName}</strong> 
    esteve sob meus cuidados profissionais na data de ${date}, 
    necessitando de afastamento de suas atividades por [PERÍODO].
  </p>
  
  <p style="margin-top: 20px;">
    CID-10: [CÓDIGO]
  </p>
  
  <div style="margin-top: 50px; text-align: center;">
    <p>_________________________________</p>
    <p><strong>${psychologistName}</strong></p>
    <p>CRP: ${crp}</p>
  </div>
</div>
          `.trim(),
        };

      case 'DECLARATION':
        return {
          title: `Declaração - ${patientName}`,
          content: `
<div style="font-family: Arial, sans-serif; padding: 20px;">
  <h2 style="text-align: center;">DECLARAÇÃO</h2>
  
  <p style="margin-top: 30px;">
    Declaro, para os devidos fins, que <strong>${patientName}</strong> 
    é meu paciente e realiza acompanhamento psicológico neste consultório 
    desde [DATA].
  </p>
  
  <p style="margin-top: 20px;">
    [Informações adicionais]
  </p>
  
  <div style="margin-top: 50px; text-align: center;">
    <p>_________________________________</p>
    <p><strong>${psychologistName}</strong></p>
    <p>CRP: ${crp}</p>
  </div>
</div>
          `.trim(),
        };

      case 'REFERRAL':
        return {
          title: `Encaminhamento - ${patientName}`,
          content: `
<div style="font-family: Arial, sans-serif; padding: 20px;">
  <h2 style="text-align: center;">ENCAMINHAMENTO</h2>
  
  <p style="margin-top: 20px;"><strong>Para:</strong> [Especialista/Instituição]</p>
  
  <p style="margin-top: 20px;">
    Encaminho o(a) paciente <strong>${patientName}</strong> para avaliação e 
    acompanhamento especializado.
  </p>
  
  <h3>Motivo do Encaminhamento:</h3>
  <p>[Descrever o motivo]</p>
  
  <h3>Histórico Relevante:</h3>
  <p>[Informações relevantes para o profissional de destino]</p>
  
  <div style="margin-top: 50px; text-align: center;">
    <p>_________________________________</p>
    <p><strong>${psychologistName}</strong></p>
    <p>CRP: ${crp}</p>
  </div>
</div>
          `.trim(),
        };

      default:
        return {
          title: `Documento - ${patientName}`,
          content: `
<div style="font-family: Arial, sans-serif; padding: 20px;">
  <h2 style="text-align: center;">DOCUMENTO</h2>
  
  <p><strong>Paciente:</strong> ${patientName}</p>
  <p><strong>Data:</strong> ${date}</p>
  
  <div style="margin: 30px 0;">
    [Conteúdo do documento]
  </div>
  
  <div style="margin-top: 50px; text-align: center;">
    <p>_________________________________</p>
    <p><strong>${psychologistName}</strong></p>
    <p>CRP: ${crp}</p>
  </div>
</div>
          `.trim(),
        };
    }
  }
}
