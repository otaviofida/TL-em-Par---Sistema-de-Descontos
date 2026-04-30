import styled from 'styled-components';
import { Outlet, Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.background};
`;

const HeaderWrapper = styled.header`
  padding: 0 1.5rem;
  background: ${({ theme }) => theme.colors.background};
`;

const Header = styled.div`
  max-width: 1600px;
  width: 100%;
  margin: 0 auto;
  padding: 1rem 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  img { height: 48px; }
`;

const NavLinks = styled.nav`
  display: flex;
  align-items: center;
  gap: 2.5rem;

  a {
    font-size: ${({ theme }) => theme.fontSizes.md};
    font-weight: ${({ theme }) => theme.fontWeights.medium};
    color: ${({ theme }) => theme.colors.text};
    transition: color 0.2s;
    &:hover { color: ${({ theme }) => theme.colors.secondary}; }
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    display: none;
  }
`;

const NavButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const NavBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  padding: 0.5rem 1.1rem;
  border-radius: 999px;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.2s, transform 0.15s;
  text-decoration: none;
  border: none;

  &:hover { transform: translateY(-1px); }
`;

const SubscribeBtn = styled(NavBtn)`
  background: ${({ theme }) => theme.colors.secondary};
  color: ${({ theme }) => theme.colors.white};
  &:hover { background: #a06d48; }
`;

const AccessBtn = styled(NavBtn)`
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.dark};
  &:hover { background: ${({ theme }) => theme.colors.primaryDark}; }
`;

const Main = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

export function PublicLayout() {
  return (
    <Container>
      <HeaderWrapper>
        <Header>
          <Logo to="/"><img src="/logo.png" alt="TL EM PAR" /></Logo>
          <NavLinks>
            <Link to="/">Home</Link>
            <Link to="/sobre">Sobre nós</Link>
            <Link to="/restaurantes">Parceiros</Link>
            <Link to="/contato">Contato</Link>
          </NavLinks>
          <NavButtons>
            <SubscribeBtn as={Link as any} to="/cadastro">
              Quero assinar agora
              <ArrowRight size={15} />
            </SubscribeBtn>
            <AccessBtn as={Link as any} to="/login">
              Acessar
            </AccessBtn>
          </NavButtons>
        </Header>
      </HeaderWrapper>
      <Main>
        <Outlet />
      </Main>
    </Container>
  );
}
