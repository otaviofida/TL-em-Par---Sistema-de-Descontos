import { useState, useMemo } from 'react';
import styled from 'styled-components';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Loading, EmptyState, EditionStatusBadge, Button } from '../../components/ui';
import { Link } from 'react-router-dom';
import { Plus, Edit, Calendar, Store, TicketCheck, Layers, PlayCircle, CheckCircle2 } from 'lucide-react';
import { formatDateShort } from '../../utils/format';
import type { Edition, ApiResponse } from '../../types';
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

/* ── Filters ────────────────────────────────────────── */

const FiltersRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
`;

const StatusFilter = styled.div`
  display: flex;
  background: ${({ theme }) => theme.colors.surfaceAlt};
  border-radius: ${({ theme }) => theme.radii.full};
  padding: 3px;
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

const ResultCount = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textLight};
  margin-bottom: 1rem;
`;

/* ── Cards ──────────────────────────────────────────── */

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 1rem;
  animation: ${fadeIn} 0.4s ease-out 0.15s both;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

const EditionCard = styled.div<{ $isActive?: boolean }>`
  background: ${({ theme }) => theme.colors.surface};
  border: 1.5px solid ${({ theme, $isActive }) => $isActive ? theme.colors.primary : theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.xl};
  padding: 1.5rem;
  transition: all 0.2s;
  position: relative;
  overflow: hidden;

  ${({ $isActive, theme }) => $isActive && `
    box-shadow: 0 0 0 1px ${theme.colors.primary}20;
  `}

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: ${({ theme }) => theme.shadows.md};
  }
`;

const ActiveIndicator = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: ${({ theme }) => theme.colors.primary};
`;

const CardTopRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
`;

const EditionName = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
`;

const DateRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 1rem;
`;

const MetricsRow = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1rem;
  padding: 0.75rem 0;
  border-top: 1px solid ${({ theme }) => theme.colors.borderLight};
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight};
`;

const Metric = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
`;

const MetricValue = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
`;

const MetricLabel = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textLight};
`;

const CardFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
`;

const EditBtn = styled.button`
  background: none;
  border: none;
  padding: 0.35rem 0.7rem;
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  transition: background 0.15s;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceAlt};
  }
`;

const ProgressBar = styled.div`
  height: 4px;
  border-radius: 2px;
  background: ${({ theme }) => theme.colors.surfaceAlt};
  margin-bottom: 1rem;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ $percent: number }>`
  height: 100%;
  width: ${({ $percent }) => `${$percent}%`};
  background: ${({ theme }) => theme.colors.primary};
  border-radius: 2px;
  transition: width 0.4s ease;
`;

/* ── helpers ────────────────────────────────────────── */

function getEditionProgress(start: string, end: string): number {
  const now = Date.now();
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  if (now <= s) return 0;
  if (now >= e) return 100;
  return Math.round(((now - s) / (e - s)) * 100);
}

function getDaysRemaining(end: string): string {
  const diff = new Date(end).getTime() - Date.now();
  if (diff <= 0) return 'Encerrada';
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return days === 1 ? '1 dia restante' : `${days} dias restantes`;
}

/* ── Component ──────────────────────────────────────── */

export function AdminEditionsPage() {
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'DRAFT' | 'ACTIVE' | 'FINISHED'>('ALL');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-editions'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Edition[]>>('/admin/editions', {
        params: { limit: '50' },
      });
      return data.data;
    },
  });

  const filtered = useMemo(() => {
    if (!data) return [];
    if (statusFilter === 'ALL') return data;
    return data.filter((e) => e.status === statusFilter);
  }, [data, statusFilter]);

  const totalCount = data?.length ?? 0;
  const activeCount = data?.filter(e => e.status === 'ACTIVE').length ?? 0;
  const finishedCount = data?.filter(e => e.status === 'FINISHED').length ?? 0;

  return (
    <>
      <PageHeader>
        <PageTitle>Edições do <span>clube</span></PageTitle>
        <Link to="/admin/edicoes/nova">
          <Button $size="sm"><Plus size={16} /> Nova edição</Button>
        </Link>
      </PageHeader>

      {!isLoading && data && data.length > 0 && (
        <StatsRow>
          <StatCard $color="#3b82f6">
            <StatIcon $color="#3b82f6"><Layers size={20} color="#3b82f6" /></StatIcon>
            <StatContent>
              <StatValue>{totalCount}</StatValue>
              <StatLabel>Total de edições</StatLabel>
            </StatContent>
          </StatCard>
          <StatCard $color="#22c55e">
            <StatIcon $color="#22c55e"><PlayCircle size={20} color="#22c55e" /></StatIcon>
            <StatContent>
              <StatValue>{activeCount}</StatValue>
              <StatLabel>Ativas agora</StatLabel>
            </StatContent>
          </StatCard>
          <StatCard $color="#8b5cf6">
            <StatIcon $color="#8b5cf6"><CheckCircle2 size={20} color="#8b5cf6" /></StatIcon>
            <StatContent>
              <StatValue>{finishedCount}</StatValue>
              <StatLabel>Encerradas</StatLabel>
            </StatContent>
          </StatCard>
        </StatsRow>
      )}

      <FiltersRow>
        <StatusFilter>
          <StatusOption $active={statusFilter === 'ALL'} onClick={() => setStatusFilter('ALL')}>Todas</StatusOption>
          <StatusOption $active={statusFilter === 'DRAFT'} onClick={() => setStatusFilter('DRAFT')}>Rascunho</StatusOption>
          <StatusOption $active={statusFilter === 'ACTIVE'} onClick={() => setStatusFilter('ACTIVE')}>Ativas</StatusOption>
          <StatusOption $active={statusFilter === 'FINISHED'} onClick={() => setStatusFilter('FINISHED')}>Encerradas</StatusOption>
        </StatusFilter>
      </FiltersRow>

      {isLoading ? (
        <Loading />
      ) : !data?.length ? (
        <EmptyState
          title="Nenhuma edição"
          message="Crie a primeira edição do clube."
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Nenhum resultado"
          message="Nenhuma edição encontrada com esse filtro."
          icon={<Calendar size={48} color="#ccc" />}
        />
      ) : (
        <>
          <ResultCount>{filtered.length} edição{filtered.length !== 1 ? 'ões' : ''}</ResultCount>
          <Grid>
            {filtered.map((edition) => {
              const isActive = edition.status === 'ACTIVE';
              const progress = isActive ? getEditionProgress(edition.startDate, edition.endDate) : edition.status === 'FINISHED' ? 100 : 0;
              const companiesCount = edition._count?.companies ?? 0;
              const redemptionsCount = edition._count?.benefitRedemptions ?? 0;

              return (
                <EditionCard key={edition.id} $isActive={isActive}>
                  {isActive && <ActiveIndicator />}

                  <CardTopRow>
                    <EditionName>{edition.name}</EditionName>
                    <EditionStatusBadge status={edition.status} />
                  </CardTopRow>

                  <DateRow>
                    <Calendar size={13} />
                    {formatDateShort(edition.startDate)} — {formatDateShort(edition.endDate)}
                    {isActive && (
                      <span style={{ marginLeft: 'auto', fontWeight: 600, color: '#22c55e' }}>
                        {getDaysRemaining(edition.endDate)}
                      </span>
                    )}
                  </DateRow>

                  {(isActive || edition.status === 'FINISHED') && (
                    <ProgressBar>
                      <ProgressFill $percent={progress} />
                    </ProgressBar>
                  )}

                  <MetricsRow>
                    <Metric>
                      <Store size={14} color="#3b82f6" />
                      <MetricValue>{companiesCount}</MetricValue>
                      <MetricLabel>empresas</MetricLabel>
                    </Metric>
                    <Metric>
                      <TicketCheck size={14} color="#f59e0b" />
                      <MetricValue>{redemptionsCount}</MetricValue>
                      <MetricLabel>validações</MetricLabel>
                    </Metric>
                  </MetricsRow>

                  <CardFooter>
                    <Link to={`/admin/edicoes/${edition.id}/editar`}>
                      <EditBtn><Edit size={13} /> Editar</EditBtn>
                    </Link>
                  </CardFooter>
                </EditionCard>
              );
            })}
          </Grid>
        </>
      )}
    </>
  );
}
