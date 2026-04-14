import styled, { css } from 'styled-components';

import imageButton from '../../assets/iconteste.png';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  $variant?: ButtonVariant;
  $size?: ButtonSize;
  $fullWidth?: boolean;
  $widthImage?: string;
    $enabledImage?: boolean;
}

const variants = {
  primary: css`
    background: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.dark};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
    &:hover:not(:disabled) { background: ${({ theme }) => theme.colors.primaryDark}; }
  `,
  secondary: css`
    background: ${({ theme }) => theme.colors.secondary};
    color: ${({ theme }) => theme.colors.white};
    &:hover:not(:disabled) { opacity: 0.9; }
  `,
  outline: css`
    background: transparent;
    color: ${({ theme }) => theme.colors.primary};
    border: 1px solid ${({ theme }) => theme.colors.primary};
    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.colors.primary};
      color: ${({ theme }) => theme.colors.dark};
    }
  `,
  ghost: css`
    background: transparent;
    color: ${({ theme }) => theme.colors.textSecondary};
    &:hover:not(:disabled) { background: ${({ theme }) => theme.colors.surfaceAlt}; }
  `,
  danger: css`
    background: ${({ theme }) => theme.colors.error};
    color: ${({ theme }) => theme.colors.white};
    &:hover:not(:disabled) { opacity: 0.9; }
  `,
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _sizes = {
  sm: css`
    padding: 0.5rem 1rem;
    font-size: ${({ theme }) => theme.fontSizes.sm};
  `,
  md: css`
    padding: 0.75rem 1.5rem;
    font-size: ${({ theme }) => theme.fontSizes.md};
  `,
  lg: css`
    padding: 1rem 2rem;
    font-size: ${({ theme }) => theme.fontSizes.lg};
  `,
};

export const Button = styled.button<ButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: none;
  border-radius: 999px;
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  padding: 1rem 1.5rem;
  font-size: ${({ theme }) => theme.fontSizes.md};
  transition: all 0.2s ease;
  cursor: pointer;
  white-space: nowrap;
  position: relative;
  overflow: hidden;

  ${({ $variant = 'primary' }) => variants[$variant]}
  ${({ $fullWidth }) => $fullWidth && css`width: 100%;`}


    ${({ $enabledImage }) => $enabledImage && css`
    &::after{
    content: '';
    background: url(${imageButton}) no-repeat center;
    background-size: contain;
    width: 150px;
    height: 150px;
    position: absolute;
    right: -150px;
    transform: rotate(-30deg);
    bottom: -50px;
    opacity: 0;
    transition: all .5s ease-in-out;
  }
    `}

    &:hover::after {
        opacity: 1;
        right: 0;
    }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }
`;
