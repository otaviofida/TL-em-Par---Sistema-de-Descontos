import styled from 'styled-components';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Card, Loading, EmptyState } from '../../components/ui';
import { formatDateTime } from '../../utils/format';
import type { ApiResponse } from '../../types';

interface RedemptionItem {
  id: string;
  redeemedAt: string;
  user: { name: string; email: string };
  company: { name: string };
  edition: { name: string };
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

const Tags = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const Tag = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  background: ${({ theme }) => theme.colors.secondaryLight};
  padding: 0.25rem 0.5rem;
  border-radius: ${({ theme }) => theme.radii.sm};
`;

const DateText = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
  white-space: nowrap;
`;

export function AdminRedemptionsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-redemptions'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<RedemptionItem[]>>('/admin/redemptions', {
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
        <EmptyState title="Nenhuma validação" message="Ainda não há validações registradas." />
      ) : (
        <Table>
          {data.map((r) => (
            <Row key={r.id} variant="bordered">
              <Info>
                <Name>{r.user.name}</Name>
                <Meta>{r.user.email}</Meta>
              </Info>
              <Tags>
                <Tag>{r.company.name}</Tag>
                <Tag>{r.edition.name}</Tag>
              </Tags>
              <DateText>{formatDateTime(r.redeemedAt)}</DateText>
            </Row>
          ))}
        </Table>
      )}
    </>
  );
}
