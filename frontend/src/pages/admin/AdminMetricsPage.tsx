import styled, { useTheme } from 'styled-components';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Loading } from '../../components/ui';
import type { ApiResponse } from '../../types';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  Users, DollarSign, Calendar,
  Activity, ArrowUpRight, ArrowDownRight,
} from 'lucide-react';

import { fadeInUp, fadeIn } from '../../styles/animations';

// --- Types ---

interface MetricsData {
  newSubscribers: number;
  canceledSubscribers: number;
  totalActiveSubscriptions: number;
  totalRevenue: number;
  redemptionsInPeriod: number;
  averageAge: number | null;
  genderDistribution: { gender: string; count: number }[];
  dailyNewSubscribers: { date: string; count: number }[];
  dailyRedemptions: { date: string; count: number }[];
}

// --- Styled ---

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  animation: ${fadeInUp} 0.4s ease-out both;
`;

const FilterBar = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  background: ${({ theme }) => theme.colors.white};
  padding: 0.75rem 1.25rem;
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

const FilterLabel = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const DateInput = styled.input`
  padding: 0.4rem 0.6rem;
  border: 1.5px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  background: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.text};
  outline: none;
  &:focus { border-color: ${({ theme }) => theme.colors.primary}; }
`;

const PresetButton = styled.button<{ $active?: boolean }>`
  padding: 0.4rem 0.85rem;
  border-radius: ${({ theme }) => theme.radii.full};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  border: 1.5px solid ${({ theme, $active }) => $active ? theme.colors.primary : theme.colors.border};
  background: ${({ theme, $active }) => $active ? theme.colors.primary : 'transparent'};
  color: ${({ theme, $active }) => $active ? theme.colors.dark : theme.colors.textSecondary};
  cursor: pointer;
  transition: all 0.2s;
  &:hover { border-color: ${({ theme }) => theme.colors.primary}; }
`;

/* ---- Hero Stats Row ---- */
const HeroRow = styled.div`
  display: grid;
  grid-template-columns: 1.2fr 1fr 1fr;
  gap: 1.25rem;
  animation: ${fadeIn} 0.45s ease-out 0.1s both;

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
  }
`;

const HeroCard = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radii.xl};
  padding: 1.5rem;
  box-shadow: ${({ theme }) => theme.shadows.sm};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
  min-height: 160px;
`;

const HeroCardDark = styled(HeroCard)`
  background: ${({ theme }) => theme.colors.dark};
  color: ${({ theme }) => theme.colors.white};
`;

const HeroLabel = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const HeroLabelLight = styled(HeroLabel)`
  color: rgba(255,255,255,0.6);
`;

const HeroValue = styled.h2`
  font-size: 2rem;
  font-weight: ${({ theme }) => theme.fontWeights.extrabold};
  margin: 0.25rem 0;
  line-height: 1.2;
`;

const HeroBadge = styled.span<{ $positive?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ $positive, theme }) => $positive ? theme.colors.success : theme.colors.error};
`;

const HeroMiniChart = styled.div`
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 120px;
  height: 70px;
  opacity: 0.75;
`;

/* ---- Stat Cards Row ---- */
const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radii.xl};
  padding: 1.25rem 1.5rem;
  box-shadow: ${({ theme }) => theme.shadows.sm};
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const StatIcon = styled.div<{ $bg: string }>`
  width: 46px;
  height: 46px;
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ $bg }) => `${$bg}18`};
  color: ${({ $bg }) => $bg};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const StatInfo = styled.div``;

const StatValue = styled.p`
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  line-height: 1.2;
`;

const StatLabel = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: 0.15rem;
`;

/* ---- Charts ---- */
const ChartsRow = styled.div`
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 1.25rem;

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radii.xl};
  padding: 1.5rem;
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

const ChartHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
`;

const ChartTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
`;

const DonutCenter = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
`;

const DonutPercent = styled.p`
  font-size: 2rem;
  font-weight: ${({ theme }) => theme.fontWeights.extrabold};
  line-height: 1;
`;

const DonutLabel = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const DonutContainer = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
`;

const DonutLegend = styled.div`
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 1rem;
`;

const LegendItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const LegendDot = styled.span<{ $color: string }>`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textSecondary};

  &::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${({ $color }) => $color};
  }
`;

const LegendValue = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.text};
`;

const ChartsRowBottom = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
  }
`;

// --- Helpers ---

function getDateRange(preset: string): { startDate: string; endDate: string } {
  const now = new Date();
  const end = now.toISOString().split('T')[0];
  let start: Date;

  switch (preset) {
    case '7d':
      start = new Date(now);
      start.setDate(start.getDate() - 7);
      break;
    case '30d':
      start = new Date(now);
      start.setDate(start.getDate() - 30);
      break;
    case '90d':
      start = new Date(now);
      start.setDate(start.getDate() - 90);
      break;
    case '12m':
      start = new Date(now);
      start.setFullYear(start.getFullYear() - 1);
      break;
    default:
      start = new Date(now);
      start.setDate(start.getDate() - 30);
  }

  return { startDate: start.toISOString().split('T')[0], endDate: end };
}

function formatShortDate(dateStr: string) {
  const [, m, d] = dateStr.split('-');
  return `${d}/${m}`;
}

const GENDER_LABELS: Record<string, string> = {
  masculino: 'Masculino',
  feminino: 'Feminino',
  outro: 'Outro',
  'não informado': 'Não informado',
};

function formatPeriodLabel(preset: string): string {
  switch (preset) {
    case '7d': return 'vs últimos 7 dias';
    case '30d': return 'vs mês anterior';
    case '90d': return 'vs trimestre anterior';
    case '12m': return 'vs ano anterior';
    default: return 'no período';
  }
}

// --- Component ---

export function AdminMetricsPage() {
  const theme = useTheme();
  const [preset, setPreset] = useState('30d');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const { startDate, endDate } = preset === 'custom'
    ? { startDate: customStart, endDate: customEnd }
    : getDateRange(preset);

  const isValidRange = startDate && endDate && startDate <= endDate;

  const { data: metrics, isLoading } = useQuery({
    queryKey: ['admin-metrics', startDate, endDate],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<MetricsData>>('/admin/metrics', {
        params: { startDate, endDate },
      });
      return data.data;
    },
    enabled: !!isValidRange,
  });

  const handlePreset = (p: string) => {
    setPreset(p);
    if (p !== 'custom') {
      setCustomStart('');
      setCustomEnd('');
    }
  };

  const PIE_COLORS = [theme.colors.primary, theme.colors.primaryLight, theme.colors.secondary, theme.colors.secondaryLight];

  const genderTotal = metrics?.genderDistribution.reduce((acc, g) => acc + g.count, 0) ?? 0;

  return (
    <Container>
      {/* Filter Bar */}
      <FilterBar>
        <Calendar size={16} color={theme.colors.textSecondary} />
        <FilterLabel>Período:</FilterLabel>
        {[
          { key: '7d', label: '7 dias' },
          { key: '30d', label: '30 dias' },
          { key: '90d', label: '90 dias' },
          { key: '12m', label: '12 meses' },
        ].map((p) => (
          <PresetButton key={p.key} $active={preset === p.key} onClick={() => handlePreset(p.key)}>
            {p.label}
          </PresetButton>
        ))}
        <PresetButton $active={preset === 'custom'} onClick={() => handlePreset('custom')}>
          Personalizado
        </PresetButton>
        {preset === 'custom' && (
          <>
            <DateInput type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} />
            <FilterLabel>até</FilterLabel>
            <DateInput type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} />
          </>
        )}
      </FilterBar>

      {!isValidRange && preset === 'custom' ? (
        <StatLabel>Selecione um período válido para ver as métricas.</StatLabel>
      ) : isLoading ? (
        <Loading />
      ) : !metrics ? null : (
        <>
          {/* Hero Cards */}
          <HeroRow>
            <HeroCardDark>
              <div>
                <HeroLabelLight>Receita Total</HeroLabelLight>
                <HeroValue style={{ color: '#fff' }}>
                  R$ {metrics.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </HeroValue>
                <HeroBadge $positive>
                  <ArrowUpRight size={14} />
                  {metrics.totalActiveSubscriptions} ativas
                </HeroBadge>
              </div>
              <HeroMiniChart>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metrics.dailyNewSubscribers}>
                    <Area type="monotone" dataKey="count" stroke={theme.colors.primary} fill={`${theme.colors.primary}30`} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </HeroMiniChart>
            </HeroCardDark>

            <HeroCard>
              <div>
                <HeroLabel>Novos Assinantes</HeroLabel>
                <HeroValue>{metrics.newSubscribers}</HeroValue>
                <HeroBadge $positive>
                  <ArrowUpRight size={14} />
                  {formatPeriodLabel(preset)}
                </HeroBadge>
              </div>
              <HeroMiniChart>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metrics.dailyNewSubscribers}>
                    <Area type="monotone" dataKey="count" stroke={theme.colors.success} fill={theme.colors.successBg} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </HeroMiniChart>
            </HeroCard>

            <HeroCard>
              <div>
                <HeroLabel>Cancelamentos</HeroLabel>
                <HeroValue>{metrics.canceledSubscribers}</HeroValue>
                <HeroBadge $positive={metrics.canceledSubscribers === 0}>
                  {metrics.canceledSubscribers > 0 ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
                  {formatPeriodLabel(preset)}
                </HeroBadge>
              </div>
            </HeroCard>
          </HeroRow>

          {/* Stat Cards */}
          <StatsGrid>
            <StatCard>
              <StatIcon $bg={theme.colors.primary}><DollarSign size={22} /></StatIcon>
              <StatInfo>
                <StatValue>{metrics.totalActiveSubscriptions}</StatValue>
                <StatLabel>Assinaturas ativas</StatLabel>
              </StatInfo>
            </StatCard>
            <StatCard>
              <StatIcon $bg={theme.colors.success}><Activity size={22} /></StatIcon>
              <StatInfo>
                <StatValue>{metrics.redemptionsInPeriod}</StatValue>
                <StatLabel>Validações no período</StatLabel>
              </StatInfo>
            </StatCard>
            <StatCard>
              <StatIcon $bg={theme.colors.secondary}><Users size={22} /></StatIcon>
              <StatInfo>
                <StatValue>{metrics.averageAge ?? '—'}</StatValue>
                <StatLabel>Idade média</StatLabel>
              </StatInfo>
            </StatCard>
          </StatsGrid>

          {/* Chart: Validações por dia + Donut Gênero */}
          <ChartsRow>
            <ChartCard>
              <ChartHeader>
                <ChartTitle>Validações por dia</ChartTitle>
              </ChartHeader>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={metrics.dailyRedemptions} barCategoryGap="25%">
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke={theme.colors.borderLight} />
                  <XAxis dataKey="date" tickFormatter={formatShortDate} fontSize={11} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} fontSize={11} axisLine={false} tickLine={false} />
                  <Tooltip
                    labelFormatter={(v) => formatShortDate(v as string)}
                    contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="count" name="Validações" fill={theme.colors.primary} radius={[6, 6, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard>
              <ChartHeader>
                <ChartTitle>Distribuição por gênero</ChartTitle>
              </ChartHeader>
              {metrics.genderDistribution.length > 0 ? (
                <>
                  <DonutContainer>
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie
                          data={metrics.genderDistribution}
                          dataKey="count"
                          nameKey="gender"
                          cx="50%"
                          cy="50%"
                          innerRadius={65}
                          outerRadius={95}
                          paddingAngle={3}
                          cornerRadius={6}
                        >
                          {metrics.genderDistribution.map((_, i) => (
                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value, name) => [value, GENDER_LABELS[name as string] || name]} />
                      </PieChart>
                    </ResponsiveContainer>
                    <DonutCenter>
                      <DonutPercent>{genderTotal}</DonutPercent>
                      <DonutLabel>Total</DonutLabel>
                    </DonutCenter>
                  </DonutContainer>
                  <DonutLegend>
                    {metrics.genderDistribution.map((g, i) => (
                      <LegendItem key={g.gender}>
                        <LegendDot $color={PIE_COLORS[i % PIE_COLORS.length]}>
                          {GENDER_LABELS[g.gender] || g.gender}
                        </LegendDot>
                        <LegendValue>{g.count}</LegendValue>
                      </LegendItem>
                    ))}
                  </DonutLegend>
                </>
              ) : (
                <StatLabel style={{ textAlign: 'center', padding: '3rem 0' }}>Nenhum dado de gênero disponível.</StatLabel>
              )}
            </ChartCard>
          </ChartsRow>

          {/* Chart: Novos assinantes */}
          <ChartsRowBottom>
            <ChartCard style={{ gridColumn: '1 / -1' }}>
              <ChartHeader>
                <ChartTitle>Novos assinantes por dia</ChartTitle>
              </ChartHeader>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={metrics.dailyNewSubscribers}>
                  <defs>
                    <linearGradient id="gradientSubscribers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={theme.colors.primary} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={theme.colors.primary} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke={theme.colors.borderLight} />
                  <XAxis dataKey="date" tickFormatter={formatShortDate} fontSize={11} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} fontSize={11} axisLine={false} tickLine={false} />
                  <Tooltip
                    labelFormatter={(v) => formatShortDate(v as string)}
                    contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    name="Assinantes"
                    stroke={theme.colors.primary}
                    fill="url(#gradientSubscribers)"
                    strokeWidth={2.5}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
          </ChartsRowBottom>
        </>
      )}
    </Container>
  );
}
