import styled from 'styled-components';
import { Outlet, Link } from 'react-router-dom';
import { Button } from '../ui';

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const HeaderWrapper = styled.header`
  padding: 0 1.5rem;
  background-color: ${({ theme }) => theme.colors.dark};
`;

const Header = styled.div`
  max-width: 1380px;
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

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 2.5rem;

  a {
    font-size: ${({ theme }) => theme.fontSizes.md};
    font-weight: ${({ theme }) => theme.fontWeights.normal};
    color: ${({ theme }) => theme.colors.white};
    transition: all 0.3s;
    &:hover {
      opacity: 0.8;
      transform: translateY(-3px);
    }
  }
`;

const NavButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
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
            <Link to="/">Início</Link>
            <Link to="/sobre">Sobre</Link>
            <Link to="/sobre">Restaurantes Parceiros</Link>
            <Link to="/contato">Contato</Link>
          </NavLinks>
          <NavButtons>
            <Button as={Link} to="/cadastro" $variant="outline" $size="sm">Criar conta</Button>
            <Button as={Link} to="/login" $variant="primary" $size="sm">Entrar</Button>
          </NavButtons>
        </Header>
      </HeaderWrapper>
      <Main>
        <Outlet />
      </Main>
    </Container>
  );
}
