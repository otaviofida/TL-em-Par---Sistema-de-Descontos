import styled, { css } from 'styled-components';
import type { ReactNode } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

type BadgeVariant = 'success' | 'error' | 'warning' | 'info' | 'neutral';

const badgeStyles = {
  success: css`
    background: ${({ theme }) => theme.colors.successBg};
    color: ${({ theme }) => theme.colors.success};
  `,
  error: css`
    background: ${({ theme }) => theme.colors.errorBg};
    color: ${({ theme }) => theme.colors.error};
  `,
  warning: css`
    background: ${({ theme }) => theme.colors.warningBg};
    color: ${({ theme }) => theme.colors.warning};
  `,
  info: css`
    background: ${({ theme }) => theme.colors.infoBg};
    color: ${({ theme }) => theme.colors.info};
  `,
  neutral: css`
    background: ${({ theme }) => theme.colors.surfaceAlt};
    color: ${({ theme }) => theme.colors.textSecondary};
  `,
};

const StyledBadge = styled.span<{ $variant: BadgeVariant }>`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.75rem;
  border-radius: ${({ theme }) => theme.radii.full};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  ${({ $variant }) => badgeStyles[$variant]}
`;

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  showIcon?: boolean;
}

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
  neutral: Info,
};

export function Badge({ variant = 'neutral', children, showIcon }: BadgeProps) {
  const Icon = icons[variant];
  return (
    <StyledBadge $variant={variant}>
      {showIcon && <Icon size={12} />}
      {children}
    </StyledBadge>
  );
}

// Helpers para status
export function SubscriptionBadge({ status, cancelAtPeriodEnd }: { status: string; cancelAtPeriodEnd?: boolean }) {
  if (status === 'ACTIVE' && cancelAtPeriodEnd) {
    return <Badge variant="warning" showIcon>Cancelando</Badge>;
  }
  const map: Record<string, { variant: BadgeVariant; label: string }> = {
    ACTIVE: { variant: 'success', label: 'Ativa' },
    PAST_DUE: { variant: 'warning', label: 'Pendente' },
    CANCELED: { variant: 'error', label: 'Cancelada' },
  };
  const config = map[status] ?? { variant: 'neutral' as BadgeVariant, label: status };
  return <Badge variant={config.variant} showIcon>{config.label}</Badge>;
}

export function CompanyStatusBadge({ status }: { status: string }) {
  const map: Record<string, { variant: BadgeVariant; label: string }> = {
    ACTIVE: { variant: 'success', label: 'Ativa' },
    INACTIVE: { variant: 'error', label: 'Inativa' },
  };
  const config = map[status] ?? { variant: 'neutral' as BadgeVariant, label: status };
  return <Badge variant={config.variant} showIcon>{config.label}</Badge>;
}

export function EditionStatusBadge({ status }: { status: string }) {
  const map: Record<string, { variant: BadgeVariant; label: string }> = {
    DRAFT: { variant: 'neutral', label: 'Rascunho' },
    ACTIVE: { variant: 'success', label: 'Ativa' },
    FINISHED: { variant: 'info', label: 'Encerrada' },
  };
  const config = map[status] ?? { variant: 'neutral' as BadgeVariant, label: status };
  return <Badge variant={config.variant} showIcon>{config.label}</Badge>;
}
