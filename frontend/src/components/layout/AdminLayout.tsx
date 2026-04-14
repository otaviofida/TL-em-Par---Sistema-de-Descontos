import styled from 'styled-components';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import {
  House, Hamburger, CalendarRange, Users, CreditCard,
  ClipboardList, LogOut, Menu, User as UserIcon, BarChart3, Star, Megaphone,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react'; 
import ImageIllustration from '../../assets/admin-illustration.png';  
import { fadeIn } from '../../styles/animations';
import { VideoSplash } from '../VideoSplash';
import splashVideo from '../../assets/splash-video.mp4';

const Container = styled.div`
  min-height: 100vh;
  display: flex;
`;

const Sidebar = styled.aside<{ $open: boolean }>`
  width: 260px;
  background: ${({ theme }) => theme.colors.dark};
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 100;
  transition: transform 0.3s ease;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    transform: translateX(${({ $open }) => ($open ? '0' : '-100%')});
  }
`;

const SidebarHeader = styled.div`
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  img { height: 64px; }
`;

const AdminLabel = styled.span`
  display: block;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textLight};
  margin-top: 0.25rem;
`;

const NavSection = styled.nav`
  flex: 1;
  padding: 1rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow-y: auto;
  position: relative;
`;

const NavLink = styled(Link)<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 1rem;
  border-radius: ${({ theme }) => theme.radii.full};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ $active, theme }) => ($active ? theme.colors.white : 'rgba(255,255,255,0.7)')};
  background: ${({ $active, theme }) => ($active ? theme.colors.primary : 'transparent')};
  transition: all 0.4s ease-in-out;
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.white};
    gap: .4rem;
  }
`;

const SidebarFooter = styled.div`
  padding: 0.75rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const LogoutButton = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 1rem;
  border-radius: ${({ theme }) => theme.radii.lg};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: rgba(255, 255, 255, 0.5);
  transition: all 0.2s;

  &:hover {
    color: ${({ theme }) => theme.colors.error};
    background: rgba(239, 68, 68, 0.1);
  }
`;

const Content = styled.div`
  flex: 1;
  margin-left: 260px;
  min-height: 100vh;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    margin-left: 0;
  }
`;

const TopBar = styled.header`
  background-color: ${({ theme }) => theme.colors.background};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2rem 2rem;
  position: sticky;
  top: 0;
  z-index: 50;
`;

const TopBarLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const TopBarRight = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const TopBarTitle = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  font-weight: ${({ theme }) => theme.fontWeights.extrabold};
  color: ${({ theme }) => theme.colors.dark};
  span { color: ${({ theme }) => theme.colors.primary}; }

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: ${({ theme }) => theme.fontSizes.sm};
  }
`;

const TopBarDate = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.dark};
  background-color: ${({ theme }) => theme.colors.white};
  padding: .8rem 1.5rem;
  border-radius: ${({ theme }) => theme.radii.full};
  box-shadow: ${({ theme }) => theme.shadows.md};

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    display: none;
  }
`;

const AvatarWrapper = styled.div`
  position: relative;
`;

const AvatarButton = styled.button`
  width: 38px;
  height: 38px;
  box-shadow: ${({ theme }) => theme.shadows.md};
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid ${({ theme }) => theme.colors.primary};
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  transition: opacity 0.2s;

  &:hover { opacity: 0.85; }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const DropdownMenu = styled.div<{ $open: boolean }>`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  min-width: 180px;
  padding: 0.5rem 0;
  z-index: 200;
  opacity: ${({ $open }) => ($open ? 1 : 0)};
  transform: ${({ $open }) => ($open ? 'translateY(0) scale(1)' : 'translateY(-8px) scale(0.96)')};
  pointer-events: ${({ $open }) => ($open ? 'auto' : 'none')};
  transition: opacity 0.2s ease, transform 0.2s ease;
`;

const DropdownItem = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.625rem 1rem;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text};
  transition: background 0.15s;

  &:hover {
    background: ${({ theme }) => theme.colors.background};
  }
`;

const DropdownDivider = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.colors.border};
  margin: 0.25rem 0;
`;

const MobileMenuButton = styled.button`
  display: none;
  color: ${({ theme }) => theme.colors.text};
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) { display: flex; }
`;

const Main = styled.main`
  width: 100%;
  display: grid;
  margin: 0 auto;
  padding: 1.5rem;
  animation: ${fadeIn} 0.3s ease-out both;
  @media (min-width: ${({ theme }) => theme.breakpoints.md}) { padding: 2rem; }
`;

const Overlay = styled.div<{ $open: boolean }>`
  display: ${({ $open }) => ($open ? 'block' : 'none')};
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 99;
  @media (min-width: ${({ theme }) => theme.breakpoints.md}) { display: none; }
`;

const Image = styled.img`
    width: 100%;
    position: absolute;
    bottom: 0;
    left: 0;
`

const adminNav = [
  { to: '/admin', label: 'Dashboard', icon: House },
  { to: '/admin/empresas', label: 'Empresas', icon: Hamburger },
  { to: '/admin/edicoes', label: 'Edições', icon: CalendarRange },
  { to: '/admin/usuarios', label: 'Usuários', icon: Users },
  { to: '/admin/assinaturas', label: 'Assinaturas', icon: CreditCard },
  { to: '/admin/metricas', label: 'Métricas', icon: BarChart3 },
  { to: '/admin/validacoes', label: 'Validações', icon: ClipboardList },
  { to: '/admin/avaliacoes', label: 'Avaliações', icon: Star },
  { to: '/admin/marketing', label: 'Marketing', icon: Megaphone },
];

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showSplash, setShowSplash] = useState(() => {
    if (sessionStorage.getItem('show_splash') === 'true') {
      sessionStorage.removeItem('show_splash');
      return true;
    }
    return false;
  });
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const getInitials = (name?: string) => {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0].substring(0, 2).toUpperCase();
  };

  const formatDate = () => {
    const now = new Date();
    const months = [
      'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
      'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
    ];
    const day = now.getDate();
    const month = months[now.getMonth()];
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${day} de ${month} de ${year} ${hours}h${minutes}`;
  };

  const getPageTitle = () => {
    const current = adminNav.find((n) => isActive(n.to));
    return current ? current.label : 'Painel Administrativo';
  };

  return (
    <Container>
      {showSplash && (
        <VideoSplash src={splashVideo} onFinished={() => setShowSplash(false)} />
      )}
      <Overlay $open={sidebarOpen} onClick={() => setSidebarOpen(false)} />
      <Sidebar $open={sidebarOpen}>
        <SidebarHeader>
          <Logo to="/admin"><img src="/logo.png" alt="TL EM PAR" /></Logo>
          <AdminLabel>Painel Administrativo</AdminLabel>
        </SidebarHeader>
        <NavSection>
          {adminNav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              $active={isActive(to)}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
          <Image src={ImageIllustration} alt="Admin Illustration"/>
        </NavSection>
        <SidebarFooter>
          <LogoutButton onClick={handleLogout}>
            <LogOut size={18} />
            Sair
          </LogoutButton>
        </SidebarFooter>
      </Sidebar>

      <Content>
        <TopBar>
          <TopBarLeft>
            <MobileMenuButton onClick={() => setSidebarOpen(true)}>
              <Menu size={22} />
            </MobileMenuButton>
            <TopBarTitle>{getPageTitle()}</TopBarTitle>
          </TopBarLeft>
          <TopBarRight>
            <TopBarDate>{formatDate()}</TopBarDate>
            <AvatarWrapper ref={dropdownRef}>
              <AvatarButton onClick={() => setDropdownOpen((v) => !v)}>
                {getInitials(user?.name)}
              </AvatarButton>
              <DropdownMenu $open={dropdownOpen}>
                <DropdownItem onClick={() => { setDropdownOpen(false); navigate('/minha-conta'); }}>
                  <UserIcon size={16} />
                  Minha conta
                </DropdownItem>
                <DropdownDivider />
                <DropdownItem onClick={() => { setDropdownOpen(false); handleLogout(); }}>
                  <LogOut size={16} />
                  Sair
                </DropdownItem>
              </DropdownMenu>
            </AvatarWrapper>
          </TopBarRight>
        </TopBar>
        <Main>
          <Outlet />
        </Main>
      </Content>
    </Container>
  );
}
