import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { XCircle } from 'lucide-react';
import { Button } from '../../components/ui';

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

const IconWrapper = styled.div`
  color: ${({ theme }) => theme.colors.error};
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes['3xl']};
`;

const Message = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  max-width: 400px;
`;

export function SubscriptionCancelledPage() {
  return (
    <Container>
      <IconWrapper><XCircle size={64} /></IconWrapper>
      <Title>Assinatura cancelada</Title>
      <Message>
        O pagamento não foi concluído. Você pode tentar novamente a qualquer momento.
      </Message>
      <Link to="/painel">
        <Button $size="lg">Voltar ao painel</Button>
      </Link>
    </Container>
  );
}
