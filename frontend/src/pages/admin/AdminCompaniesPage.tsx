import { useState, useMemo } from 'react';
import styled from 'styled-components';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Button, Loading, EmptyState, CompanyStatusBadge } from '../../components/ui';
import { Link } from 'react-router-dom';
import { Plus, Edit, Search, UtensilsCrossed, Store, CheckCircle, XCircle, MapPin, Tag, Trash2, Power } from 'lucide-react';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../../utils/errorMessages';
import { COMPANY_CATEGORIES } from '../../constants/categories';
import type { Company, ApiResponse } from '../../types';
import { fadeInUp, fadeIn } from '../../styles/animations';

/* ── Layout ─────────────────────────────────────────── */

const PageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.75rem;
  flex-wrap: wrap;
  gap: 1rem;
  animation: ${fadeInUp} 0.4s ease-out both;
`;

const PageTitle = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  span { color: ${({ theme }) => theme.colors.primary}; }
`;

/* ── Stats ──────────────────────────────────────────── */

const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
  animation: ${fadeInUp} 0.4s ease-out 0.06s both;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div<{ $color: string }>`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.xl};
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const StatIcon = styled.div<{ $color: string }>`
  width: 44px;
  height: 44px;
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

/* ── Search & Filters ───────────────────────────────── */

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: ${({ theme }) => theme.colors.surface};
  border: 1.5px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: 0.65rem 1rem;
  margin-bottom: 1rem;
  transition: border-color 0.2s;

  &:focus-within {
    border-color: ${({ theme }) => theme.colors.primary};
  }

  input {
    flex: 1;
    border: none;
    outline: none;
    font-size: ${({ theme }) => theme.fontSizes.sm};
    background: transparent;
    color: ${({ theme }) => theme.colors.text};
    &::placeholder { color: ${({ theme }) => theme.colors.textLight}; }
  }
`;

const FiltersRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    flex-wrap: nowrap;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    &::-webkit-scrollbar { display: none; }
    scrollbar-width: none;
  }
`;

const FilterChip = styled.button<{ $active?: boolean }>`
  padding: 0.35rem 0.9rem;
  border-radius: ${({ theme }) => theme.radii.full};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  border: 1.5px solid ${({ theme, $active }) => $active ? theme.colors.primary : theme.colors.border};
  background: ${({ theme, $active }) => $active ? theme.colors.primary : 'transparent'};
  color: ${({ theme, $active }) => $active ? theme.colors.dark : theme.colors.textSecondary};
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  flex-shrink: 0;

  &:hover { border-color: ${({ theme }) => theme.colors.primary}; }
`;

const StatusFilter = styled.div`
  display: flex;
  background: ${({ theme }) => theme.colors.surfaceAlt};
  border-radius: ${({ theme }) => theme.radii.full};
  padding: 3px;
  flex-shrink: 0;
`;

const StatusOption = styled.button<{ $active?: boolean }>`
  padding: 0.3rem 0.85rem;
  border-radius: ${({ theme }) => theme.radii.full};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  border: none;
  background: ${({ $active, theme }) => $active ? theme.colors.surface : 'transparent'};
  color: ${({ $active, theme }) => $active ? theme.colors.text : theme.colors.textLight};
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: ${({ $active, theme }) => $active ? theme.shadows.sm : 'none'};
  white-space: nowrap;
`;

/* ── Counter ────────────────────────────────────────── */

const ResultCount = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textLight};
  margin-bottom: 1rem;
`;

/* ── Grid ───────────────────────────────────────────── */

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.25rem;
  animation: ${fadeIn} 0.4s ease-out 0.15s both;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

const CompanyCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  border-radius: ${({ theme }) => theme.radii.xl};
  overflow: hidden;
  transition: all 0.25s ease;

  &:hover {
    box-shadow: ${({ theme }) => theme.shadows.lg};
    transform: translateY(-4px);
  }
`;

const CoverWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 140px;
  background: ${({ theme }) => theme.colors.surfaceAlt};
  overflow: hidden;
`;

const CoverImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
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
  bottom: -18px;
  left: 14px;
  width: 44px;
  height: 44px;
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.surface};
  border: 2px solid ${({ theme }) => theme.colors.surface};
  box-shadow: ${({ theme }) => theme.shadows.md};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  img { width: 100%; height: 100%; object-fit: cover; }
`;

const StatusOverlay = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
`;

const CardBody = styled.div`
  padding: 24px 14px 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
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
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const MetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.7rem;
  color: ${({ theme }) => theme.colors.textLight};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const CategoryTag = styled.span`
  background: ${({ theme }) => theme.colors.surfaceAlt};
  padding: 0.15rem 0.5rem;
  border-radius: ${({ theme }) => theme.radii.full};
  font-size: 0.65rem;
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ theme }) => theme.colors.textSecondary};
  flex-shrink: 0;
`;

const CardActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 14px 14px;
  gap: 0.5rem;
`;

const ActionsLeft = styled.div`
  display: flex;
  gap: 4px;
`;

const ActionBtn = styled.button<{ $variant?: 'edit' | 'toggle' | 'delete' }>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  border: none;
  cursor: pointer;
  transition: all 0.15s;

  ${({ theme, $variant }) => {
    switch ($variant) {
      case 'edit':
        return `background: ${theme.colors.surfaceAlt}; color: ${theme.colors.text};
          &:hover { background: ${theme.colors.border}; }`;
      case 'toggle':
        return `background: transparent; color: ${theme.colors.textSecondary}; border: 1px solid ${theme.colors.border};
          &:hover { border-color: ${theme.colors.primary}; color: ${theme.colors.primary}; }`;
      case 'delete':
        return `background: transparent; color: ${theme.colors.textLight};
          &:hover { background: ${theme.colors.errorBg}; color: ${theme.colors.error}; }`;
      default:
        return `background: ${theme.colors.surfaceAlt}; color: ${theme.colors.textSecondary};
          &:hover { background: ${theme.colors.border}; }`;
    }
  }}
`;

/* ── helpers ────────────────────────────────────────── */

function getCategoryLabel(value?: string) {
  if (!value) return '';
  const cat = COMPANY_CATEGORIES.find(c => c.value === value);
  return cat ? cat.label : value;
}

/* ── Component ──────────────────────────────────────── */

export function AdminCompaniesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-companies'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Company[]>>('/admin/companies', {
        params: { limit: '100' },
      });
      return data.data;
    },
  });

  const toggleStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await api.patch(`/admin/companies/${id}/status`, {
        status: status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-companies'] });
      toast.success('Status atualizado!');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const deleteCompany = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/companies/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-companies'] });
      toast.success('Empresa excluída com sucesso!');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const handleDelete = (company: Company) => {
    if (window.confirm(`Tem certeza que deseja excluir "${company.name}"?`)) {
      deleteCompany.mutate(company.id);
    }
  };

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.filter((c) => {
      const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase());
      const matchCategory = !category || c.category === category;
      const matchStatus = statusFilter === 'ALL' || (c.status ?? 'ACTIVE') === statusFilter;
      return matchSearch && matchCategory && matchStatus;
    });
  }, [data, search, category, statusFilter]);

  const totalCount = data?.length ?? 0;
  const activeCount = data?.filter(c => (c.status ?? 'ACTIVE') === 'ACTIVE').length ?? 0;
  const inactiveCount = totalCount - activeCount;

  return (
    <>
      <PageHeader>
        <PageTitle>Empresas <span>parceiras</span></PageTitle>
        <Link to="/admin/empresas/nova">
          <Button $size="sm"><Plus size={16} /> Nova empresa</Button>
        </Link>
      </PageHeader>

      {!isLoading && data && data.length > 0 && (
        <StatsRow>
          <StatCard $color="#3b82f6">
            <StatIcon $color="#3b82f6"><Store size={20} color="#3b82f6" /></StatIcon>
            <StatContent>
              <StatValue>{totalCount}</StatValue>
              <StatLabel>Total de empresas</StatLabel>
            </StatContent>
          </StatCard>
          <StatCard $color="#22c55e">
            <StatIcon $color="#22c55e"><CheckCircle size={20} color="#22c55e" /></StatIcon>
            <StatContent>
              <StatValue>{activeCount}</StatValue>
              <StatLabel>Ativas</StatLabel>
            </StatContent>
          </StatCard>
          <StatCard $color="#ef4444">
            <StatIcon $color="#ef4444"><XCircle size={20} color="#ef4444" /></StatIcon>
            <StatContent>
              <StatValue>{inactiveCount}</StatValue>
              <StatLabel>Inativas</StatLabel>
            </StatContent>
          </StatCard>
        </StatsRow>
      )}

      <SearchBar>
        <Search size={16} color="#999" />
        <input
          placeholder="Buscar empresa por nome..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </SearchBar>

      <FiltersRow>
        <StatusFilter>
          <StatusOption $active={statusFilter === 'ALL'} onClick={() => setStatusFilter('ALL')}>Todas</StatusOption>
          <StatusOption $active={statusFilter === 'ACTIVE'} onClick={() => setStatusFilter('ACTIVE')}>Ativas</StatusOption>
          <StatusOption $active={statusFilter === 'INACTIVE'} onClick={() => setStatusFilter('INACTIVE')}>Inativas</StatusOption>
        </StatusFilter>

        <FilterChip $active={!category} onClick={() => setCategory('')}>Todas categorias</FilterChip>
        {COMPANY_CATEGORIES.map((cat) => (
          <FilterChip
            key={cat.value}
            $active={category === cat.value}
            onClick={() => setCategory(category === cat.value ? '' : cat.value)}
          >
            {cat.label}
          </FilterChip>
        ))}
      </FiltersRow>

      {isLoading ? (
        <Loading />
      ) : !data?.length ? (
        <EmptyState
          title="Nenhuma empresa cadastrada"
          message="Comece adicionando a primeira empresa parceira."
          action={{ label: 'Adicionar empresa', onClick: () => {} }}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Nenhum resultado"
          message="Nenhuma empresa encontrada com os filtros aplicados."
          icon={<Search size={48} color="#ccc" />}
        />
      ) : (
        <>
          <ResultCount>{filtered.length} empresa{filtered.length !== 1 ? 's' : ''} encontrada{filtered.length !== 1 ? 's' : ''}</ResultCount>
          <Grid>
            {filtered.map((company) => (
              <CompanyCard key={company.id}>
                <CoverWrapper>
                  {company.coverUrl ? (
                    <CoverImage src={company.coverUrl} alt={company.name} />
                  ) : (
                    <CoverFallback>
                      <UtensilsCrossed size={36} color="#ccc" />
                    </CoverFallback>
                  )}
                  <LogoOverlay>
                    {company.logoUrl ? (
                      <img src={company.logoUrl} alt={company.name} />
                    ) : (
                      <UtensilsCrossed size={18} color="#ccc" />
                    )}
                  </LogoOverlay>
                  <StatusOverlay>
                    <CompanyStatusBadge status={company.status ?? 'ACTIVE'} />
                  </StatusOverlay>
                </CoverWrapper>

                <CardBody>
                  <CompanyName>{company.name}</CompanyName>

                  {company.benefitDescription && (
                    <BenefitRow>
                      <Tag size={12} />
                      {company.benefitDescription}
                    </BenefitRow>
                  )}

                  <MetaRow>
                    {company.category && <CategoryTag>{getCategoryLabel(company.category)}</CategoryTag>}
                    {company.address && (
                      <>
                        <MapPin size={10} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{company.address}</span>
                      </>
                    )}
                  </MetaRow>
                </CardBody>

                <CardActions>
                  <ActionsLeft>
                    <Link to={`/admin/empresas/${company.id}/editar`}>
                      <ActionBtn $variant="edit"><Edit size={13} /> Editar</ActionBtn>
                    </Link>
                    <ActionBtn
                      $variant="toggle"
                      onClick={() => toggleStatus.mutate({ id: company.id, status: company.status ?? 'ACTIVE' })}
                    >
                      <Power size={13} />
                      {company.status === 'ACTIVE' ? 'Desativar' : 'Ativar'}
                    </ActionBtn>
                  </ActionsLeft>
                  <ActionBtn $variant="delete" onClick={() => handleDelete(company)}>
                    <Trash2 size={13} />
                  </ActionBtn>
                </CardActions>
              </CompanyCard>
            ))}
          </Grid>
        </>
      )}
    </>
  );
}
