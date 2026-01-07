'use client';

/**
 * Schedule Page
 * Tela de agendamento de consultas
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { StatusBadge } from '@/components/ui/Badge';
import { api } from '@/lib/api';

interface Appointment {
  id: string;
  scheduledAt: string;
  status: string;
  durationMinutes: number;
  notes: string | null;
  patient: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
  };
}

interface Patient {
  id: string;
  name: string;
}

interface Stats {
  today: number;
  thisWeek: number;
  upcoming: number;
}

interface Service {
  id: string;
  name: string;
  defaultPrice: number;
  durationMinutes: number;
}

export default function SchedulePage() {
  const { token } = useAuth();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [stats, setStats] = useState<Stats>({ today: 0, thisWeek: 0, upcoming: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeSession, setActiveSession] = useState<Appointment | null>(null);

  // Create modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [appointmentDuration, setAppointmentDuration] = useState('50');
  const [appointmentNotes, setAppointmentNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // View/Edit modal
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const fetchData = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];

      const [appointmentsRes, patientsRes, servicesRes, statsRes, activeSessionRes] = await Promise.all([
        api.listAppointments(token, { date: dateStr }),
        api.listPatients(token) as Promise<{ data: Patient[] }>,
        api.listServices(token) as Promise<{ data: Service[] }>,
        api.getAppointmentStats(token),
        api.getActiveSession(token),
      ]);

      setAppointments(appointmentsRes.data || []);
      setPatients(patientsRes.data || []);
      setServices(servicesRes.data || []);
      setStats(statsRes.data || { today: 0, thisWeek: 0, upcoming: 0 });
      setActiveSession(activeSessionRes.data);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setIsLoading(false);
    }
  }, [token, selectedDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateAppointment = async () => {
    if (!token || !selectedPatientId || !appointmentDate || !appointmentTime) return;

    setIsSubmitting(true);
    setError('');

    try {
      const scheduledAt = new Date(`${appointmentDate}T${appointmentTime}`).toISOString();

      await api.createAppointment(token, {
        patientId: selectedPatientId,
        scheduledAt,
        durationMinutes: parseInt(appointmentDuration),
        notes: appointmentNotes || undefined,
        serviceId: selectedServiceId || undefined,
      });

      setIsCreateModalOpen(false);
      resetForm();
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Erro ao criar agendamento');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelAppointment = async () => {
    if (!token || !selectedAppointment) return;

    setIsSubmitting(true);
    try {
      await api.cancelAppointment(token, selectedAppointment.id);
      setIsViewModalOpen(false);
      setSelectedAppointment(null);
      fetchData();
    } catch (err: any) {
      console.error('Erro ao cancelar:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    if (!token || !selectedAppointment) return;

    setIsSubmitting(true);
    try {
      await api.updateAppointment(token, selectedAppointment.id, { status });

      // Se iniciou a sessão, redirecionar para a página de sessão
      if (status === 'IN_PROGRESS') {
        router.push(`/dashboard/session/${selectedAppointment.id}`);
        return;
      }

      setIsViewModalOpen(false);
      setSelectedAppointment(null);
      fetchData();
    } catch (err: any) {
      console.error('Erro ao atualizar:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedPatientId('');
    setSelectedServiceId('');
    setAppointmentDate('');
    setAppointmentTime('');
    setAppointmentDuration('50');
    setAppointmentNotes('');
    setError('');
  };

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Generate time slots for the day (24 hours)
  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = i;
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  const getAppointmentForSlot = (slot: string) => {
    return appointments.find((apt) => {
      const aptTime = formatTime(apt.scheduledAt);
      return aptTime.startsWith(slot.split(':')[0]);
    });
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Active Session Banner */}
          {activeSession && (
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Sessão em Andamento</h3>
                    <p className="text-white/90">
                      {activeSession.patient.name} - {new Date(activeSession.scheduledAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => router.push(`/dashboard/session/${activeSession.id}`)}
                  className="bg-white text-indigo-600 hover:bg-white/90"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Voltar para Sessão
                </Button>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Agenda</h1>
              <p className="text-gray-600 mt-1">Gerencie seus agendamentos</p>
            </div>
            <Button onClick={() => {
              setAppointmentDate(selectedDate.toISOString().split('T')[0]);
              setIsCreateModalOpen(true);
            }}>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Novo Agendamento
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Consultas Hoje</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.today}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Esta Semana</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.thisWeek}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Próximas</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.upcoming}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Date Navigation */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => changeDate(-1)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <div className="text-center">
                  <p className="text-lg font-semibold text-gray-900 capitalize">
                    {formatDate(selectedDate)}
                  </p>
                  {!isToday(selectedDate) && (
                    <button
                      onClick={goToToday}
                      className="text-sm text-indigo-600 hover:text-indigo-700 mt-1"
                    >
                      Ir para hoje
                    </button>
                  )}
                  {isToday(selectedDate) && (
                    <span className="text-sm text-green-600 font-medium mt-1">Hoje</span>
                  )}
                </div>

                <button
                  onClick={() => changeDate(1)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Schedule Grid */}
          <Card padding={false}>
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto"></div>
                <p className="mt-4 text-gray-600">Carregando agenda...</p>
              </div>
            ) : appointments.length === 0 ? (
              <div className="p-8 text-center">
                <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum agendamento</h3>
                <p className="text-gray-600 mb-4">Não há agendamentos para esta data</p>
                <button
                  onClick={() => {
                    setAppointmentDate(selectedDate.toISOString().split('T')[0]);
                    setIsCreateModalOpen(true);
                  }}
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Criar Agendamento
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {timeSlots.map((slot) => {
                  const appointment = getAppointmentForSlot(slot);

                  return (
                    <div
                      key={slot}
                      className={`
                        flex items-stretch min-h-[80px]
                        ${appointment ? 'bg-indigo-50' : 'hover:bg-gray-50'}
                      `}
                    >
                      {/* Time */}
                      <div className="w-20 flex-shrink-0 flex items-center justify-center border-r border-gray-200 bg-gray-50">
                        <span className="text-sm font-medium text-gray-600">{slot}</span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-3">
                        {appointment ? (
                          <button
                            onClick={() => {
                              setSelectedAppointment(appointment);
                              setIsViewModalOpen(true);
                            }}
                            className="w-full text-left p-3 bg-white rounded-lg shadow-sm border border-indigo-200 hover:border-indigo-400 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                                  <span className="text-white font-semibold text-sm">
                                    {appointment.patient.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">{appointment.patient.name}</p>
                                  <p className="text-sm text-gray-500">
                                    {formatTime(appointment.scheduledAt)} - {appointment.durationMinutes}min
                                  </p>
                                </div>
                              </div>
                              <StatusBadge status={appointment.status} />
                            </div>
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setAppointmentDate(selectedDate.toISOString().split('T')[0]);
                              setAppointmentTime(slot);
                              setIsCreateModalOpen(true);
                            }}
                            className="w-full h-full flex items-center justify-center text-gray-400 hover:text-indigo-600 transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Create Modal */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
            resetForm();
          }}
          title="Novo Agendamento"
          size="lg"
          footer={
            <>
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleCreateAppointment}
                isLoading={isSubmitting}
                disabled={!selectedPatientId || !appointmentDate || !appointmentTime}
              >
                Agendar
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <Select
              label="Paciente"
              placeholder="Selecione um paciente..."
              options={patients.map((p) => ({ value: p.id, label: p.name }))}
              value={selectedPatientId}
              onChange={setSelectedPatientId}
              required
            />

            <Select
              label="Tipo de Serviço"
              placeholder="Selecione um serviço (opcional)..."
              options={services.map((s) => ({
                value: s.id,
                label: `${s.name} - R$ ${s.defaultPrice.toFixed(2)} (${s.durationMinutes}min)`
              }))}
              value={selectedServiceId}
              onChange={(value) => {
                setSelectedServiceId(value);
                // Atualiza automaticamente a duração quando um serviço é selecionado
                const service = services.find(s => s.id === value);
                if (service) {
                  setAppointmentDuration(service.durationMinutes.toString());
                }
              }}
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Horário <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={appointmentTime}
                  onChange={(e) => setAppointmentTime(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            <Select
              label="Duração"
              options={[
                { value: '30', label: '30 minutos' },
                { value: '45', label: '45 minutos' },
                { value: '50', label: '50 minutos (padrão)' },
                { value: '60', label: '1 hora' },
                { value: '90', label: '1 hora e 30 minutos' },
                { value: '120', label: '2 horas' },
              ]}
              value={appointmentDuration}
              onChange={setAppointmentDuration}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observações
              </label>
              <textarea
                value={appointmentNotes}
                onChange={(e) => setAppointmentNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Notas sobre a sessão..."
              />
            </div>
          </div>
        </Modal>

        {/* View/Edit Modal */}
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedAppointment(null);
          }}
          title="Detalhes do Agendamento"
          size="lg"
        >
          {selectedAppointment && (
            <div className="space-y-6">
              {/* Patient Info */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {selectedAppointment.patient.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-lg">{selectedAppointment.patient.name}</p>
                  <p className="text-gray-500">{selectedAppointment.patient.email || 'Sem email'}</p>
                  <p className="text-gray-500">{selectedAppointment.patient.phone || 'Sem telefone'}</p>
                </div>
              </div>

              {/* Appointment Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Data e Hora</p>
                  <p className="font-medium text-gray-900">
                    {new Date(selectedAppointment.scheduledAt).toLocaleDateString('pt-BR')} às{' '}
                    {formatTime(selectedAppointment.scheduledAt)}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Duração</p>
                  <p className="font-medium text-gray-900">{selectedAppointment.durationMinutes} minutos</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg col-span-2">
                  <p className="text-sm text-gray-500">Status</p>
                  <div className="mt-1">
                    <StatusBadge status={selectedAppointment.status} />
                  </div>
                </div>
              </div>

              {selectedAppointment.notes && (
                <div className="p-4 bg-indigo-50 rounded-lg">
                  <p className="text-sm text-indigo-600 font-medium mb-1">Observações</p>
                  <p className="text-gray-700">{selectedAppointment.notes}</p>
                </div>
              )}

              {/* Actions */}
              {selectedAppointment.status !== 'CANCELLED' && (
                <div className="flex flex-wrap gap-2">
                  {selectedAppointment.status === 'SCHEDULED' && (
                    <>
                      <Button
                        variant="secondary"
                        onClick={() => handleUpdateStatus('IN_PROGRESS')}
                        isLoading={isSubmitting}
                      >
                        Iniciar Sessão
                      </Button>
                      <Button
                        variant="danger"
                        onClick={handleCancelAppointment}
                        isLoading={isSubmitting}
                      >
                        Cancelar
                      </Button>
                    </>
                  )}
                  {selectedAppointment.status === 'IN_PROGRESS' && (
                    <Button
                      variant="primary"
                      onClick={() => handleUpdateStatus('COMPLETED')}
                      isLoading={isSubmitting}
                    >
                      Finalizar Sessão
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </Modal>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
