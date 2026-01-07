'use client';

/**
 * Tests Page
 * Tela de gerenciamento de testes psicológicos
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { Badge, CategoryBadge, StatusBadge } from '@/components/ui/Badge';
import { api } from '@/lib/api';

interface Test {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  minScore: number;
  maxScore: number;
  hasTimer: boolean;
  isPublicDomain: boolean;
  requiresLicense: boolean;
}

interface Question {
  id: string;
  orderIndex: number;
  questionText: string;
  answerOptions: { value: number; label: string }[];
  weight: number;
}

interface Patient {
  id: string;
  name: string;
}

interface TestResult {
  id: string;
  totalScore: number;
  severityLevel: string;
  interpretation: string;
  appliedAt: string;
  test: { name: string; code: string };
}

export default function TestsPage() {
  const { token } = useAuth();
  const [tests, setTests] = useState<Test[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');

  // Apply test modal
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [testQuestions, setTestQuestions] = useState<Question[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Result modal
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  // History modal
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [patientHistory, setPatientHistory] = useState<TestResult[]>([]);
  const [historyPatientId, setHistoryPatientId] = useState('');

  const categories = [
    { value: '', label: 'Todas as Categorias' },
    { value: 'ANXIETY', label: 'Ansiedade' },
    { value: 'DEPRESSION', label: 'Depressão' },
    { value: 'ADHD', label: 'TDAH' },
    { value: 'AUTISM', label: 'Autismo' },
    { value: 'PTSD', label: 'TEPT' },
    { value: 'PERSONALITY', label: 'Personalidade' },
    { value: 'RELATIONSHIP', label: 'Relacionamento' },
  ];

  const fetchTests = useCallback(async () => {
    if (!token) return;
    
    setIsLoading(true);
    try {
      const [testsResponse, patientsResponse] = await Promise.all([
        api.listTests(token, selectedCategory || undefined) as Promise<{ data: Test[] }>,
        api.listPatients(token) as Promise<{ data: Patient[] }>,
      ]);
      setTests(testsResponse.data);
      setPatients(patientsResponse.data);
    } catch (err) {
      console.error('Erro ao carregar testes:', err);
    } finally {
      setIsLoading(false);
    }
  }, [token, selectedCategory]);

  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  const openApplyModal = async (test: Test) => {
    if (!token) return;

    try {
      const response = await api.getTest(token, test.id) as { data: Test & { questions: Question[] } };
      setSelectedTest(test);
      setTestQuestions(response.data.questions);
      setResponses({});
      setSelectedPatientId('');
      setIsApplyModalOpen(true);
    } catch (err) {
      console.error('Erro ao carregar questões:', err);
    }
  };

  const handleResponseChange = (questionId: string, value: number) => {
    setResponses((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmitTest = async () => {
    if (!token || !selectedTest || !selectedPatientId) return;

    const allQuestionsAnswered = testQuestions.every((q) => responses[q.id] !== undefined);
    if (!allQuestionsAnswered) {
      alert('Por favor, responda todas as questões.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.submitTestResponse(token, {
        testId: selectedTest.id,
        patientId: selectedPatientId,
        applicationMode: 'in_office',
        responses: testQuestions.map((q) => ({
          questionId: q.id,
          selectedValue: responses[q.id],
        })),
      }) as { data: TestResult };

      setTestResult(response.data);
      setIsApplyModalOpen(false);
      setIsResultModalOpen(true);
    } catch (err: any) {
      alert(err.message || 'Erro ao enviar respostas');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openHistoryModal = async () => {
    if (!token || !historyPatientId) return;

    try {
      const response = await api.getPatientTestHistory(token, historyPatientId) as { data: TestResult[] };
      setPatientHistory(response.data);
      setIsHistoryModalOpen(true);
    } catch (err) {
      console.error('Erro ao carregar histórico:', err);
    }
  };

  const getTestIcon = (category: string) => {
    const icons: Record<string, React.ReactNode> = {
      ANXIETY: '😰',
      DEPRESSION: '😔',
      ADHD: '⚡',
      AUTISM: '🧩',
      PTSD: '🌪️',
      PERSONALITY: '🎭',
      RELATIONSHIP: '❤️',
    };
    return icons[category] || '📋';
  };

  const getSeverityColor = (level: string) => {
    const colors: Record<string, string> = {
      MINIMAL: 'from-green-400 to-green-600',
      MILD: 'from-blue-400 to-blue-600',
      MODERATE: 'from-yellow-400 to-yellow-600',
      MODERATELY_SEVERE: 'from-orange-400 to-orange-600',
      SEVERE: 'from-red-400 to-red-600',
    };
    return colors[level] || 'from-gray-400 to-gray-600';
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Testes Psicológicos</h1>
              <p className="text-gray-600 mt-1">
                Aplique e acompanhe avaliações clínicas
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">📋</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Testes Disponíveis</p>
                    <p className="text-2xl font-bold text-gray-900">{tests.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">✅</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Domínio Público</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {tests.filter((t) => t.isPublicDomain).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">👥</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Pacientes</p>
                    <p className="text-2xl font-bold text-gray-900">{patients.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Patient History Search */}
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Testes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Select
                    placeholder="Selecione um paciente..."
                    options={patients.map((p) => ({ value: p.id, label: p.name }))}
                    value={historyPatientId}
                    onChange={setHistoryPatientId}
                  />
                </div>
                <Button
                  onClick={openHistoryModal}
                  disabled={!historyPatientId}
                  variant="secondary"
                >
                  Ver Histórico
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Filters */}
          <Card>
            <CardContent className="pt-4">
              <Select
                label="Filtrar por Categoria"
                options={categories}
                value={selectedCategory}
                onChange={setSelectedCategory}
              />
            </CardContent>
          </Card>

          {/* Tests Grid */}
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-4 text-gray-600">Carregando testes...</p>
            </div>
          ) : tests.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <span className="text-4xl mb-4 block">📋</span>
                <p className="text-gray-600">Nenhum teste encontrado</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tests.map((test) => (
                <Card key={test.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-2xl">{getTestIcon(test.category)}</span>
                      </div>
                      <CategoryBadge category={test.category} />
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {test.code}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">{test.name}</p>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                      {test.description}
                    </p>

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span>Score: {test.minScore} - {test.maxScore}</span>
                      {test.hasTimer && (
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Cronometrado
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {test.isPublicDomain ? (
                        <Badge variant="success" size="sm">Livre</Badge>
                      ) : (
                        <Badge variant="warning" size="sm">Licenciado</Badge>
                      )}
                    </div>

                    <Button
                      className="w-full mt-4"
                      onClick={() => openApplyModal(test)}
                      disabled={patients.length === 0}
                    >
                      Aplicar Teste
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Apply Test Modal */}
        <Modal
          isOpen={isApplyModalOpen}
          onClose={() => setIsApplyModalOpen(false)}
          title={`Aplicar ${selectedTest?.code} - ${selectedTest?.name}`}
          size="xl"
          footer={
            <>
              <Button variant="outline" onClick={() => setIsApplyModalOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleSubmitTest}
                isLoading={isSubmitting}
                disabled={!selectedPatientId}
              >
                Finalizar e Calcular
              </Button>
            </>
          }
        >
          <div className="space-y-6">
            {/* Patient Selection */}
            <div className="p-4 bg-indigo-50 rounded-lg">
              <Select
                label="Selecione o Paciente"
                placeholder="Escolha um paciente..."
                options={patients.map((p) => ({ value: p.id, label: p.name }))}
                value={selectedPatientId}
                onChange={setSelectedPatientId}
                required
              />
            </div>

            {/* Questions */}
            {selectedPatientId && (
              <div className="space-y-6">
                <p className="text-sm text-gray-600">
                  Responda todas as {testQuestions.length} questões abaixo:
                </p>

                {testQuestions.map((question, index) => (
                  <div
                    key={question.id}
                    className="p-4 bg-white border border-gray-200 rounded-lg hover:border-indigo-300 transition-colors"
                  >
                    <p className="font-medium text-gray-900 mb-3">
                      {index + 1}. {question.questionText}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {question.answerOptions.map((option) => (
                        <label
                          key={option.value}
                          className={`
                            flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all
                            ${responses[question.id] === option.value
                              ? 'bg-indigo-100 border-2 border-indigo-500'
                              : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                            }
                          `}
                        >
                          <input
                            type="radio"
                            name={`question-${question.id}`}
                            value={option.value}
                            checked={responses[question.id] === option.value}
                            onChange={() => handleResponseChange(question.id, option.value)}
                            className="w-4 h-4 text-indigo-600"
                          />
                          <span className="text-sm">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Modal>

        {/* Result Modal */}
        <Modal
          isOpen={isResultModalOpen}
          onClose={() => {
            setIsResultModalOpen(false);
            setTestResult(null);
          }}
          title="Resultado do Teste"
          size="lg"
        >
          {testResult && (
            <div className="space-y-6 text-center">
              {/* Score Display */}
              <div
                className={`
                  w-32 h-32 mx-auto rounded-full
                  bg-gradient-to-br ${getSeverityColor(testResult.severityLevel)}
                  flex items-center justify-center shadow-xl
                `}
              >
                <div className="text-white">
                  <p className="text-4xl font-bold">{testResult.totalScore}</p>
                  <p className="text-sm opacity-90">pontos</p>
                </div>
              </div>

              {/* Severity Badge */}
              <div>
                <StatusBadge status={testResult.severityLevel} />
              </div>

              {/* Test Info */}
              <div className="text-left p-4 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-900 mb-1">
                  {testResult.test.name} ({testResult.test.code})
                </p>
                <p className="text-sm text-gray-600">
                  Aplicado em: {new Date(testResult.appliedAt).toLocaleString('pt-BR')}
                </p>
              </div>

              {/* Interpretation */}
              <div className="text-left p-4 bg-indigo-50 rounded-lg">
                <p className="font-medium text-indigo-900 mb-2">Interpretação</p>
                <p className="text-gray-700">{testResult.interpretation}</p>
              </div>

              <Button onClick={() => setIsResultModalOpen(false)} className="w-full">
                Fechar
              </Button>
            </div>
          )}
        </Modal>

        {/* History Modal */}
        <Modal
          isOpen={isHistoryModalOpen}
          onClose={() => {
            setIsHistoryModalOpen(false);
            setPatientHistory([]);
          }}
          title="Histórico de Testes"
          size="xl"
        >
          {patientHistory.length === 0 ? (
            <div className="text-center py-8">
              <span className="text-4xl mb-4 block">📊</span>
              <p className="text-gray-600">Nenhum teste aplicado para este paciente</p>
            </div>
          ) : (
            <div className="space-y-4">
              {patientHistory.map((result) => (
                <div
                  key={result.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`
                        w-12 h-12 rounded-full
                        bg-gradient-to-br ${getSeverityColor(result.severityLevel)}
                        flex items-center justify-center text-white font-bold
                      `}
                    >
                      {result.totalScore}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {result.test.name} ({result.test.code})
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(result.appliedAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={result.severityLevel} />
                </div>
              ))}
            </div>
          )}
        </Modal>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
