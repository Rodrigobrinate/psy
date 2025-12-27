/**
 * Types compartilhados
 * Devem estar sincronizados com os tipos do backend
 */

export type PlanType = 'BASIC' | 'PRO';

export type AppointmentStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type TestCategory = 'ANXIETY' | 'DEPRESSION' | 'ADHD' | 'AUTISM' | 'PTSD' | 'PERSONALITY' | 'RELATIONSHIP';

export type SeverityLevel = 'MINIMAL' | 'MILD' | 'MODERATE' | 'MODERATELY_SEVERE' | 'SEVERE';

export interface Psychologist {
  id: string;
  email: string;
  name: string;
  crp: string;
  phone?: string;
  planType: PlanType;
  digitalSignature?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Patient {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  birthDate?: string;
  cpf?: string;
  clinicalSummary?: string;
  emergencyContact?: string;
  isActive: boolean;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
  psychologistId: string;
}

export interface Appointment {
  id: string;
  scheduledAt: string;
  status: AppointmentStatus;
  durationMinutes: number;
  notes?: string;
  aiSuggestions?: any;
  audioUrl?: string;
  transcription?: string;
  transcriptionProcessedAt?: string;
  createdAt: string;
  updatedAt: string;
  psychologistId: string;
  patientId: string;
}

export interface Test {
  id: string;
  code: string;
  name: string;
  description: string;
  category: TestCategory;
  minScore: number;
  maxScore: number;
  hasTimer: boolean;
  timerSeconds?: number;
  scoringRules: any;
  isPublicDomain: boolean;
  requiresLicense: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  id: string;
  testId: string;
  orderIndex: number;
  questionText: string;
  answerOptions: Array<{ value: number; label: string }>;
  weight: number;
  isReversed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PatientTestResult {
  id: string;
  testId: string;
  patientId: string;
  totalScore: number;
  severityLevel: SeverityLevel;
  interpretation?: string;
  appliedAt: string;
  applicationMode?: string;
  aiInconsistencyFlag: boolean;
  aiAnalysis?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TestResponse {
  questionId: string;
  selectedValue: number;
  responseTime?: number;
}
