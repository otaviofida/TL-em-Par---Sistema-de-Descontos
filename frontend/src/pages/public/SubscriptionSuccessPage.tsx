import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, Loader, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui';
import { api } from '../../lib/api';
import { useAuthStore } from '../../stores/authStore';

const Container = styled.div`
  min-height: 80vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem;
  gap: 1rem;
`;

const IconWrapper = styled.div<{ $error?: boolean }>`
  color: ${({ theme, $error }) => $error ? theme.colors.error : theme.colors.success};
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes['3xl']};
  span { color: ${({ theme }) => theme.colors.primary}; }
`;

const Message = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  max-width: 400px;
`;

const Spinner = styled(Loader)`
  animation: spin 1s linear infinite;
  @keyframes spin { to { transform: rotate(360deg); } }
`;

export function SubscriptionSuccessPage() {
  const [searchParams] = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState(false);
  const loadUser = useAuthStore((s) => s.loadUser);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (!sessionId) {
      setVerifying(false);
      setError(true);
      return;
    }

    api.post('/subscriptions/verify-session', { sessionId })
      .then(() => loadUser())
      .then(() => setVerified(true))
      .catch(() => setError(true))
      .finally(() => setVerifying(false));
  }, [searchParams, loadUser]);

  if (verifying) {
    return (
      <Container>
        <Spinner size={48} />
        <Message>Confirmando seu pagamento...</Message>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <IconWrapper $error><AlertCircle size={64} /></IconWrapper>
        <Title>Erro na <span>confirmação</span></Title>
        <Message>
          Não foi possível confirmar seu pagamento. Se o valor foi cobrado, sua assinatura será ativada automaticamente em instantes.
        </Message>
        <Link to="/empresas">
          <Button $size="lg">Ir para o início</Button>
        </Link>
      </Container>
    );
  }

  return (
    <Container>
      <IconWrapper><CheckCircle size={64} /></IconWrapper>
      <Title>Assinatura <span>confirmada!</span></Title>
      <Message>
        Parabéns! Sua assinatura do TL EM PAR está ativa. Agora você pode aproveitar os benefícios em todos os restaurantes parceiros.
      </Message>
      <Link to="/empresas">
        <Button $size="lg">Ver restaurantes parceiros</Button>
      </Link>
    </Container>
  );
}
