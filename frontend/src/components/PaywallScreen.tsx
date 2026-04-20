import styled, { keyframes } from 'styled-components';
import { Browser } from '@capacitor/browser';
import { Lock, ExternalLink, RefreshCw, LogOut } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Container = styled.div`
  min-height: 100dvh;
  background: ${({ theme }) => theme.colors.background};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1.5rem;
  animation: ${fadeIn} 0.4s ease-out;
`;

const IconWrapper = styled.div`
  width: 80px;
  height: 80px;
  background: ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.radii.full};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.text};
  text-align: center;
  margin-bottom: 0.75rem;
`;

const Description = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
  line-height: 1.6;
  max-width: 300px;
  margin-bottom: 2rem;
`;

const ButtonPrimary = styled.button`
  width: 100%;
  max-width: 320px;
  padding: 1rem;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.dark};
  border: none;
  border-radius: ${({ theme }) => theme.radii.lg};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  transition: background 0.2s;

  &:active {
    background: ${({ theme }) => theme.colors.primaryDark};
  }
`;

const ButtonSecondary = styled.button`
  width: 100%;
  max-width: 320px;
  padding: 0.875rem;
  background: transparent;
  color: ${({ theme }) => theme.colors.text};
  border: 1.5px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  transition: border-color 0.2s;

  &:active {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const LogoutButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textLight};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  margin-top: 0.5rem;
  padding: 0.5rem;
`;

const Logo = styled.img`
  height: 40px;
  margin-bottom: 2rem;
  object-fit: contain;
`;

interface PaywallScreenProps {
  onRefresh: () => void;
}

export function PaywallScreen({ onRefresh }: PaywallScreenProps) {
  const { logout } = useAuthStore();

  async function handleSubscribe() {
    await Browser.open({ url: 'https://tlempar.com.br/assinar' });
  }

  return (
    <Container>
      <Logo src="/logo.png" alt="TL em Par" />
      <IconWrapper>
        <Lock size={36} color="#000" />
      </IconWrapper>
      <Title>Assinatura necessária</Title>
      <Description>
        Para acessar os benefícios, você precisa ter uma assinatura ativa no TL em Par.
      </Description>

      <ButtonPrimary onClick={handleSubscribe}>
        <ExternalLink size={18} />
        Assinar pelo site
      </ButtonPrimary>

      <ButtonSecondary onClick={onRefresh}>
        <RefreshCw size={16} />
        Já assinei — verificar acesso
      </ButtonSecondary>

      <LogoutButton onClick={logout}>
        <LogOut size={14} />
        Sair da conta
      </LogoutButton>
    </Container>
  );
}
