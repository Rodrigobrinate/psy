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
}

export const api = new ApiClient(API_URL);
