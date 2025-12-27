'use client';

/**
 * Protected Route Component
 * Protege rotas que requerem autenticação
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingPage } from './ui/Loading';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { psychologist, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !psychologist) {
      router.push('/login');
    }
  }, [psychologist, isLoading, router]);

  if (isLoading) {
    return <LoadingPage />;
  }

  if (!psychologist) {
    return <LoadingPage />;
  }

  return <>{children}</>;
}
