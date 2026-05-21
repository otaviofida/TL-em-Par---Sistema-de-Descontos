import styled, { keyframes } from 'styled-components';
import { Link } from 'react-router-dom';
import { Rocket, Bell } from 'lucide-react';

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const Wrapper = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.dark};
  padding: 2rem 1.5rem;
  text-align: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, ${({ theme }) => theme.colors.primary}22 0%, transparent 70%);
    top: -200px;
    left: 50%;
    transform: translateX(-50%);
    pointer-events: none;
  }
`;

const Card = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  max-width: 440px;
  width: 100%;
  animation: ${fadeUp} 0.6s ease-out both;
`;

const Logo = styled.img`
  height: 72px;
  object-fit: contain;
`;

const IconWrapper = styled.div`
  width: 80px;
  height: 80px;
  background: ${({ theme }) => theme.colors.primary}22;
  border: 2px solid ${({ theme }) => theme.colors.primary}44;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${float} 3s ease-in-out infinite;
  color: ${({ theme }) => theme.colors.primary};
`;

const Badge = styled.span`
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.dark};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  padding: 0.25rem 0.875rem;
  border-radius: ${({ theme }) => theme.radii.full};
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes['3xl']};
  font-weight: ${({ theme }) => theme.fontWeights.extrabold};
  color: ${({ theme }) => theme.colors.white};
  line-height: 1.2;

  span { color: ${({ theme }) => theme.colors.primary}; }
`;

const Description = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.7;
  max-width: 360px;
`;

const Divider = styled.div`
  width: 48px;
  height: 3px;
  background: ${({ theme }) => theme.colors.primary};
  border-radius: 2px;
`;

const LoginLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 2rem;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.dark};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  border-radius: ${({ theme }) => theme.radii.full};
  transition: opacity 0.2s;

  &:hover { opacity: 0.85; }
`;

const SecondaryLink = styled(Link)`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: rgba(255, 255, 255, 0.4);
  transition: color 0.2s;

  &:hover { color: rgba(255, 255, 255, 0.7); }
`;

export function LaunchScreen() {
  return (
    <Wrapper>
      <Card>
        <Logo src="/logo.png" alt="TL EM PAR" />

        <IconWrapper>
          <Rocket size={36} />
        </IconWrapper>

        <Badge>Em breve</Badge>

        <Title>
          Lançamento<br />
          <span>TL EM PAR</span>
        </Title>

        <Divider />

        <Description>
          Estamos finalizando os últimos detalhes para o nosso lançamento oficial.
          Os cadastros serão liberados em breve. Fique atento!
        </Description>

        <LoginLink to="/login">
          <Bell size={16} />
          Já tenho uma conta
        </LoginLink>

        <SecondaryLink to="/">← Voltar ao início</SecondaryLink>
      </Card>
    </Wrapper>
  );
}
