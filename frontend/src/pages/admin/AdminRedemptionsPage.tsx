import styled from 'styled-components';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Card, Loading, EmptyState } from '../../components/ui';
import { formatDateTime } from '../../utils/format';
import type { ApiResponse } from '../../types';
import { Search } from 'lucide-react';

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

const FilterInput = styled.input`
  padding: 0.45rem 0.6rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  background: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.text};
  outline: none;
  &:focus { border-color: ${({ theme }) => theme.colors.primary}; }
`;

const ClearBtn = styled.button`
  padding: 0.45rem 0.75rem;
  border-radius: ${({ theme }) => theme.radii.lg};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: transparent;
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  &:hover { border-color: ${({ theme }) => theme.colors.error}; color: ${({ theme }) => theme.colors.error}; }
`;

export function AdminRedemptionsPage() {
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const hasFilters = search || startDate || endDate;

  const { data, isLoading } = useQuery({
    queryKey: ['admin-redemptions', search, startDate, endDate],
    queryFn: async () => {
      const params: Record<string, string> = { limit: '100' };
      if (search) params.search = search;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const { data } = await api.get<ApiResponse<RedemptionItem[]>>('/admin/redemptions', { params });
      return data.data;
    },
  });

  return (
    <>
      <FiltersBar>
        <SearchBox>
          <Search size={16} color="#999" />
          <input placeholder="Buscar empresa..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </SearchBox>
        <FilterInput type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} title="Data início" />
        <FilterInput type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} title="Data fim" />
        {hasFilters && (
          <ClearBtn onClick={() => { setSearch(''); setStartDate(''); setEndDate(''); }}>Limpar</ClearBtn>
        )}
      </FiltersBar>

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
