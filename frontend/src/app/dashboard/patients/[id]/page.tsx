'use client';

/**
 * Patient Details Page
 * Tela completa com detalhes do paciente
 */

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StatusBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { api } from '@/lib/api';

interface PatientDetails {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  birthDate: string | null;
  cpf: string | null;
  emergencyContact: string | null;
  clinicalSummary: string | null;
  createdAt: string;
  isActive: boolean;
}

interface Appointment {
  id: string;
  scheduledAt: string;
  status: string;
  durationMinutes: number;
  notes: string | null;
}

interface TestResult {
  id: string;
  appliedAt: string;
  totalScore: number;
  severityLevel: string;
  test: {
    name: string;
  };
}

interface PatientForm {
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  cpf: string;
  emergencyContact: string;
  clinicalSummary: string;
}

export default function PatientDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { token } = useAuth();
  const [patient, setPatient] = useState<PatientDetails | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'appointments' | 'tests'>('info');

  // Edit modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState<PatientForm>({
    name: '',
    email: '',
    phone: '',
    birthDate: '',
    cpf: '',
    emergencyContact: '',
    clinicalSummary: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token || !params.id) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [patientRes, appointmentsRes] = await Promise.all([
          api.getPatient(token, params.id as string) as Promise<{ data: PatientDetails & { testResults?: TestResult[], appointments?: Appointment[] } }>,
          api.listAppointments(token, { patientId: params.id as string }) as Promise<{ data: Appointment[] }>,
        ]);

        setPatient(patientRes.data);
        // Extrair testResults e appointments do response do paciente
        if (patientRes.data.testResults) {
          setTestResults(patientRes.data.testResults);
        }
        // Usar appointments do listAppointments como principal, ou do paciente como fallback
        setAppointments(appointmentsRes.data || patientRes.data.appointments || []);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [token, params.id]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString('pt-BR')} às ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
  };

  const calculateAge = (birthDate: string | null) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const formatCPF = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  };

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    let formattedValue = value;
    if (name === 'cpf') {
      formattedValue = formatCPF(value);
    } else if (name === 'phone' || name === 'emergencyContact') {
      formattedValue = formatPhone(value);
    }

    setFormData((prev) => ({ ...prev, [name]: formattedValue }));
  };

  const openEditModal = () => {
    if (!patient) return;

    setFormData({
      name: patient.name,
      email: patient.email || '',
      phone: patient.phone || '',
      birthDate: patient.birthDate ? patient.birthDate.split('T')[0] : '',
      cpf: patient.cpf || '',
      emergencyContact: patient.emergencyContact || '',
      clinicalSummary: patient.clinicalSummary || '',
    });
    setIsEditModalOpen(true);
  };

  const handleUpdatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !patient) return;

    setIsSubmitting(true);
    setError('');

    try {
      await api.updatePatient(token, patient.id, {
        ...formData,
        email: formData.email || undefined,
        birthDate: formData.birthDate ? new Date(formData.birthDate).toISOString() : undefined,
      });

      // Refresh patient data
      const patientRes = await api.getPatient(token, patient.id) as Promise<{ data: PatientDetails }>;
      setPatient(patientRes.data);

      setIsEditModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar paciente');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (!patient) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Paciente não encontrado</h2>
            <Button onClick={() => router.push('/dashboard/patients')}>
              Voltar para Pacientes
            </Button>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  const age = calculateAge(patient.birthDate);

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard/patients')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Detalhes do Paciente</h1>
                <p className="text-gray-600 mt-1">Visualize e gerencie as informações do paciente</p>
              </div>
            </div>
            <Button onClick={openEditModal}>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Editar
            </Button>
          </div>

          {/* Patient Header Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-6">
                <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-3xl">
                    {patient.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{patient.name}</h2>
                      <p className="text-gray-600 mt-1">
                        {age && `${age} anos`}
                        {age && patient.email && ' • '}
                        {patient.email}
                      </p>
                    </div>
                    <Badge variant={patient.isActive ? 'success' : 'default'} className="text-base px-4 py-2">
                      {patient.isActive ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Telefone</p>
                      <p className="font-medium text-gray-900">{patient.phone || '-'}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Consultas Realizadas</p>
                      <p className="font-medium text-gray-900">
                        {appointments.filter((a) => a.status === 'COMPLETED').length}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Paciente desde</p>
                      <p className="font-medium text-gray-900">{formatDate(patient.createdAt)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('info')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'info'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Informações
              </button>
              <button
                onClick={() => setActiveTab('appointments')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'appointments'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Histórico de Consultas ({appointments.length})
              </button>
              <button
                onClick={() => setActiveTab('tests')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'tests'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Testes Aplicados ({testResults.length})
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'info' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Dados Pessoais</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Nome Completo</p>
                      <p className="font-medium text-gray-900">{patient.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium text-gray-900">{patient.email || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Telefone</p>
                      <p className="font-medium text-gray-900">{patient.phone || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Data de Nascimento</p>
                      <p className="font-medium text-gray-900">
                        {formatDate(patient.birthDate)}
                        {age && ` (${age} anos)`}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">CPF</p>
                      <p className="font-medium text-gray-900">{patient.cpf || '-'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Informações Adicionais</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Contato de Emergência</p>
                      <p className="font-medium text-gray-900">{patient.emergencyContact || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <div className="mt-1">
                        <Badge variant={patient.isActive ? 'success' : 'default'}>
                          {patient.isActive ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Cadastrado em</p>
                      <p className="font-medium text-gray-900">{formatDate(patient.createdAt)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {patient.clinicalSummary && (
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Resumo Clínico</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 whitespace-pre-wrap">{patient.clinicalSummary}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {activeTab === 'appointments' && (
            <Card>
              <CardContent className="pt-6">
                {appointments.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhuma consulta registrada</h3>
                    <p className="text-gray-600">Este paciente ainda não possui histórico de consultas.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {appointments
                      .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())
                      .map((appointment) => (
                        <div
                          key={appointment.id}
                          className="p-6 bg-gray-50 rounded-xl border border-gray-200 hover:border-indigo-200 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {formatDateTime(appointment.scheduledAt)}
                                </h3>
                                <StatusBadge status={appointment.status} />
                              </div>
                              <p className="text-sm text-gray-600">
                                Duração: {appointment.durationMinutes} minutos
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/dashboard/session/${appointment.id}`)}
                            >
                              Ver Detalhes
                            </Button>
                          </div>
                          {appointment.notes && (
                            <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                              <p className="text-xs text-gray-500 mb-2 font-medium">Anotações da Sessão:</p>
                              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                {appointment.notes}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === 'tests' && (
            <Card>
              <CardContent className="pt-6">
                {testResults.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum teste aplicado</h3>
                    <p className="text-gray-600">Este paciente ainda não possui testes registrados.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {testResults
                      .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
                      .map((result) => (
                        <div
                          key={result.id}
                          className="p-6 bg-gray-50 rounded-xl border border-gray-200 hover:border-indigo-200 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {result.test.name}
                              </h3>
                              <p className="text-sm text-gray-600 mt-1">
                                Aplicado em: {formatDateTime(result.appliedAt)}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-indigo-600">
                                {result.totalScore}
                              </div>
                              <Badge 
                                variant={
                                  result.severityLevel === 'MINIMAL' ? 'success' :
                                  result.severityLevel === 'MILD' ? 'warning' :
                                  result.severityLevel === 'MODERATE' ? 'warning' :
                                  'danger'
                                }
                              >
                                {result.severityLevel === 'MINIMAL' && 'Mínimo'}
                                {result.severityLevel === 'MILD' && 'Leve'}
                                {result.severityLevel === 'MODERATE' && 'Moderado'}
                                {result.severityLevel === 'MODERATELY_SEVERE' && 'Moderadamente Severo'}
                                {result.severityLevel === 'SEVERE' && 'Severo'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Edit Modal */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setError('');
          }}
          title="Editar Paciente"
          size="lg"
          footer={
            <>
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleUpdatePatient} isLoading={isSubmitting}>
                Salvar Alterações
              </Button>
            </>
          }
        >
          <form onSubmit={handleUpdatePatient} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nome Completo"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
              <Input
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
              />
              <Input
                label="Telefone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="(11) 99999-9999"
              />
              <Input
                label="Data de Nascimento"
                name="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={handleInputChange}
              />
              <Input
                label="CPF"
                name="cpf"
                value={formData.cpf}
                onChange={handleInputChange}
                placeholder="Digite apenas números"
                maxLength={14}
              />
              <Input
                label="Contato de Emergência"
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleInputChange}
                placeholder="(11) 99999-9999"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Resumo Clínico
              </label>
              <textarea
                name="clinicalSummary"
                value={formData.clinicalSummary}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Observações sobre o paciente..."
              />
            </div>
          </form>
        </Modal>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
