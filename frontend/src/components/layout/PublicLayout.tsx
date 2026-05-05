import styled from 'styled-components';
import { Outlet, Link } from 'react-router-dom';
import { ArrowRight, Menu, X } from 'lucide-react';
import { useState } from 'react';

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

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    display: none;
  }
`;

const AccessBtn = styled(NavBtn)`
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.dark};
  &:hover { background: ${({ theme }) => theme.colors.primaryDark}; }
`;

const HamburgerBtn = styled.button`
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text};
  padding: 0.25rem;
  align-items: center;
  justify-content: center;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    display: flex;
  }
`;

const MobileMenu = styled.nav<{ $open: boolean }>`
  display: none;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    display: flex;
    flex-direction: column;
    background: ${({ theme }) => theme.colors.surface};
    border-top: 1px solid ${({ theme }) => theme.colors.border};
    max-height: ${({ $open }) => ($open ? '400px' : '0')};
    overflow: hidden;
    transition: max-height 0.3s ease;

    a {
      padding: 0.9rem 1.5rem;
      border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight};
      font-size: ${({ theme }) => theme.fontSizes.md};
      font-weight: ${({ theme }) => theme.fontWeights.medium};
      color: ${({ theme }) => theme.colors.text};
      text-decoration: none;
      &:last-child { border-bottom: none; }
      &:hover { color: ${({ theme }) => theme.colors.secondary}; }
    }
  }
`;

const Main = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

export function PublicLayout() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <Container>
      <HeaderWrapper>
        <Header>
          <Logo to="/"><img src="/logo.png" alt="TL EM PAR" /></Logo>
          <NavLinks>
            <Link to="/">Home</Link>
            <Link to="/sobre">Sobre nós</Link>
            <Link to="/parceiros">Parceiros</Link>
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
            <HamburgerBtn onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </HamburgerBtn>
          </NavButtons>
        </Header>
      </HeaderWrapper>
      <MobileMenu $open={menuOpen}>
        <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
        <Link to="/parceiros" onClick={() => setMenuOpen(false)}>Parceiros</Link>
        <Link to="/contato" onClick={() => setMenuOpen(false)}>Contato</Link>
        <Link to="/cadastro" onClick={() => setMenuOpen(false)}>Quero assinar agora →</Link>
      </MobileMenu>
      <Main>
        <Outlet />
      </Main>
    </Container>
  );
}
