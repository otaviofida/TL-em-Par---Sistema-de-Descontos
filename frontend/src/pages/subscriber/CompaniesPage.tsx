import styled from 'styled-components';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Loading, EmptyState } from '../../components/ui';
import { Link } from 'react-router-dom';
import { MapPin, CheckCircle, UtensilsCrossed, Search, Tag } from 'lucide-react';
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
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.25rem;
  animation: ${fadeIn} 0.4s ease-out 0.1s both;
`;

const CompanyCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.xl};
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  transition: all 0.25s ease;
  cursor: pointer;

  &:hover {
    box-shadow: ${({ theme }) => theme.shadows.lg};
    transform: translateY(-4px);
  }
`;

const CoverWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 160px;
  background: ${({ theme }) => theme.colors.surfaceAlt};
`;

const CoverImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const CoverFallback = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.surfaceAlt} 0%, ${({ theme }) => theme.colors.borderLight} 100%);
`;

const LogoOverlay = styled.div`
  position: absolute;
  bottom: -20px;
  left: 16px;
  width: 48px;
  height: 48px;
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.surface};
  border: 2px solid ${({ theme }) => theme.colors.surface};
  box-shadow: ${({ theme }) => theme.shadows.md};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  z-index: 2;

  img { width: 100%; height: 100%; object-fit: cover; }
`;

const UsedTag = styled.span`
  position: absolute;
  top: 10px;
  right: 10px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: rgba(34, 197, 94, 0.9);
  color: #fff;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  padding: 4px 10px;
  border-radius: ${({ theme }) => theme.radii.full};
  backdrop-filter: blur(4px);
`;

const CardBody = styled.div`
  padding: 28px 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const CompanyName = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const BenefitRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
`;

const AddressRow = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
            <Link key={company.id} to={`/empresas/${company.id}`} style={{ textDecoration: 'none' }}>
              <CompanyCard>
                <CoverWrapper>
                  {company.coverUrl ? (
                    <CoverImage src={company.coverUrl} alt={company.name} />
                  ) : (
                    <CoverFallback>
                      <UtensilsCrossed size={40} color="#ccc" />
                    </CoverFallback>
                  )}
                  <LogoOverlay>
                    {company.logoUrl ? (
                      <img src={company.logoUrl} alt={company.name} />
                    ) : (
                      <UtensilsCrossed size={20} color="#ccc" />
                    )}
                  </LogoOverlay>
                  {company.alreadyUsed && (
                    <UsedTag>
                      <CheckCircle size={12} />
                      Utilizado
                    </UsedTag>
                  )}
                </CoverWrapper>
                <CardBody>
                  <CompanyName>{company.name}</CompanyName>
                  {company.benefitDescription && (
                    <BenefitRow>
                      <Tag size={14} />
                      {company.benefitDescription}
                    </BenefitRow>
                  )}
                  {company.address && (
                    <AddressRow>
                      <MapPin size={12} />
                      {company.address}
                    </AddressRow>
                  )}
                </CardBody>
              </CompanyCard>
            </Link>
          ))}
        </Grid>
      )}
    </>
  );
}
