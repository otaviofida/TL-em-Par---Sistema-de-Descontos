import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Card, Loading, EmptyState, SubscriptionBadge } from '../../components/ui';
import { formatDateShort } from '../../utils/format';
import type { ApiResponse } from '../../types';
import { fadeInUp } from '../../styles/animations';

const LIMIT = 20;

interface SubscriptionItem {
  id: string;
  status: string;
  cancelAtPeriodEnd?: boolean;
  currentPeriodEnd?: string;
  createdAt: string;
  user: { name: string; email: string };
}

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.sm};

  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const TotalLabel = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
  white-space: nowrap;
`;

const Table = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  animation: ${fadeInUp} 0.4s ease-out both;
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

const Pagination = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.25rem;
`;

const PageButton = styled.button`
  padding: 0.4rem 0.9rem;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: transparent;
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  cursor: pointer;
  transition: opacity 0.2s;

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

const PageInfo = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export function AdminSubscriptionsPage() {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data: response, isLoading } = useQuery({
    queryKey: ['admin-subscriptions', page, search],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<SubscriptionItem[]>>('/admin/subscriptions', {
        params: { page: String(page), limit: String(LIMIT), search: search || undefined },
      });
      return data;
    },
  });

  const subscriptions = response?.data ?? [];
  const meta = response?.meta;

  return (
    <>
      <Toolbar>
        <SearchInput
          placeholder="Buscar por nome ou e-mail..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        {meta && (
          <TotalLabel>{meta.total} assinatura{meta.total !== 1 ? 's' : ''}</TotalLabel>
        )}
      </Toolbar>

      {isLoading ? (
        <Loading />
      ) : !subscriptions.length ? (
        <EmptyState
          title="Nenhuma assinatura"
          message={search ? `Nenhum resultado para "${search}".` : 'Ainda não há assinaturas registradas.'}
        />
      ) : (
        <>
          <Table>
            {subscriptions.map((sub) => (
              <Row key={sub.id} variant="bordered">
                <Info>
                  <Name>{sub.user.name}</Name>
                  <Meta>
                    {sub.user.email} • Desde {formatDateShort(sub.createdAt)}
                  </Meta>
                </Info>
                <SubscriptionBadge status={sub.status} cancelAtPeriodEnd={sub.cancelAtPeriodEnd} />
              </Row>
            ))}
          </Table>

          {meta && meta.totalPages > 1 && (
            <Pagination>
              <PageButton disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                ← Anterior
              </PageButton>
              <PageInfo>Página {page} de {meta.totalPages}</PageInfo>
              <PageButton disabled={page >= meta.totalPages} onClick={() => setPage((p) => p + 1)}>
                Próxima →
              </PageButton>
            </Pagination>
          )}
        </>
      )}
    </>
  );
}
