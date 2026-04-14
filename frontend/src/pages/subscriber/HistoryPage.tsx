import { useMemo, useState } from 'react';
import styled from 'styled-components';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Loading, EmptyState } from '../../components/ui';
import { formatDateTime } from '../../utils/format';
import { UtensilsCrossed, CheckCircle, Award, TrendingUp, Search, Filter } from 'lucide-react';
import { parseISO, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { BenefitRedemption, ApiResponse } from '../../types';
import { fadeInUp, fadeIn } from '../../styles/animations';
import { COMPANY_CATEGORIES } from '../../constants/categories';

/* ── Layout ─────────────────────────────────────────── */

const PageTitle = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  margin-bottom: 1.5rem;
  animation: ${fadeInUp} 0.4s ease-out both;
  span { color: ${({ theme }) => theme.colors.primary}; }
`;

/* ── Stats ──────────────────────────────────────────── */

const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  margin-bottom: 1.75rem;
  animation: ${fadeInUp} 0.4s ease-out 0.08s both;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div<{ $color: string }>`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.xl};
  padding: 1.1rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.85rem;
`;

const StatIcon = styled.div<{ $color: string }>`
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ $color }) => `${$color}18`};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const StatContent = styled.div``;

const StatValue = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  line-height: 1.2;
`;

const StatLabel = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

/* ── Timeline / Grouped list ────────────────────────── */

const MonthGroup = styled.div`
  margin-bottom: 1.5rem;
  animation: ${fadeIn} 0.35s ease-out both;
`;

const MonthHeader = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${({ theme }) => theme.colors.textLight};
  margin-bottom: 0.75rem;
  padding-left: 0.25rem;
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
`;

const RedemptionCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.xl};
  padding: 1rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.2s;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: ${({ theme }) => theme.shadows.sm};
  }
`;

const CompanyLogo = styled.div`
  width: 48px;
  height: 48px;
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.surfaceAlt};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;

  img { width: 100%; height: 100%; object-fit: cover; }
`;

const Info = styled.div`
  flex: 1;
  min-width: 0;
`;

const TopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.15rem;
`;

const CompanyName = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const DateLabel = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textLight};
  white-space: nowrap;
  flex-shrink: 0;
`;

const Benefit = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const EditionTag = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.65rem;
  color: ${({ theme }) => theme.colors.textLight};
  background: ${({ theme }) => theme.colors.surfaceAlt};
  padding: 0.1rem 0.5rem;
  border-radius: ${({ theme }) => theme.radii.full};
  margin-top: 0.3rem;
`;

const CheckBadge = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.successBg};
  color: ${({ theme }) => theme.colors.success};
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  bottom: -2px;
  right: -2px;
`;

const LogoWrapper = styled.div`
  position: relative;
  flex-shrink: 0;
`;

/* ── Filters ─────────────────────────────────────────── */

const FiltersBar = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
  margin-bottom: 1.25rem;
  animation: ${fadeInUp} 0.4s ease-out 0.04s both;
`;

const SearchInput = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: ${({ theme }) => theme.colors.surface};
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

const FilterSelect = styled.select`
  padding: 0.45rem 0.6rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  outline: none;
  cursor: pointer;
  &:focus { border-color: ${({ theme }) => theme.colors.primary}; }
`;

const FilterDateInput = styled.input`
  padding: 0.45rem 0.6rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  outline: none;
  &:focus { border-color: ${({ theme }) => theme.colors.primary}; }
`;

const ClearFilters = styled.button`
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

/* ── helpers ─────────────────────────────────────────── */

function groupByMonth(items: BenefitRedemption[]): { label: string; items: BenefitRedemption[] }[] {
  const groups = new Map<string, BenefitRedemption[]>();

  for (const item of items) {
    const date = parseISO(item.redeemedAt);
    const key = format(date, 'yyyy-MM');
    const existing = groups.get(key);
    if (existing) {
      existing.push(item);
    } else {
      groups.set(key, [item]);
    }
  }

  return Array.from(groups.entries()).map(([key, items]) => {
    const date = parseISO(`${key}-01`);
    const label = format(date, "MMMM 'de' yyyy", { locale: ptBR });
    return { label, items };
  });
}

function uniqueCompanies(items: BenefitRedemption[]): number {
  return new Set(items.map(i => i.company.id)).size;
}

/* ── Component ──────────────────────────────────────── */

export function HistoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const hasFilters = searchTerm || category || startDate || endDate;

  const { data, isLoading } = useQuery({
    queryKey: ['benefit-history', searchTerm, category, startDate, endDate],
    queryFn: async () => {
      const params: Record<string, string> = { limit: '100' };
      if (searchTerm) params.search = searchTerm;
      if (category) params.category = category;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const { data } = await api.get<ApiResponse<BenefitRedemption[]>>('/benefits/history', { params });
      return data.data;
    },
  });

  const grouped = useMemo(() => (data ? groupByMonth(data) : []), [data]);
  const totalCount = data?.length ?? 0;
  const companiesCount = data ? uniqueCompanies(data) : 0;

  // find month with most redemptions
  const bestMonth = useMemo(() => {
    if (!grouped.length) return '—';
    const best = grouped.reduce((a, b) => (a.items.length >= b.items.length ? a : b));
    return `${best.items.length} em ${best.label}`;
  }, [grouped]);

  return (
    <>
      <PageTitle>Meu <span>histórico</span></PageTitle>

      <FiltersBar>
        <SearchInput>
          <Search size={16} color="#999" />
          <input
            placeholder="Buscar restaurante..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchInput>
        <FilterSelect value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Todas categorias</option>
          {COMPANY_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </FilterSelect>
        <FilterDateInput type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} title="Data início" />
        <FilterDateInput type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} title="Data fim" />
        {hasFilters && (
          <ClearFilters onClick={() => { setSearchTerm(''); setCategory(''); setStartDate(''); setEndDate(''); }}>
            Limpar
          </ClearFilters>
        )}
      </FiltersBar>

      {isLoading ? (
        <Loading />
      ) : !data?.length ? (
        <EmptyState
          title="Nenhum resgate ainda"
          message="Quando você validar um benefício, ele aparecerá aqui."
          icon={<UtensilsCrossed size={48} color="#ccc" />}
        />
      ) : (
        <>
          <StatsRow>
            <StatCard $color="#22c55e">
              <StatIcon $color="#22c55e"><CheckCircle size={18} color="#22c55e" /></StatIcon>
              <StatContent>
                <StatValue>{totalCount}</StatValue>
                <StatLabel>Resgates totais</StatLabel>
              </StatContent>
            </StatCard>
            <StatCard $color="#3b82f6">
              <StatIcon $color="#3b82f6"><UtensilsCrossed size={18} color="#3b82f6" /></StatIcon>
              <StatContent>
                <StatValue>{companiesCount}</StatValue>
                <StatLabel>Restaurantes visitados</StatLabel>
              </StatContent>
            </StatCard>
            <StatCard $color="#f59e0b">
              <StatIcon $color="#f59e0b"><TrendingUp size={18} color="#f59e0b" /></StatIcon>
              <StatContent>
                <StatValue style={{ fontSize: '0.95rem' }}>{bestMonth}</StatValue>
                <StatLabel>Melhor mês</StatLabel>
              </StatContent>
            </StatCard>
          </StatsRow>

          {grouped.map((group) => (
            <MonthGroup key={group.label}>
              <MonthHeader>{group.label}</MonthHeader>
              <List>
                {group.items.map((item) => (
                  <RedemptionCard key={item.id}>
                    <LogoWrapper>
                      <CompanyLogo>
                        {item.company.logoUrl ? (
                          <img src={item.company.logoUrl} alt={item.company.name} />
                        ) : (
                          <UtensilsCrossed size={20} color="#ccc" />
                        )}
                      </CompanyLogo>
                      <CheckBadge><CheckCircle size={12} /></CheckBadge>
                    </LogoWrapper>
                    <Info>
                      <TopRow>
                        <CompanyName>{item.company.name}</CompanyName>
                        <DateLabel>{formatDateTime(item.redeemedAt)}</DateLabel>
                      </TopRow>
                      <Benefit>{item.benefit}</Benefit>
                      <EditionTag>
                        <Award size={10} />
                        {item.edition.name}
                      </EditionTag>
                    </Info>
                  </RedemptionCard>
                ))}
              </List>
            </MonthGroup>
          ))}
        </>
      )}
    </>
  );
}
