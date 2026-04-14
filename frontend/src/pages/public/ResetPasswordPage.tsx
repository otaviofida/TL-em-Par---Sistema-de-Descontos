import styled from 'styled-components';
import { useForm } from 'react-hook-form';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { api } from '../../lib/api';
import { Button, Input } from '../../components/ui';
import { getErrorMessage } from '../../utils/errorMessages';
import toast from 'react-hot-toast';
import { scaleIn } from '../../styles/animations';

const Container = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
`;

const FormCard = styled.div`
  width: 100%;
  max-width: 420px;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.xl};
  padding: 2.5rem 2rem;
  box-shadow: ${({ theme }) => theme.shadows.lg};
  animation: ${scaleIn} 0.4s ease-out both;
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  text-align: center;
  margin-bottom: 0.25rem;

  span { color: ${({ theme }) => theme.colors.primary}; }
`;

const Subtitle = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  margin-bottom: 2rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const SuccessMessage = styled.div`
  text-align: center;
  padding: 1.5rem;
  background: ${({ theme }) => `${theme.colors.success}10`};
  border-radius: ${({ theme }) => theme.radii.lg};
  margin-bottom: 1rem;

  p {
    color: ${({ theme }) => theme.colors.success};
    font-weight: ${({ theme }) => theme.fontWeights.medium};
    margin-bottom: 0.5rem;
  }

  span {
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: ${({ theme }) => theme.fontSizes.sm};
  }
`;

const BackLink = styled(Link)`
  display: block;
  text-align: center;
  margin-top: 1.5rem;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  transition: color 0.2s;
  &:hover { color: ${({ theme }) => theme.colors.primary}; }
`;

interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

export function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors } } = useForm<ResetPasswordFormData>();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const password = watch('password');

  const onSubmit = async (formData: ResetPasswordFormData) => {
    try {
      setLoading(true);
      await api.post('/auth/reset-password', {
        token,
        password: formData.password,
      });
      setSuccess(true);
      toast.success('Senha redefinida com sucesso!');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <FormCard>
        <Title>Redefinir <span>senha</span></Title>
        <Subtitle>Crie uma nova senha para sua conta</Subtitle>

        {success ? (
          <>
            <SuccessMessage>
              <p>✅ Senha redefinida!</p>
              <span>Você será redirecionado para o login em instantes...</span>
            </SuccessMessage>
            <BackLink to="/login">Ir para o login</BackLink>
          </>
        ) : (
          <>
            <Form onSubmit={handleSubmit(onSubmit)}>
              <Input
                label="Nova senha"
                type="password"
                placeholder="Mínimo 8 caracteres"
                error={errors.password?.message}
                {...register('password', {
                  required: 'Senha obrigatória',
                  minLength: { value: 8, message: 'Mínimo 8 caracteres' },
                })}
              />
              <Input
                label="Confirmar senha"
                type="password"
                placeholder="Repita a nova senha"
                error={errors.confirmPassword?.message}
                {...register('confirmPassword', {
                  required: 'Confirmação obrigatória',
                  validate: (value) => value === password || 'As senhas não coincidem',
                })}
              />
              <Button type="submit" $fullWidth disabled={loading}>
                {loading ? 'Redefinindo...' : 'Redefinir senha'}
              </Button>
            </Form>
            <BackLink to="/login">← Voltar ao login</BackLink>
          </>
        )}
      </FormCard>
    </Container>
  );
}
