import styled, { css } from 'styled-components';
import { ReactNode } from 'react';

type CardVariant = 'default' | 'elevated' | 'bordered';

interface CardContainerProps {
  $variant?: CardVariant;
  $clickable?: boolean;
}

const variantStyles = {
  default: css`
    background: ${({ theme }) => theme.colors.surface};
    box-shadow: ${({ theme }) => theme.shadows.sm};
  `,
  elevated: css`
    background: ${({ theme }) => theme.colors.surface};
    box-shadow: ${({ theme }) => theme.shadows.md};
  `,
  bordered: css`
    background: ${({ theme }) => theme.colors.surface};
    border: 1px solid ${({ theme }) => theme.colors.border};
  `,
};

const Container = styled.div<CardContainerProps>`
  border-radius: ${({ theme }) => theme.radii.xl};
  padding: ${({ theme }) => theme.spacing.lg};
  transition: all 0.2s ease;
  ${({ $variant = 'default' }) => variantStyles[$variant]}

  ${({ $clickable }) =>
    $clickable &&
    css`
      cursor: pointer;
      &:hover { box-shadow: ${({ theme }) => theme.shadows.lg}; transform: translateY(-2px); }
    `}
`;

interface CardProps {
  children: ReactNode;
  variant?: CardVariant;
  clickable?: boolean;
  onClick?: () => void;
  className?: string;
}

export function Card({ children, variant = 'default', clickable, onClick, className }: CardProps) {
  return (
    <Container $variant={variant} $clickable={clickable} onClick={onClick} className={className}>
      {children}
    </Container>
  );
}
