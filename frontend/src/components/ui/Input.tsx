import styled, { css } from 'styled-components';
import { forwardRef, useState } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputWrapperProps {
  $hasError?: boolean;
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
`;

const Label = styled.label`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ theme }) => theme.colors.text};
`;

const InputContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const StyledInput = styled.input<InputWrapperProps & { $hasToggle?: boolean }>`
  width: 100%;
  padding: 0.75rem 1rem;
  ${({ $hasToggle }) => $hasToggle && css`padding-right: 2.75rem;`}
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.text};
  background: ${({ theme }) => theme.colors.white};
  transition: border-color 0.2s ease;
  outline: none;

  &::placeholder {
    color: ${({ theme }) => theme.colors.textLight};
  }

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
  }

  ${({ $hasError, theme }) =>
    $hasError &&
    css`
      border-color: ${theme.colors.error};
      &:focus { border-color: ${theme.colors.error}; }
    `}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background: ${({ theme }) => theme.colors.surfaceAlt};
  }
`;

const ToggleButton = styled.button`
  position: absolute;
  right: 0.75rem;
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.textSecondary};
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }
`;

const ErrorMessage = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.error};
`;

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, type, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';

    return (
      <Wrapper>
        {label && <Label>{label}</Label>}
        <InputContainer>
          <StyledInput
            ref={ref}
            type={isPassword && showPassword ? 'text' : type}
            $hasError={!!error}
            $hasToggle={isPassword}
            {...props}
          />
          {isPassword && (
            <ToggleButton
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              tabIndex={-1}
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </ToggleButton>
          )}
        </InputContainer>
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </Wrapper>
    );
  }
);

Input.displayName = 'Input';
