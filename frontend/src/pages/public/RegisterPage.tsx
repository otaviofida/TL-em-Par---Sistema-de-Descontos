import styled from 'styled-components';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Button, Input, Select } from '../../components/ui';
import { getErrorMessage } from '../../utils/errorMessages';
import { api } from '../../lib/api';
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
  max-width: 460px;
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

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
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

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  cpf: string;
  birthDate: string;
  gender: string;
}

export function RegisterPage() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterFormData>();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (formData: RegisterFormData) => {
    try {
      setLoading(true);
      // Registra e obtém tokens sem atualizar o state de auth
      const { data } = await api.post<{ success: boolean; data: { user: any; accessToken: string; refreshToken: string } }>(
        '/auth/register',
        {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone || undefined,
          cpf: formData.cpf || undefined,
          birthDate: formData.birthDate || undefined,
          gender: formData.gender || undefined,
        }
      );
      localStorage.setItem('@tlEmPar:accessToken', data.data.accessToken);
      localStorage.setItem('@tlEmPar:refreshToken', data.data.refreshToken);

      toast.success('Conta criada! Redirecionando para pagamento...');

      // Chama checkout antes de atualizar o state (evita redirect do PublicOnlyRoute)
      const checkout = await api.post<{ success: boolean; data: { checkoutUrl: string } }>(
        '/subscriptions/checkout',
        { priceId: import.meta.env.VITE_STRIPE_PRICE_ID }
      );
      window.location.href = checkout.data.data.checkoutUrl;
    } catch (err) {
      toast.error(getErrorMessage(err));
      setLoading(false);
    }
  };

  return (
    <Container>
      <FormCard>
        <Title>Crie sua conta no <span>TL EM PAR</span></Title>
        <Subtitle>Comece a aproveitar os benefícios gastronômicos</Subtitle>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="Nome completo"
            placeholder="Seu nome"
            error={errors.name?.message}
            {...register('name', { required: 'Nome obrigatório' })}
          />
          <Input
            label="Email"
            type="email"
            placeholder="seu@email.com"
            error={errors.email?.message}
            {...register('email', { required: 'Email obrigatório' })}
          />
          <Row>
            <Input
              label="Telefone"
              placeholder="(67) 99999-9999"
              error={errors.phone?.message}
              {...register('phone')}
            />
            <Input
              label="CPF"
              placeholder="000.000.000-00"
              error={errors.cpf?.message}
              {...register('cpf')}
            />
          </Row>
          <Row>
            <Input
              label="Data de nascimento"
              type="date"
              {...register('birthDate')}
            />
            <Select
              label="Gênero"
              placeholder="Selecione"
              options={[
                { value: 'masculino', label: 'Masculino' },
                { value: 'feminino', label: 'Feminino' },
                { value: 'outro', label: 'Outro' },
              ]}
              {...register('gender')}
            />
          </Row>
          <Input
            label="Senha"
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
            placeholder="Repita a senha"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword', {
              required: 'Confirme a senha',
              validate: (val) => val === watch('password') || 'As senhas não coincidem',
            })}
          />
          <Button type="submit" $fullWidth disabled={loading} $enabledImage>
            {loading ? 'Criando conta...' : 'Criar conta'}
          </Button>
        </Form>
        <FooterText>
          Já tem conta? <Link to="/login">Entrar</Link>
        </FooterText>
        <BackLink to="/">← Voltar à tela inicial</BackLink>
      </FormCard>
    </Container>
  );
}
