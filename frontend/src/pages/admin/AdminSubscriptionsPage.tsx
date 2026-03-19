import styled from 'styled-components';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Card, Loading, EmptyState, SubscriptionBadge } from '../../components/ui';
import { formatDateShort } from '../../utils/format';
import type { ApiResponse } from '../../types';

interface SubscriptionItem {
  id: string;
  status: string;
  currentPeriodEnd?: string;
  createdAt: string;
  user: { name: string; email: string };
}

const Table = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Row = styled(Card)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
`;

const Info = styled.div`
  flex: 1;
  min-width: 200px;
`;

const Name = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
`;

const Meta = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export function AdminSubscriptionsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-subscriptions'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<SubscriptionItem[]>>('/admin/subscriptions', {
        params: { limit: '100' },
      });
      return data.data;
    },
  });

  return (
    <>
      {isLoading ? (
        <Loading />
      ) : !data?.length ? (
        <EmptyState title="Nenhuma assinatura" message="Ainda não há assinaturas registradas." />
      ) : (
        <Table>
          {data.map((sub) => (
            <Row key={sub.id} variant="bordered">
              <Info>
                <Name>{sub.user.name}</Name>
                <Meta>
                  {sub.user.email} • Desde {formatDateShort(sub.createdAt)}
                </Meta>
              </Info>
              <SubscriptionBadge status={sub.status} />
            </Row>
          ))}
        </Table>
      )}
    </>
  );
}
