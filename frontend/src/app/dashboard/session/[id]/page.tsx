'use client';

/**
 * Appointment Session Page
 * Página de execução do atendimento com cronômetro e anotações (RF04, RF05, RF06)
 */

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { SessionGuard } from '@/components/SessionGuard';
import { Alert } from '@/components/ui/Alert';
import { Loading } from '@/components/ui/Loading';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

interface Appointment {
  id: string;
  scheduledAt: string;
  status: string;
  durationMinutes: number;
  notes?: string;
  patient: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    birthDate?: string;
    clinicalSummary?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function SessionPage() {
  const { token } = useAuth();
  const params = useParams();
  const router = useRouter();
  const appointmentId = params?.id as string;

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Notes state
  const [notes, setNotes] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Session timer
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(false);

  // Load appointment data
  useEffect(() => {
    if (appointmentId && token) {
      loadAppointment();
    }
  }, [appointmentId, token]);

  // Auto-save timer
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const timer = setTimeout(() => {
      handleSaveNotes();
    }, 3000);

    return () => clearTimeout(timer);
  }, [notes, hasUnsavedChanges]);

  // Session timer
  useEffect(() => {
    if (!sessionStartTime || !isSessionActive) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((new Date().getTime() - sessionStartTime.getTime()) / 1000);
      setElapsedTime(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionStartTime, isSessionActive]);

  // Block navigation while session is active
  useEffect(() => {
    if (appointment?.status !== 'IN_PROGRESS') return;

    // Warn before closing/refreshing page
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'Você tem uma sessão em andamento. Finalize a sessão antes de sair.';
      return e.returnValue;
    };

    // Block browser back button
    const blockNavigation = () => {
      window.history.pushState(null, '', window.location.href);
    };

    // Push initial state
    window.history.pushState(null, '', window.location.href);

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', blockNavigation);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', blockNavigation);
    };
  }, [appointment?.status]);

  const loadAppointment = async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);

      const response = await api.getAppointment(token, appointmentId);
      setAppointment(response.data);
      setNotes(response.data.notes || '');

      // Start timer if status is IN_PROGRESS
      if (response.data.status === 'IN_PROGRESS') {
        setSessionStartTime(new Date());
        setIsSessionActive(true);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar agendamento');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!token || !appointment || !hasUnsavedChanges) return;

    try {
      setSaving(true);
      setError(null);

      await api.updateAppointment(token, appointmentId, {
        notes: notes,
      });

      setHasUnsavedChanges(false);
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar anotações');
    } finally {
      setSaving(false);
    }
  };

  const handleStartSession = async () => {
    if (!token || !appointment) return;

    try {
      setError(null);

      await api.updateAppointment(token, appointmentId, {
        status: 'IN_PROGRESS',
      });

      setSessionStartTime(new Date());
      setIsSessionActive(true);
      setAppointment({ ...appointment, status: 'IN_PROGRESS' });
      setSuccess('Sessão iniciada!');
      setTimeout(() => setSuccess(null), 2000);
    } catch (err: any) {
      setError(err.message || 'Erro ao iniciar sessão');
    }
  };

  const handleCompleteSession = async () => {
    if (!token || !appointment) return;
    if (!confirm('Deseja finalizar esta sessão? Esta ação não pode ser desfeita.')) return;

    // Save notes before completing
    if (hasUnsavedChanges) {
      await handleSaveNotes();
    }

    try {
      setError(null);

      await api.updateAppointment(token, appointmentId, {
        status: 'COMPLETED',
      });

      setIsSessionActive(false);
      setSuccess('Sessão finalizada com sucesso!');

      setTimeout(() => {
        router.push('/dashboard/schedule');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Erro ao finalizar sessão');
    }
  };

  const handleCancelSession = async () => {
    if (!token || !appointment) return;
    if (!confirm('Deseja cancelar esta sessão?')) return;

    try {
      setError(null);

      await api.cancelAppointment(token, appointmentId);

      setIsSessionActive(false);
      setSuccess('Sessão cancelada!');

      setTimeout(() => {
        router.push('/dashboard/schedule');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Erro ao cancelar sessão');
    }
  };

  const formatElapsedTime = () => {
    const hours = Math.floor(elapsedTime / 3600);
    const minutes = Math.floor((elapsedTime % 3600) / 60);
    const seconds = elapsedTime % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (!appointment) return 'text-gray-400';

    const expectedSeconds = appointment.durationMinutes * 60;
    const percentage = (elapsedTime / expectedSeconds) * 100;

    if (percentage < 75) return 'text-green-600';
    if (percentage < 100) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Loading />
        </div>
      </ProtectedRoute>
    );
  }

  if (!appointment) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Alert variant="error">Agendamento não encontrado</Alert>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  if (appointment.status === 'IN_PROGRESS') {
                    alert('Você precisa finalizar ou cancelar a sessão antes de sair.');
                    return;
                  }
                  router.push('/dashboard/schedule');
                }}
                className={`p-2 rounded-lg transition-colors ${
                  appointment.status === 'IN_PROGRESS'
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-gray-100'
                }`}
                title={appointment.status === 'IN_PROGRESS' ? 'Finalize a sessão antes de sair' : 'Voltar'}
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{appointment.patient.name}</h1>
                <p className="text-sm text-gray-600">
                  {new Date(appointment.scheduledAt).toLocaleString('pt-BR', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              {appointment.status === 'SCHEDULED' && (
                <>
                  <button
                    onClick={handleCancelSession}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleStartSession}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Iniciar Sessão
                  </button>
                </>
              )}

              {appointment.status === 'IN_PROGRESS' && (
                <>
                  <button
                    onClick={handleCancelSession}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleCompleteSession}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                  >
                    Finalizar Sessão
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="max-w-7xl mx-auto px-6 pt-4">
            <Alert variant="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          </div>
        )}
        {success && (
          <div className="max-w-7xl mx-auto px-6 pt-4">
            <Alert variant="success" onClose={() => setSuccess(null)}>
              {success}
            </Alert>
          </div>
        )}

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Session Lock Warning */}
          {appointment.status === 'IN_PROGRESS' && (
            <div className="mb-6 bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-medium text-amber-900">Sessão em andamento</p>
                  <p className="text-sm text-amber-700">
                    Você não poderá sair desta página até finalizar ou cancelar a sessão.
                    Suas anotações são salvas automaticamente.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Timer Section */}
          <div className="mb-8 text-center">
            <div className={`text-8xl font-bold font-mono mb-4 ${getTimerColor()}`}>
              {isSessionActive ? formatElapsedTime() : '00:00:00'}
            </div>
            <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isSessionActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                <span>{isSessionActive ? 'Sessão em andamento' : 'Sessão não iniciada'}</span>
              </div>
              <span>•</span>
              <span>Duração prevista: {appointment.durationMinutes} minutos</span>
            </div>
          </div>

          {/* Notes Editor */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Anotações da Sessão</h2>
                <div className="flex items-center gap-2">
                  {saving && (
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Salvando...
                    </span>
                  )}
                  {hasUnsavedChanges && !saving && (
                    <span className="text-sm text-amber-600 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      Alterações não salvas
                    </span>
                  )}
                  {!hasUnsavedChanges && !saving && notes && (
                    <span className="text-sm text-green-600 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Salvo automaticamente
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6">
              <textarea
                className="w-full h-[600px] px-4 py-3 border border-gray-300 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                         text-base leading-relaxed resize-none"
                placeholder="Digite suas anotações aqui...&#10;&#10;O texto será salvo automaticamente a cada 3 segundos.&#10;&#10;Você pode organizar suas anotações como preferir."
                value={notes}
                onChange={(e) => {
                  setNotes(e.target.value);
                  setHasUnsavedChanges(true);
                }}
                disabled={appointment.status === 'COMPLETED' || appointment.status === 'CANCELLED'}
              />

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  {notes.length} caracteres • Auto-save ativado
                </p>
                {(appointment.status === 'COMPLETED' || appointment.status === 'CANCELLED') && (
                  <p className="text-sm text-gray-600 font-medium">
                    Sessão {appointment.status === 'COMPLETED' ? 'finalizada' : 'cancelada'} - Modo somente leitura
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
