import styled from 'styled-components';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Card, Loading, EmptyState } from '../../components/ui';
import { Link } from 'react-router-dom';
import { MapPin, CheckCircle, UtensilsCrossed, Search } from 'lucide-react';
import { useState } from 'react';
import type { Company, ApiResponse } from '../../types';
import { COMPANY_CATEGORIES } from '../../constants/categories';
import { fadeInUp, fadeIn } from '../../styles/animations';

const PageTitle = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  margin-bottom: 1.5rem;
  animation: ${fadeInUp} 0.4s ease-out both;

  span { color: ${({ theme }) => theme.colors.primary}; }
`;

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: ${({ theme }) => theme.colors.surface};
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: 0.75rem 1rem;
  margin-bottom: 1.5rem;

  input {
    flex: 1;
    border: none;
    outline: none;
    font-size: ${({ theme }) => theme.fontSizes.md};
    background: transparent;
    color: ${({ theme }) => theme.colors.text};
    &::placeholder { color: ${({ theme }) => theme.colors.textLight}; }
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  animation: ${fadeIn} 0.4s ease-out 0.1s both;
`;

const CompanyCard = styled(Card)`
  display: flex;
  gap: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  &:hover { box-shadow: ${({ theme }) => theme.shadows.lg}; transform: translateY(-2px); }
`;

const CompanyLogo = styled.div`
  width: 64px;
  height: 64px;
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.surfaceAlt};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;

  img { width: 100%; height: 100%; object-fit: cover; }
`;

const CompanyInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const CompanyName = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  margin-bottom: 0.25rem;
`;

const CompanyBenefit = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  margin-bottom: 0.25rem;
`;

const CompanyMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const UsedBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.success};
  margin-top: 0.25rem;
`;

const FilterBar = styled.div`
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  margin-bottom: 1.5rem;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar { display: none; }
  scrollbar-width: none;
`;

const FilterChip = styled.button<{ $active?: boolean }>`
  padding: 0.4rem 1rem;
  border-radius: ${({ theme }) => theme.radii.full};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  border: 1.5px solid ${({ theme, $active }) => $active ? theme.colors.primary : theme.colors.border};
  background: ${({ theme, $active }) => $active ? theme.colors.primary : 'transparent'};
  color: ${({ theme, $active }) => $active ? theme.colors.dark : theme.colors.textSecondary};
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  flex-shrink: 0;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

export function CompaniesPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('');

  const { data, isLoading } = useQuery({
    queryKey: ['companies', search, category],
    queryFn: async () => {
      const params: Record<string, string> = { limit: '50' };
      if (search) params.search = search;
      if (category) params.category = category;
      const { data } = await api.get<ApiResponse<Company[]>>('/companies', { params });
      return data.data;
    },
  });

  return (
    <>
      <PageTitle>Restaurantes <span>parceiros</span></PageTitle>

      <SearchBar>
        <Search size={18} color="#999" />
        <input
          placeholder="Buscar restaurante..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </SearchBar>

      <FilterBar>
        <FilterChip $active={!category} onClick={() => setCategory('')}>
          Todos
        </FilterChip>
        {COMPANY_CATEGORIES.map((cat) => (
          <FilterChip
            key={cat.value}
            $active={category === cat.value}
            onClick={() => setCategory(category === cat.value ? '' : cat.value)}
          >
            {cat.label}
          </FilterChip>
        ))}
      </FilterBar>

      {isLoading ? (
        <Loading />
      ) : !data?.length ? (
        <EmptyState
          title="Nenhum restaurante encontrado"
          message="Tente ajustar sua busca ou volte mais tarde."
          icon={<UtensilsCrossed size={48} color="#ccc" />}
        />
      ) : (
        <Grid>
          {data.map((company) => (
            <Link key={company.id} to={`/empresas/${company.id}`}>
              <CompanyCard variant="bordered">
                <CompanyLogo>
                  {company.logoUrl ? (
                    <img src={company.logoUrl} alt={company.name} />
                  ) : (
                    <UtensilsCrossed size={24} color="#ccc" />
                  )}
                </CompanyLogo>
                <CompanyInfo>
                  <CompanyName>{company.name}</CompanyName>
                  {company.benefitDescription && (
                    <CompanyBenefit>{company.benefitDescription}</CompanyBenefit>
                  )}
                  {company.address && (
                    <CompanyMeta>
                      <MapPin size={12} />
                      {company.address}
                    </CompanyMeta>
                  )}
                  {company.alreadyUsed && (
                    <UsedBadge>
                      <CheckCircle size={12} />
                      Já utilizado
                    </UsedBadge>
                  )}
                </CompanyInfo>
              </CompanyCard>
            </Link>
          ))}
        </Grid>
      )}
    </>
  );
}
