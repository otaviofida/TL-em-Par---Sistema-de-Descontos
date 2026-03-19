import styled from 'styled-components';
import { useState } from 'react';
import { Button } from '../../components/ui';
import { CreditCard } from 'lucide-react';
import { startCheckout } from '../../lib/checkout';
import { getErrorMessage } from '../../utils/errorMessages';
import toast from 'react-hot-toast';

const Container = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
`;

const Card = styled.div`
  width: 100%;
  max-width: 480px;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.xl};
  padding: 3rem 2rem;
  box-shadow: ${({ theme }) => theme.shadows.lg};
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
`;

const IconContainer = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primaryLight};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
`;

const Description = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.6;
`;

export function CheckoutPage() {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    try {
      setLoading(true);
      await startCheckout();
    } catch (err) {
      toast.error(getErrorMessage(err));
      setLoading(false);
    }
  };

  return (
    <Container>
      <Card>
        <IconContainer>
          <CreditCard size={28} color="#feb621" />
        </IconContainer>
        <Title>Assine o TL EM PAR</Title>
        <Description>
          Para acessar os restaurantes parceiros e resgatar seus benefícios, é necessário ter uma assinatura ativa.
        </Description>
        <Button $fullWidth onClick={handleCheckout} disabled={loading}>
          {loading ? 'Redirecionando...' : 'Ir para pagamento'}
        </Button>
      </Card>
    </Container>
  );
}
