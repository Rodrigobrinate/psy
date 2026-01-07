/**
 * Badge Component
 * Badge reutilizável para status e categorias
 */

import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}: BadgeProps) {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
    purple: 'bg-purple-100 text-purple-800',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  };

  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}

// Status-specific badges
export function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; variant: BadgeProps['variant'] }> = {
    SCHEDULED: { label: 'Agendado', variant: 'info' },
    IN_PROGRESS: { label: 'Em Andamento', variant: 'warning' },
    COMPLETED: { label: 'Concluído', variant: 'success' },
    CANCELLED: { label: 'Cancelado', variant: 'danger' },
    // Severity levels
    MINIMAL: { label: 'Mínimo', variant: 'success' },
    MILD: { label: 'Leve', variant: 'info' },
    MODERATE: { label: 'Moderado', variant: 'warning' },
    MODERATELY_SEVERE: { label: 'Mod. Grave', variant: 'warning' },
    SEVERE: { label: 'Grave', variant: 'danger' },
  };

  const config = statusConfig[status] || { label: status, variant: 'default' };

  return <Badge variant={config.variant}>{config.label}</Badge>;
}

// Category badges for tests
export function CategoryBadge({ category }: { category: string }) {
  const categoryConfig: Record<string, { label: string; variant: BadgeProps['variant'] }> = {
    ANXIETY: { label: 'Ansiedade', variant: 'warning' },
    DEPRESSION: { label: 'Depressão', variant: 'info' },
    ADHD: { label: 'TDAH', variant: 'purple' },
    AUTISM: { label: 'Autismo', variant: 'purple' },
    PTSD: { label: 'TEPT', variant: 'danger' },
    PERSONALITY: { label: 'Personalidade', variant: 'default' },
    RELATIONSHIP: { label: 'Relacionamento', variant: 'success' },
  };

  const config = categoryConfig[category] || { label: category, variant: 'default' };

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
