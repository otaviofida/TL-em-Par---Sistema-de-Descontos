import styled from 'styled-components';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
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

interface ForgotPasswordFormData {
  email: string;
}

export function ForgotPasswordPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormData>();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (formData: ForgotPasswordFormData) => {
    try {
      setLoading(true);
      await api.post('/auth/forgot-password', { email: formData.email });
      setSent(true);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <FormCard>
        <Title>Esqueceu a <span>senha</span>?</Title>
        <Subtitle>Informe seu email para receber o link de redefinição</Subtitle>

        {sent ? (
          <>
            <SuccessMessage>
              <p>✉️ Email enviado!</p>
              <span>Se o email estiver cadastrado, você receberá um link para redefinir a senha.</span>
            </SuccessMessage>
            <BackLink to="/login">← Voltar ao login</BackLink>
          </>
        ) : (
          <>
            <Form onSubmit={handleSubmit(onSubmit)}>
              <Input
                label="Email"
                type="email"
                placeholder="seu@email.com"
                error={errors.email?.message}
                {...register('email', { required: 'Email obrigatório' })}
              />
              <Button type="submit" $fullWidth disabled={loading}>
                {loading ? 'Enviando...' : 'Enviar link de redefinição'}
              </Button>
            </Form>
            <BackLink to="/login">← Voltar ao login</BackLink>
          </>
        )}
      </FormCard>
    </Container>
  );
}
