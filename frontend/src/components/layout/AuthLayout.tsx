import styled from 'styled-components';
import { Outlet } from 'react-router-dom';
import heroBg from '../../assets/background-login.jpg';
import heroBgMobile from '../../assets/background-login-mobile.jpg';

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: url(${heroBg}) center / cover no-repeat fixed;
  padding-top: var(--safe-area-top);
  padding-bottom: var(--safe-area-bottom);

  @media (max-width: 768px) {
    background-image: url(${heroBgMobile});
  }
`;

const Main = styled.main`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

export function AuthLayout() {
  return (
    <Container>
      <Main>
        <Outlet />
      </Main>
    </Container>
  );
}
