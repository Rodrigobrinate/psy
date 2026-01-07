/**
 * API Client
 * Cliente HTTP para comunicação com o backend
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004/api';

interface RequestOptions extends RequestInit {
  token?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { token, ...fetchOptions } = options;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(fetchOptions.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...fetchOptions,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: 'Erro desconhecido',
      }));
      throw new Error(error.error || error.message || 'Erro na requisição');
    }

    return response.json();
  }

  // Auth endpoints
  async register(data: {
    email: string;
    password: string;
    name: string;
    crp: string;
    phone?: string;
  }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: { email: string; password: string }) {
    return this.request<{
      message: string;
      data: {
        psychologist: any;
        accessToken: string;
        refreshToken: string;
      };
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async refreshToken(refreshToken: string) {
    return this.request('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  async getMe(token: string) {
    return this.request('/auth/me', {
      token,
    });
  }

  // Patient endpoints
  async listPatients(token: string, includeInactive = false) {
    return this.request(
      `/patients?includeInactive=${includeInactive}`,
      { token }
    );
  }

  async getPatient(token: string, id: string) {
    return this.request(`/patients/${id}`, { token });
  }

  async createPatient(token: string, data: any) {
    return this.request('/patients', {
      method: 'POST',
      token,
      body: JSON.stringify(data),
    });
  }

  async updatePatient(token: string, id: string, data: any) {
    return this.request(`/patients/${id}`, {
      method: 'PUT',
      token,
      body: JSON.stringify(data),
    });
  }

  async deletePatient(token: string, id: string) {
    return this.request(`/patients/${id}`, {
      method: 'DELETE',
      token,
    });
  }

  async permanentDeletePatient(token: string, id: string) {
    return this.request(`/patients/${id}/permanent`, {
      method: 'DELETE',
      token,
    });
  }

  // Test endpoints
  async listTests(token: string, category?: string) {
    const query = category ? `?category=${category}` : '';
    return this.request(`/tests${query}`, { token });
  }

  async getTest(token: string, id: string) {
    return this.request(`/tests/${id}`, { token });
  }

  async submitTestResponse(token: string, data: any) {
    return this.request('/tests/submit', {
      method: 'POST',
      token,
      body: JSON.stringify(data),
    });
  }

  async getPatientTestHistory(token: string, patientId: string) {
    return this.request(`/tests/patient/${patientId}/history`, { token });
  }

  // Appointment endpoints
  async listAppointments(token: string, filters?: {
    date?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
    patientId?: string;
  }) {
    const params = new URLSearchParams();
    if (filters?.date) params.append('date', filters.date);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.patientId) params.append('patientId', filters.patientId);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<{ data: any[] }>(`/appointments${query}`, { token });
  }

  async getAppointment(token: string, id: string) {
    return this.request(`/appointments/${id}`, { token });
  }

  async createAppointment(token: string, data: {
    patientId: string;
    scheduledAt: string;
    durationMinutes?: number;
    notes?: string;
    serviceId?: string;
  }) {
    return this.request('/appointments', {
      method: 'POST',
      token,
      body: JSON.stringify(data),
    });
  }

  async updateAppointment(token: string, id: string, data: any) {
    return this.request(`/appointments/${id}`, {
      method: 'PUT',
      token,
      body: JSON.stringify(data),
    });
  }

  async cancelAppointment(token: string, id: string) {
    return this.request(`/appointments/${id}/cancel`, {
      method: 'PATCH',
      token,
    });
  }

  async getAppointmentStats(token: string) {
    return this.request<{ data: { today: number; thisWeek: number; upcoming: number } }>(
      '/appointments/stats',
      { token }
    );
  }

  async getActiveSession(token: string) {
    return this.request<{ data: any | null }>(
      '/appointments/active-session',
      { token }
    );
  }

  // Services
  async listServices(token: string, includeInactive = false) {
    const query = includeInactive ? '?includeInactive=true' : '';
    return this.request<{ data: any[] }>(`/services${query}`, { token });
  }

  async createService(token: string, data: {
    name: string;
    description?: string;
    defaultPrice: number;
    durationMinutes?: number;
  }) {
    return this.request('/financial/services', {
      method: 'POST',
      token,
      body: JSON.stringify(data),
    });
  }

  async updateService(token: string, id: string, data: any) {
    return this.request(`/financial/services/${id}`, {
      method: 'PUT',
      token,
      body: JSON.stringify(data),
    });
  }

  async deleteService(token: string, id: string) {
    return this.request(`/financial/services/${id}`, {
      method: 'DELETE',
      token,
    });
  }

  // Financial - Transactions
  async listTransactions(token: string, filters?: {
    type?: 'INCOME' | 'EXPENSE';
    startDate?: string;
    endDate?: string;
    patientId?: string;
    serviceId?: string;
  }) {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.patientId) params.append('patientId', filters.patientId);
    if (filters?.serviceId) params.append('serviceId', filters.serviceId);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<{ data: any[] }>(`/financial/transactions${query}`, { token });
  }

  async createTransaction(token: string, data: {
    type: 'INCOME' | 'EXPENSE';
    amount: number;
    description: string;
    date?: string;
    paymentMethod?: string;
    isPaid?: boolean;
    patientId?: string;
    serviceId?: string;
  }) {
    return this.request('/financial/transactions', {
      method: 'POST',
      token,
      body: JSON.stringify(data),
    });
  }

  async updateTransaction(token: string, id: string, data: any) {
    return this.request(`/financial/transactions/${id}`, {
      method: 'PUT',
      token,
      body: JSON.stringify(data),
    });
  }

  async deleteTransaction(token: string, id: string) {
    return this.request(`/financial/transactions/${id}`, {
      method: 'DELETE',
      token,
    });
  }

  // Financial - Summary
  async getFinancialSummary(token: string, month?: number, year?: number) {
    const params = new URLSearchParams();
    if (month !== undefined) params.append('month', month.toString());
    if (year !== undefined) params.append('year', year.toString());
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<{ data: any }>(`/financial/summary${query}`, { token });
  }

  // Documents
  async listDocuments(token: string, filters?: {
    type?: string;
    patientId?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.patientId) params.append('patientId', filters.patientId);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<{ data: any[] }>(`/documents${query}`, { token });
  }

  async getDocument(token: string, id: string) {
    return this.request<{ data: any }>(`/documents/${id}`, { token });
  }

  async createDocument(token: string, data: {
    type: string;
    title: string;
    content: string;
    patientId: string;
    appointmentId?: string;
    medications?: any[];
    cid10Code?: string;
    diagnosis?: string;
    validUntil?: string;
  }) {
    return this.request('/documents', {
      method: 'POST',
      token,
      body: JSON.stringify(data),
    });
  }

  async updateDocument(token: string, id: string, data: any) {
    return this.request(`/documents/${id}`, {
      method: 'PUT',
      token,
      body: JSON.stringify(data),
    });
  }

  async deleteDocument(token: string, id: string) {
    return this.request(`/documents/${id}`, {
      method: 'DELETE',
      token,
    });
  }

  async getDocumentTemplate(token: string, type: string, patientId: string) {
    return this.request<{ data: { title: string; content: string } }>(
      `/documents/template?type=${type}&patientId=${patientId}`,
      { token }
    );
  }

  async getPatientDocuments(token: string, patientId: string) {
    return this.request<{ data: any[] }>(`/documents/patient/${patientId}`, { token });
  }
}

export const api = new ApiClient(API_URL);

