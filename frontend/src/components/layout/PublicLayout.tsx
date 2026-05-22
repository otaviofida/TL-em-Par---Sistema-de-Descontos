import styled, { keyframes } from 'styled-components';
import { Outlet, Link } from 'react-router-dom';
import { ArrowRight, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';

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

const pulse = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.5); }
  50% { box-shadow: 0 0 0 12px rgba(37, 211, 102, 0); }
`;

const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
`;

const FloatBtn = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  flex-shrink: 0;
  border-radius: 50%;
  background: #25d366;
  color: #fff;
  text-decoration: none;
  animation: ${pulse} 2s ease-in-out infinite, ${bounce} 3s ease-in-out infinite;
  transition: transform 0.2s;

  &:hover {
    animation: none;
    transform: scale(1.1);
  }

  svg { width: 28px; height: 28px; fill: #fff; }
`;

const Tooltip = styled.div`
  background: #111;
  color: #fff;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.45rem 0.85rem;
  border-radius: 8px;
  white-space: nowrap;
  opacity: 0;
  transform: translateX(8px);
  transition: opacity 0.2s, transform 0.2s;

  &::after {
    content: '';
    position: absolute;
    top: 50%;
    right: -6px;
    transform: translateY(-50%);
    border: 6px solid transparent;
    border-left-color: #111;
    border-right: none;
  }
`;

const FloatGroup = styled.div`
  position: fixed;
  bottom: 1.75rem;
  right: 1.75rem;
  z-index: 999;
  display: flex;
  align-items: center;
  gap: 0.75rem;

  &:hover ${Tooltip} {
    opacity: 1;
    transform: translateX(0);
  }
`;

export function PublicLayout() {
  const [menuOpen, setMenuOpen] = useState(false);

  const { data: publicSettings } = useQuery({
    queryKey: ['public-settings'],
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; data: { registrationEnabled: boolean; whatsappGroupUrl?: string | null } }>('/settings');
      return data.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const groupUrl = publicSettings?.whatsappGroupUrl;

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

      {groupUrl && (
        <FloatGroup>
          <Tooltip>Entre no grupo e fique sabendo das promoções</Tooltip>
          <FloatBtn href={groupUrl} target="_blank" rel="noopener noreferrer" aria-label="Entrar no grupo de promoções">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </FloatBtn>
        </FloatGroup>
      )}
    </Container>
  );
}
