import styled from 'styled-components';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Home, UtensilsCrossed, QrCode, History, User, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const HeaderWrapper = styled.header`
  background: ${({ theme }) => theme.colors.dark};
  position: sticky;
  top: 0;
  z-index: 100;
`;

const Header = styled.div`
  max-width: 1380px;
  width: 100%;
  margin: 0 auto;
  padding: 0 1.5rem;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  img { height: 36px; }
`;

const MobileMenuButton = styled.button`
  color: ${({ theme }) => theme.colors.white};
  display: flex;
  align-items: center;
  @media (min-width: ${({ theme }) => theme.breakpoints.md}) { display: none; }
`;

const Nav = styled.nav<{ $open: boolean }>`
  display: flex;
  gap: 0.25rem;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    display: ${({ $open }) => ($open ? 'flex' : 'none')};
    position: fixed;
    top: 64px;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${({ theme }) => theme.colors.dark};
    flex-direction: column;
    padding: 1rem;
    z-index: 99;
  }
`;

const NavLink = styled(Link)<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: ${({ theme }) => theme.radii.lg};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ $active, theme }) => ($active ? theme.colors.primary : theme.colors.white)};
  background: ${({ $active, theme }) => ($active ? 'rgba(254, 182, 33, 0.1)' : 'transparent')};
  transition: all 0.2s;

  &:hover {
    background: rgba(254, 182, 33, 0.1);
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: ${({ theme }) => theme.radii.lg};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ theme }) => theme.colors.textLight};
  transition: all 0.2s;

  &:hover {
    background: rgba(239, 68, 68, 0.1);
    color: ${({ theme }) => theme.colors.error};
  }
`;

const Main = styled.main`
  flex: 1;
  max-width: 1380px;
  width: 100%;
  margin: 0 auto;
  padding: 1.5rem;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: 2rem;
  }
`;

const navItems = [
  { to: '/painel', label: 'Início', icon: Home },
  { to: '/empresas', label: 'Empresas', icon: UtensilsCrossed },
  { to: '/validar', label: 'QR Code', icon: QrCode },
  { to: '/historico', label: 'Histórico', icon: History },
  { to: '/perfil', label: 'Perfil', icon: User },
];

export function SubscriberLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Container>
      <HeaderWrapper>
        <Header>
          <Logo to="/painel"><img src="/logo.png" alt="TL EM PAR" /></Logo>
          <MobileMenuButton onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </MobileMenuButton>
          <Nav $open={menuOpen}>
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                $active={location.pathname === to}
                onClick={() => setMenuOpen(false)}
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
            <LogoutButton onClick={handleLogout}>
              <LogOut size={18} />
              Sair
            </LogoutButton>
          </Nav>
        </Header>
      </HeaderWrapper>
      <Main>
        <Outlet />
      </Main>
    </Container>
  );
}
