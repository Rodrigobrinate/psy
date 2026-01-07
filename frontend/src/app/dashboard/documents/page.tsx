'use client';

/**
 * Documents Page
 * Tela de documentos (receitas, laudos, atestados)
 */

import { useState, useEffect, useCallback, useRef } from 'react';
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

interface Document {
  id: string;
  type: string;
  title: string;
  content: string;
  medications: any[] | null;
  cid10Code: string | null;
  diagnosis: string | null;
  issuedAt: string;
  validUntil: string | null;
  patient: { id: string; name: string };
}

interface Patient {
  id: string;
  name: string;
}

interface Medication {
  name: string;
  dosage: string;
  instructions: string;
  quantity: string;
}

const documentTypes = [
  { value: 'PRESCRIPTION', label: 'Receita', icon: '💊' },
  { value: 'REPORT', label: 'Laudo Psicológico', icon: '📋' },
  { value: 'CERTIFICATE', label: 'Atestado', icon: '📄' },
  { value: 'DECLARATION', label: 'Declaração', icon: '📝' },
  { value: 'REFERRAL', label: 'Encaminhamento', icon: '🔄' },
  { value: 'OTHER', label: 'Outro', icon: '📎' },
];

export default function DocumentsPage() {
  const { token } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>('');

  // Create Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [documentTitle, setDocumentTitle] = useState('');
  const [documentContent, setDocumentContent] = useState('');
  const [medications, setMedications] = useState<Medication[]>([]);
  const [cid10Code, setCid10Code] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [validUntil, setValidUntil] = useState('');

  // View Modal
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const printRef = useRef<HTMLDivElement>(null);

  const fetchData = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    try {
      const [docsRes, patientsRes] = await Promise.all([
        api.listDocuments(token, typeFilter ? { type: typeFilter } : undefined),
        api.listPatients(token) as Promise<{ data: Patient[] }>,
      ]);

      setDocuments(docsRes.data || []);
      setPatients(patientsRes.data || []);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setIsLoading(false);
    }
  }, [token, typeFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const resetForm = () => {
    setSelectedType('');
    setSelectedPatientId('');
    setDocumentTitle('');
    setDocumentContent('');
    setMedications([]);
    setCid10Code('');
    setDiagnosis('');
    setValidUntil('');
    setError('');
  };

  const loadTemplate = async () => {
    if (!token || !selectedType || !selectedPatientId) return;

    try {
      const response = await api.getDocumentTemplate(token, selectedType, selectedPatientId);
      setDocumentTitle(response.data.title);
      setDocumentContent(response.data.content);
    } catch (err) {
      console.error('Erro ao carregar template:', err);
    }
  };

  useEffect(() => {
    if (selectedType && selectedPatientId) {
      loadTemplate();
    }
  }, [selectedType, selectedPatientId]);

  const addMedication = () => {
    setMedications([...medications, { name: '', dosage: '', instructions: '', quantity: '' }]);
  };

  const updateMedication = (index: number, field: keyof Medication, value: string) => {
    const updated = [...medications];
    updated[index][field] = value;
    setMedications(updated);
  };

  const removeMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const handleCreate = async () => {
    if (!token) return;

    setIsSubmitting(true);
    setError('');

    try {
      await api.createDocument(token, {
        type: selectedType,
        title: documentTitle,
        content: documentContent,
        patientId: selectedPatientId,
        medications: medications.length > 0 ? medications : undefined,
        cid10Code: cid10Code || undefined,
        diagnosis: diagnosis || undefined,
        validUntil: validUntil || undefined,
      });

      setIsCreateModalOpen(false);
      resetForm();
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Erro ao criar documento');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!token || !confirm('Deseja excluir este documento?')) return;

    try {
      await api.deleteDocument(token, id);
      fetchData();
    } catch (err) {
      console.error('Erro ao excluir:', err);
    }
  };

  const openViewModal = async (doc: Document) => {
    if (!token) return;

    try {
      const response = await api.getDocument(token, doc.id);
      setSelectedDocument(response.data);
      setIsViewModalOpen(true);
    } catch (err) {
      console.error('Erro ao carregar documento:', err);
    }
  };

  const handlePrint = () => {
    if (!printRef.current) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${selectedDocument?.title}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>
          ${printRef.current.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getTypeInfo = (type: string) => {
    return documentTypes.find((t) => t.value === type) || { label: type, icon: '📄' };
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Documentos</h1>
              <p className="text-gray-600 mt-1">Receitas, laudos, atestados e outros documentos</p>
            </div>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Novo Documento
            </Button>
          </div>

          {/* Document Type Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {documentTypes.map((type) => {
              const count = documents.filter((d) => d.type === type.value).length;
              return (
                <button
                  key={type.value}
                  onClick={() => setTypeFilter(typeFilter === type.value ? '' : type.value)}
                  className={`p-4 rounded-xl border-2 transition-all text-center ${
                    typeFilter === type.value
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <span className="text-2xl">{type.icon}</span>
                  <p className="text-sm font-medium text-gray-900 mt-2">{type.label}</p>
                  <p className="text-xs text-gray-500">{count} documento(s)</p>
                </button>
              );
            })}
          </div>

          {/* Documents List */}
          <Card padding={false}>
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto"></div>
                <p className="mt-4 text-gray-600">Carregando...</p>
              </div>
            ) : documents.length === 0 ? (
              <div className="p-8 text-center">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-600">Nenhum documento encontrado</p>
                <Button className="mt-4" onClick={() => setIsCreateModalOpen(true)}>
                  Criar Primeiro Documento
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {documents.map((doc) => {
                  const typeInfo = getTypeInfo(doc.type);
                  return (
                    <div
                      key={doc.id}
                      className="p-4 hover:bg-gray-50 flex items-center justify-between cursor-pointer"
                      onClick={() => openViewModal(doc)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-2xl">
                          {typeInfo.icon}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{doc.title}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>{doc.patient.name}</span>
                            <span>•</span>
                            <span>{formatDate(doc.issuedAt)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="default">{typeInfo.label}</Badge>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(doc.id);
                          }}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
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
          title="Novo Documento"
          size="xl"
          footer={
            <>
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreate} isLoading={isSubmitting} disabled={!selectedType || !selectedPatientId}>
                Criar Documento
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

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Tipo de Documento"
                options={documentTypes.map((t) => ({ value: t.value, label: `${t.icon} ${t.label}` }))}
                value={selectedType}
                onChange={setSelectedType}
                required
              />
              <Select
                label="Paciente"
                options={patients.map((p) => ({ value: p.id, label: p.name }))}
                value={selectedPatientId}
                onChange={setSelectedPatientId}
                required
              />
            </div>

            <Input
              label="Título"
              value={documentTitle}
              onChange={(e) => setDocumentTitle(e.target.value)}
              required
            />

            {/* Medications for Prescriptions */}
            {selectedType === 'PRESCRIPTION' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">Medicamentos</label>
                  <Button variant="outline" size="sm" onClick={addMedication}>
                    + Adicionar
                  </Button>
                </div>
                {medications.map((med, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Medicamento {index + 1}</span>
                      <button onClick={() => removeMedication(index)} className="text-red-500 text-sm">
                        Remover
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        placeholder="Nome do medicamento"
                        value={med.name}
                        onChange={(e) => updateMedication(index, 'name', e.target.value)}
                      />
                      <Input
                        placeholder="Dosagem (ex: 10mg)"
                        value={med.dosage}
                        onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                      />
                    </div>
                    <Input
                      placeholder="Instruções de uso"
                      value={med.instructions}
                      onChange={(e) => updateMedication(index, 'instructions', e.target.value)}
                    />
                    <Input
                      placeholder="Quantidade"
                      value={med.quantity}
                      onChange={(e) => updateMedication(index, 'quantity', e.target.value)}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* CID-10 for Certificates */}
            {(selectedType === 'CERTIFICATE' || selectedType === 'REPORT') && (
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Código CID-10"
                  placeholder="Ex: F41.1"
                  value={cid10Code}
                  onChange={(e) => setCid10Code(e.target.value)}
                />
                {selectedType === 'CERTIFICATE' && (
                  <Input
                    label="Válido até"
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                  />
                )}
              </div>
            )}

            {selectedType === 'REPORT' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Diagnóstico</label>
                <textarea
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="Diagnóstico ou hipótese diagnóstica..."
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Conteúdo do Documento</label>
              <textarea
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                rows={12}
                value={documentContent}
                onChange={(e) => setDocumentContent(e.target.value)}
                placeholder="Conteúdo do documento..."
              />
            </div>
          </div>
        </Modal>

        {/* View Modal */}
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedDocument(null);
          }}
          title={selectedDocument?.title || 'Documento'}
          size="xl"
          footer={
            <>
              <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
                Fechar
              </Button>
              <Button onClick={handlePrint}>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Imprimir
              </Button>
            </>
          }
        >
          {selectedDocument && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
                <div className="text-3xl">{getTypeInfo(selectedDocument.type).icon}</div>
                <div>
                  <p className="font-semibold text-gray-900">{selectedDocument.patient.name}</p>
                  <p className="text-sm text-gray-500">
                    Emitido em {formatDate(selectedDocument.issuedAt)}
                  </p>
                </div>
              </div>

              {/* Medications List */}
              {selectedDocument.medications && selectedDocument.medications.length > 0 && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-3">Medicamentos Prescritos</h4>
                  <div className="space-y-2">
                    {selectedDocument.medications.map((med: Medication, index: number) => (
                      <div key={index} className="p-3 bg-white rounded border border-blue-200">
                        <p className="font-medium">{med.name} - {med.dosage}</p>
                        <p className="text-sm text-gray-600">{med.instructions}</p>
                        {med.quantity && <p className="text-sm text-gray-500">Quantidade: {med.quantity}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CID-10 */}
              {selectedDocument.cid10Code && (
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <span className="text-sm font-medium text-yellow-800">CID-10: {selectedDocument.cid10Code}</span>
                </div>
              )}

              {/* Diagnosis */}
              {selectedDocument.diagnosis && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Diagnóstico</h4>
                  <p className="text-gray-700">{selectedDocument.diagnosis}</p>
                </div>
              )}

              {/* Document Content */}
              <div ref={printRef} className="prose max-w-none">
                <div dangerouslySetInnerHTML={{ __html: selectedDocument.content }} />
              </div>
            </div>
          )}
        </Modal>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
