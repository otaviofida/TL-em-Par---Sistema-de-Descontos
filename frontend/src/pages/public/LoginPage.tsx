import styled from 'styled-components';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
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

const FooterText = styled.p`
  text-align: center;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: 1.5rem;

  a {
    color: ${({ theme }) => theme.colors.primary};
    font-weight: ${({ theme }) => theme.fontWeights.semibold};
  }
`;

const BackLink = styled(Link)`
  display: block;
  text-align: center;
  margin-top: 1rem;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  transition: color 0.2s;
  &:hover { color: ${({ theme }) => theme.colors.primary}; }
`;

interface LoginFormData {
  email: string;
  password: string;
}

export function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (formData: LoginFormData) => {
    try {
      setLoading(true);
      await login(formData.email, formData.password);
      sessionStorage.setItem('show_splash', 'true');
      const user = useAuthStore.getState().user;
      navigate(user?.role === 'ADMIN' ? '/admin' : '/painel');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <FormCard>
        <Title>Bem-vindo</Title>
        <Subtitle>Entre para acessar seus benefícios</Subtitle>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="Email"
            type="email"
            placeholder="seu@email.com"
            error={errors.email?.message}
            {...register('email', { required: 'Email obrigatório' })}
          />
          <Input
            label="Senha"
            type="password"
            placeholder="Sua senha"
            error={errors.password?.message}
            {...register('password', { required: 'Senha obrigatória' })}
          />
          <Button type="submit" $fullWidth disabled={loading} $enabledImage>
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </Form>
        <FooterText>
          Não tem conta? <Link to="/cadastro">Criar conta</Link>
        </FooterText>
        <BackLink to="/">← Voltar à tela inicial</BackLink>
      </FormCard>
    </Container>
  );
}
