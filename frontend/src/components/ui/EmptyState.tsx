import styled from 'styled-components';
import { AlertTriangle } from 'lucide-react';
import { Button } from './Button';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
  gap: 1rem;
`;

const IconWrapper = styled.div`
  color: ${({ theme }) => theme.colors.error};
`;

const Title = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: ${({ theme }) => theme.colors.text};
`;

const Message = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  max-width: 400px;
`;

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({
  title = 'Nada encontrado',
  message = 'Não há dados para exibir no momento.',
  icon,
  action,
}: EmptyStateProps) {
  return (
    <Container>
      {icon ?? <IconWrapper><AlertTriangle size={48} /></IconWrapper>}
      <Title>{title}</Title>
      <Message>{message}</Message>
      {action && (
        <Button $variant="primary" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </Container>
  );
}
