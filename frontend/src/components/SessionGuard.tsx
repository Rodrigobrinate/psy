'use client';

/**
 * Session Guard
 * Verifica se há uma sessão ativa e redireciona automaticamente
 */

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Loading } from './ui/Loading';

interface SessionGuardProps {
  children: React.ReactNode;
}

export function SessionGuard({ children }: SessionGuardProps) {
  const { token } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  useEffect(() => {
    checkActiveSession();
  }, [token, pathname]);

  const checkActiveSession = async () => {
    if (!token) {
      setIsChecking(false);
      return;
    }

    try {
      const response = await api.getActiveSession(token);
      const activeSession = response.data;

      if (activeSession) {
        setActiveSessionId(activeSession.id);

        // Se há uma sessão ativa e não estamos na página da sessão, redirecionar
        if (!pathname.includes(`/session/${activeSession.id}`)) {
          console.log('Sessão ativa detectada, redirecionando para:', activeSession.id);
          router.push(`/dashboard/session/${activeSession.id}`);
          return;
        }
      } else {
        setActiveSessionId(null);
      }
    } catch (error) {
      console.error('Erro ao verificar sessão ativa:', error);
    } finally {
      setIsChecking(false);
    }
  };

  // Bloquear navegação se estiver em uma sessão ativa
  useEffect(() => {
    if (!activeSessionId || !pathname.includes('/session/')) {
      return;
    }

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'Você tem uma sessão em andamento. Deseja realmente sair?';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [activeSessionId, pathname]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loading />
          <p className="mt-4 text-gray-600">Verificando sessões ativas...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
