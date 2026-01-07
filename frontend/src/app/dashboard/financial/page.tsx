'use client';

/**
 * Financial Page
 * Tela de controle financeiro
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { api } from '@/lib/api';

interface Service {
  id: string;
  name: string;
  description: string | null;
  defaultPrice: number;
  durationMinutes: number;
  isActive: boolean;
}

interface Transaction {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  description: string;
  date: string;
  paymentMethod: string | null;
  isPaid: boolean;
  patient: { id: string; name: string } | null;
  service: { id: string; name: string } | null;
}

interface Summary {
  income: number;
  expenses: number;
  balance: number;
  pending: number;
  transactionCount: number;
}

interface Patient {
  id: string;
  name: string;
}

type TabType = 'transactions' | 'services';

export default function FinancialPage() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('transactions');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [typeFilter, setTypeFilter] = useState<'all' | 'INCOME' | 'EXPENSE'>('all');

  // Service Modal
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceForm, setServiceForm] = useState({
    name: '',
    description: '',
    defaultPrice: '',
    durationMinutes: '50',
  });

  // Transaction Modal
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [transactionForm, setTransactionForm] = useState({
    type: 'INCOME' as 'INCOME' | 'EXPENSE',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: '',
    isPaid: true,
    patientId: '',
    serviceId: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    try {
      const [transactionsRes, servicesRes, patientsRes, summaryRes] = await Promise.all([
        api.listTransactions(token, typeFilter === 'all' ? undefined : { type: typeFilter }),
        api.listServices(token),
        api.listPatients(token) as Promise<{ data: Patient[] }>,
        api.getFinancialSummary(token),
      ]);

      setTransactions(transactionsRes.data || []);
      setServices(servicesRes.data || []);
      setPatients(patientsRes.data || []);
      setSummary(summaryRes.data);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setIsLoading(false);
    }
  }, [token, typeFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Service handlers
  const openServiceModal = (service?: Service) => {
    if (service) {
      setEditingService(service);
      setServiceForm({
        name: service.name,
        description: service.description || '',
        defaultPrice: service.defaultPrice.toString(),
        durationMinutes: service.durationMinutes.toString(),
      });
    } else {
      setEditingService(null);
      setServiceForm({ name: '', description: '', defaultPrice: '', durationMinutes: '50' });
    }
    setIsServiceModalOpen(true);
    setError('');
  };

  const handleSaveService = async () => {
    if (!token) return;

    setIsSubmitting(true);
    setError('');

    try {
      const data = {
        name: serviceForm.name,
        description: serviceForm.description || undefined,
        defaultPrice: parseFloat(serviceForm.defaultPrice),
        durationMinutes: parseInt(serviceForm.durationMinutes),
      };

      if (editingService) {
        await api.updateService(token, editingService.id, data);
      } else {
        await api.createService(token, data);
      }

      setIsServiceModalOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar serviço');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!token || !confirm('Deseja desativar este serviço?')) return;

    try {
      await api.deleteService(token, id);
      fetchData();
    } catch (err) {
      console.error('Erro ao desativar serviço:', err);
    }
  };

  // Transaction handlers
  const openTransactionModal = (type: 'INCOME' | 'EXPENSE') => {
    setTransactionForm({
      type,
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: '',
      isPaid: true,
      patientId: '',
      serviceId: '',
    });
    setIsTransactionModalOpen(true);
    setError('');
  };

  const handleSaveTransaction = async () => {
    if (!token) return;

    setIsSubmitting(true);
    setError('');

    try {
      await api.createTransaction(token, {
        type: transactionForm.type,
        amount: parseFloat(transactionForm.amount),
        description: transactionForm.description,
        date: transactionForm.date,
        paymentMethod: transactionForm.paymentMethod || undefined,
        isPaid: transactionForm.isPaid,
        patientId: transactionForm.patientId || undefined,
        serviceId: transactionForm.serviceId || undefined,
      });

      setIsTransactionModalOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar transação');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!token || !confirm('Deseja excluir esta transação?')) return;

    try {
      await api.deleteTransaction(token, id);
      fetchData();
    } catch (err) {
      console.error('Erro ao excluir transação:', err);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Auto-fill description when service is selected
  useEffect(() => {
    if (transactionForm.serviceId && transactionForm.type === 'INCOME') {
      const service = services.find((s) => s.id === transactionForm.serviceId);
      if (service) {
        setTransactionForm((prev) => ({
          ...prev,
          description: service.name,
          amount: service.defaultPrice.toString(),
        }));
      }
    }
  }, [transactionForm.serviceId, transactionForm.type, services]);

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Financeiro</h1>
              <p className="text-gray-600 mt-1">Controle de receitas e despesas</p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => openTransactionModal('EXPENSE')}>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
                Nova Despesa
              </Button>
              <Button onClick={() => openTransactionModal('INCOME')}>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nova Receita
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          {summary && (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Receitas</p>
                    <p className="text-xl font-bold text-green-600">{formatCurrency(summary.income)}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Despesas</p>
                    <p className="text-xl font-bold text-red-600">{formatCurrency(summary.expenses)}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    summary.balance >= 0 ? 'bg-indigo-100' : 'bg-orange-100'
                  }`}>
                    <svg className={`w-6 h-6 ${summary.balance >= 0 ? 'text-indigo-600' : 'text-orange-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Saldo</p>
                    <p className={`text-xl font-bold ${summary.balance >= 0 ? 'text-indigo-600' : 'text-orange-600'}`}>
                      {formatCurrency(summary.balance)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">A Receber</p>
                    <p className="text-xl font-bold text-yellow-600">{formatCurrency(summary.pending)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex gap-8">
              <button
                onClick={() => setActiveTab('transactions')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'transactions'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Transações
              </button>
              <button
                onClick={() => setActiveTab('services')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'services'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Serviços
              </button>
            </nav>
          </div>

          {/* Transactions Tab */}
          {activeTab === 'transactions' && (
            <>
              {/* Filter */}
              <Card>
                <CardContent className="pt-4">
                  <div className="flex gap-2">
                    {(['all', 'INCOME', 'EXPENSE'] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setTypeFilter(type)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          typeFilter === type
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {type === 'all' ? 'Todas' : type === 'INCOME' ? 'Receitas' : 'Despesas'}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Transactions List */}
              <Card padding={false}>
                {isLoading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto"></div>
                    <p className="mt-4 text-gray-600">Carregando...</p>
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="p-8 text-center">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-gray-600">Nenhuma transação encontrada</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {transactions.map((transaction) => (
                      <div key={transaction.id} className="p-4 hover:bg-gray-50 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            transaction.type === 'INCOME' ? 'bg-green-100' : 'bg-red-100'
                          }`}>
                            {transaction.type === 'INCOME' ? (
                              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                              </svg>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{transaction.description}</p>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <span>{formatDate(transaction.date)}</span>
                              {transaction.patient && (
                                <>
                                  <span>•</span>
                                  <span>{transaction.patient.name}</span>
                                </>
                              )}
                              {transaction.service && (
                                <>
                                  <span>•</span>
                                  <span>{transaction.service.name}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className={`font-semibold ${
                              transaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {transaction.type === 'INCOME' ? '+' : '-'} {formatCurrency(transaction.amount)}
                            </p>
                            {!transaction.isPaid && (
                              <Badge variant="warning" size="sm">Pendente</Badge>
                            )}
                          </div>
                          <button
                            onClick={() => handleDeleteTransaction(transaction.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </>
          )}

          {/* Services Tab */}
          {activeTab === 'services' && (
            <>
              <div className="flex justify-end">
                <Button onClick={() => openServiceModal()}>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Novo Serviço
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.map((service) => (
                  <Card key={service.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{service.name}</h3>
                        <Badge variant={service.isActive ? 'success' : 'default'} size="sm">
                          {service.isActive ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                      {service.description && (
                        <p className="text-sm text-gray-500 mb-4">{service.description}</p>
                      )}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">{service.durationMinutes} min</span>
                        <span className="text-lg font-bold text-indigo-600">
                          {formatCurrency(service.defaultPrice)}
                        </span>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => openServiceModal(service)}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteService(service.id)}
                        >
                          <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {services.length === 0 && !isLoading && (
                  <div className="col-span-full text-center py-12">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <p className="text-gray-600">Nenhum serviço cadastrado</p>
                    <Button className="mt-4" onClick={() => openServiceModal()}>
                      Cadastrar Primeiro Serviço
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Service Modal */}
        <Modal
          isOpen={isServiceModalOpen}
          onClose={() => setIsServiceModalOpen(false)}
          title={editingService ? 'Editar Serviço' : 'Novo Serviço'}
          size="md"
          footer={
            <>
              <Button variant="outline" onClick={() => setIsServiceModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveService} isLoading={isSubmitting}>
                Salvar
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
            <Input
              label="Nome do Serviço"
              placeholder="Ex: Terapia Individual"
              value={serviceForm.name}
              onChange={(e) => setServiceForm((prev) => ({ ...prev, name: e.target.value }))}
              required
            />
            <Input
              label="Descrição"
              placeholder="Descrição do serviço..."
              value={serviceForm.description}
              onChange={(e) => setServiceForm((prev) => ({ ...prev, description: e.target.value }))}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Preço Padrão (R$)"
                type="number"
                step="0.01"
                min="0"
                placeholder="150.00"
                value={serviceForm.defaultPrice}
                onChange={(e) => setServiceForm((prev) => ({ ...prev, defaultPrice: e.target.value }))}
                required
              />
              <Input
                label="Duração (minutos)"
                type="number"
                min="15"
                max="240"
                value={serviceForm.durationMinutes}
                onChange={(e) => setServiceForm((prev) => ({ ...prev, durationMinutes: e.target.value }))}
              />
            </div>
          </div>
        </Modal>

        {/* Transaction Modal */}
        <Modal
          isOpen={isTransactionModalOpen}
          onClose={() => setIsTransactionModalOpen(false)}
          title={transactionForm.type === 'INCOME' ? 'Nova Receita' : 'Nova Despesa'}
          size="lg"
          footer={
            <>
              <Button variant="outline" onClick={() => setIsTransactionModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveTransaction} isLoading={isSubmitting}>
                Salvar
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

            {transactionForm.type === 'INCOME' && (
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Paciente"
                  placeholder="Selecione..."
                  options={[
                    { value: '', label: 'Nenhum' },
                    ...patients.map((p) => ({ value: p.id, label: p.name })),
                  ]}
                  value={transactionForm.patientId}
                  onChange={(value) => setTransactionForm((prev) => ({ ...prev, patientId: value }))}
                />
                <Select
                  label="Serviço"
                  placeholder="Selecione..."
                  options={[
                    { value: '', label: 'Nenhum' },
                    ...services.filter((s) => s.isActive).map((s) => ({ 
                      value: s.id, 
                      label: `${s.name} - ${formatCurrency(s.defaultPrice)}` 
                    })),
                  ]}
                  value={transactionForm.serviceId}
                  onChange={(value) => setTransactionForm((prev) => ({ ...prev, serviceId: value }))}
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Valor (R$)"
                type="number"
                step="0.01"
                min="0"
                placeholder="150.00"
                value={transactionForm.amount}
                onChange={(e) => setTransactionForm((prev) => ({ ...prev, amount: e.target.value }))}
                required
              />
              <Input
                label="Data"
                type="date"
                value={transactionForm.date}
                onChange={(e) => setTransactionForm((prev) => ({ ...prev, date: e.target.value }))}
                required
              />
            </div>

            <Input
              label="Descrição"
              placeholder="Descrição da transação..."
              value={transactionForm.description}
              onChange={(e) => setTransactionForm((prev) => ({ ...prev, description: e.target.value }))}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Forma de Pagamento"
                options={[
                  { value: '', label: 'Não informado' },
                  { value: 'pix', label: 'PIX' },
                  { value: 'dinheiro', label: 'Dinheiro' },
                  { value: 'cartao_credito', label: 'Cartão de Crédito' },
                  { value: 'cartao_debito', label: 'Cartão de Débito' },
                  { value: 'transferencia', label: 'Transferência' },
                ]}
                value={transactionForm.paymentMethod}
                onChange={(value) => setTransactionForm((prev) => ({ ...prev, paymentMethod: value }))}
              />
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={transactionForm.isPaid}
                    onChange={(e) => setTransactionForm((prev) => ({ ...prev, isPaid: e.target.checked }))}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700">Já foi pago</span>
                </label>
              </div>
            </div>
          </div>
        </Modal>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
