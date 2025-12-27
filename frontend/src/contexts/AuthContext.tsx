'use client';

/**
 * Auth Context
 * Gerencia o estado de autenticação do usuário
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Psychologist } from '@/lib/types';

interface AuthContextData {
  psychologist: Psychologist | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    name: string;
    crp: string;
    phone?: string;
  }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [psychologist, setPsychologist] = useState<Psychologist | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Carrega o token do localStorage ao iniciar
    const storedToken = localStorage.getItem('token');
    const storedPsychologist = localStorage.getItem('psychologist');

    if (storedToken && storedPsychologist) {
      setToken(storedToken);
      setPsychologist(JSON.parse(storedPsychologist));
    }

    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.login({ email, password });
      const { psychologist: psych, accessToken } = response.data;

      setToken(accessToken);
      setPsychologist(psych);

      localStorage.setItem('token', accessToken);
      localStorage.setItem('psychologist', JSON.stringify(psych));

      router.push('/dashboard');
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao fazer login');
    }
  };

  const register = async (data: {
    email: string;
    password: string;
    name: string;
    crp: string;
    phone?: string;
  }) => {
    try {
      await api.register(data);
      // Após registro, faz login automaticamente
      await login(data.email, data.password);
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao registrar');
    }
  };

  const logout = () => {
    setToken(null);
    setPsychologist(null);
    localStorage.removeItem('token');
    localStorage.removeItem('psychologist');
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        psychologist,
        token,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
