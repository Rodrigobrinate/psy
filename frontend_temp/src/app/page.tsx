'use client';

/**
 * Landing Page
 * Página inicial do Psy-Manager AI
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { LoadingPage } from '@/components/ui/Loading';

export default function Home() {
  const { psychologist, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && psychologist) {
      router.push('/dashboard');
    }
  }, [psychologist, isLoading, router]);

  if (isLoading) {
    return <LoadingPage />;
  }

  if (psychologist) {
    return <LoadingPage />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
              P
            </div>
            <span className="text-2xl font-bold text-gray-900">Psy-Manager AI</span>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => router.push('/login')}>
              Entrar
            </Button>
            <Button onClick={() => router.push('/register')}>
              Começar Grátis
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Gestão Inteligente para
            <span className="text-indigo-600"> Psicólogos</span>
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Sistema completo de gerenciamento de consultório com IA integrada.
            Organize pacientes, sessões e testes psicológicos em uma única plataforma.
          </p>

          <div className="flex gap-4 justify-center mb-20">
            <Button size="lg" onClick={() => router.push('/register')}>
              Criar Conta Gratuita
            </Button>
            <Button size="lg" variant="outline" onClick={() => router.push('/login')}>
              Já tenho conta
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mt-20">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Gestão de Pacientes</h3>
              <p className="text-gray-600">
                Organize prontuários, histórico de sessões e evolução clínica de forma segura.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Testes Psicológicos</h3>
              <p className="text-gray-600">
                Aplique PHQ-9, GAD-7 e outros testes com correção automática e gráficos de evolução.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">IA Integrada (Pro)</h3>
              <p className="text-gray-600">
                Sugestões de perguntas em tempo real e análise de inconsistências nos testes.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-20 border-t border-gray-200">
        <div className="text-center text-gray-600">
          <p>Psy-Manager AI - Sistema de Gestão para Psicólogos</p>
          <p className="text-sm mt-2">Dados protegidos conforme LGPD</p>
        </div>
      </footer>
    </div>
  );
}
