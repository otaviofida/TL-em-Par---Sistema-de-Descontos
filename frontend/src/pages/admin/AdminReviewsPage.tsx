import styled from 'styled-components';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Card, Loading, EmptyState } from '../../components/ui';
import { StarRating } from '../../components/ui';
import { formatDateTime } from '../../utils/format';
import type { ApiResponse, Review } from '../../types';
import { Search, Trash2 } from 'lucide-react';

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
  margin: 0;
`;

const Comment = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0.25rem 0 0;
  font-style: italic;
`;

const DateText = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
  white-space: nowrap;
`;

const DeleteBtn = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textLight};
  cursor: pointer;
  padding: 0.25rem;
  border-radius: ${({ theme }) => theme.radii.sm};
  transition: color 0.2s;

  &:hover { color: ${({ theme }) => theme.colors.error}; }
`;

const FiltersBar = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
`;

const SearchBox = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: 0.45rem 0.75rem;
  flex: 1;
  min-width: 180px;

  input {
    border: none;
    background: transparent;
    outline: none;
    font-size: ${({ theme }) => theme.fontSizes.sm};
    color: ${({ theme }) => theme.colors.text};
    width: 100%;
    &::placeholder { color: ${({ theme }) => theme.colors.textLight}; }
  }
`;

const CompanyTag = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  background: ${({ theme }) => theme.colors.secondaryLight};
  padding: 0.25rem 0.5rem;
  border-radius: ${({ theme }) => theme.radii.sm};
`;

export function AdminReviewsPage() {
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-reviews', search],
    queryFn: async () => {
      const params: Record<string, string> = { limit: '100' };
      if (search) params.companyId = search;
      const { data } = await api.get<ApiResponse<Review[]>>('/reviews/admin', { params });
      return data.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/reviews/admin/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
    },
  });

  return (
    <>
      <FiltersBar>
        <SearchBox>
          <Search size={16} color="#999" />
          <input
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </SearchBox>
      </FiltersBar>

      {isLoading ? (
        <Loading />
      ) : !data?.length ? (
        <EmptyState title="Nenhuma avaliação" message="Ainda não há avaliações registradas." />
      ) : (
        <Table>
          {data.map((r) => (
            <Row key={r.id} variant="bordered">
              <Info>
                <Name>{r.user.name}</Name>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                  <StarRating value={r.rating} size={14} />
                  {r.company && <CompanyTag>{r.company.name}</CompanyTag>}
                </div>
                {r.comment && <Comment>"{r.comment}"</Comment>}
              </Info>
              <DateText>{formatDateTime(r.createdAt)}</DateText>
              <DeleteBtn
                onClick={() => {
                  if (confirm('Remover esta avaliação?')) {
                    deleteMutation.mutate(r.id);
                  }
                }}
                title="Remover avaliação"
              >
                <Trash2 size={16} />
              </DeleteBtn>
            </Row>
          ))}
        </Table>
      )}
    </>
  );
}
