import styled from 'styled-components';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Card, Loading } from '../../components/ui';
import { Users, CreditCard, Building2, ClipboardList, TrendingUp, Building } from 'lucide-react';
import type { DashboardStats, ApiResponse } from '../../types';
import { useAuthStore } from '../../stores/authStore';
import { fadeInUp, fadeIn } from '../../styles/animations';

import imageDiv from '../../assets/background-welcome.jpg';

const Left = styled.div`
  grid-column: 1 / span 2;
  display: flex;
  flex-direction: column;
`;

const Right = styled.div`
  grid-column: 3 / span 1;
  margin-left: 2rem;
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: ${({ theme }) => theme.shadows.sm};

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    display: none;
  }
`;


const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
  animation: ${fadeInUp} 0.4s ease-out 0.08s both;
`;

const StatCard = styled(Card)`
  display: flex;
  align-items: center;
  gap: 1rem;
  justify-content: space-between;
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

const StatIcon = styled.div<{ $bg: string; }>`
  width: 48px;
  height: 48px;
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ $bg }) => $bg};
  color: ${({ theme }) => theme.colors.white};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const StatInfo = styled.div``;

const StatValue = styled.p`
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  line-height: 1;
`;

const StatLabel = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: 0.125rem;
`;

const SectionTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  margin-bottom: 1rem;
`;

const TopList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const TopItem = styled.div<{ $rank: number }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: ${({ theme, $rank }) =>
    $rank === 0
      ? theme.colors.primary
      : $rank === 1
        ? theme.colors.primaryLight
        : $rank === 2
          ? `${theme.colors.primaryLight}80`
          : theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.lg};
  border: 1px solid ${({ theme, $rank }) =>
    $rank <= 2 ? 'transparent' : theme.colors.border};
`;

const TopLogo = styled.img`
  width: 36px;
  height: 36px;
  border-radius: ${({ theme }) => theme.radii.full};
  object-fit: cover;
  flex-shrink: 0;
`;

const TopLogoFallback = styled.div`
  width: 36px;
  height: 36px;
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const TopInfo = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
`;

const TopName = styled.span`
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TopCount = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const EditionBanner = styled(Card)`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary} 0%, ${({ theme }) => theme.colors.primaryDark} 100%);
  color: ${({ theme }) => theme.colors.dark};
  margin-bottom: 2rem;
`;

const EditionName = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.xl};
`;

const EditionStat = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  opacity: 0.8;
  margin-top: 0.25rem;
`;

const DivImage = styled.div`
    width: 100%;
    height: 280px;
    border-radius: 1rem;
    object-fit: cover;
    margin-bottom: 1.5rem;
    box-shadow: ${({ theme }) => theme.shadows.lg};
    background-image: url(${imageDiv});
    background-color: center;
    background-repeat: no-repeat;
    background-size: cover;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-end;
    animation: ${fadeIn} 0.5s ease-out both;
    
    div{
        width: 50%;
    }

    h2{
        color: ${({ theme }) => theme.colors.white};
        font-size: ${({ theme }) => theme.fontSizes['3xl']};
        font-weight: ${({ theme }) => theme.fontWeights.extrabold};
    }

    p{
        color: ${({ theme }) => theme.colors.white};
        font-size: ${({ theme }) => theme.fontSizes.md};
        margin-top: 0.5rem;
    }

    a{
        display: inline-block;
        margin-top: 1rem;
        padding: 0.5rem 1.5rem;
        border: 1px solid ${({ theme }) => theme.colors.white};
        color: ${({ theme }) => theme.colors.white};
        border-radius: ${({ theme }) => theme.radii.full};
        font-weight: ${({ theme }) => theme.fontWeights.semibold};
        text-decoration: none;
        transition: background-color 0.2s;
    }
`;

export function AdminDashboardPage() {
  const { user } = useAuthStore();
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<DashboardStats>>('/admin/dashboard');
      return data.data;
    },
  });

  if (isLoading) return <Loading />;
  if (!stats) return null;

  return (
    <>
    <Left>
      <DivImage>
        <div>
            <h2>Bem vindo, {user?.name?.split(' ')[0] || 'Admin'}</h2>
            <p>Explore todos nossos restaurantes parceiros, e curta cada experiências.</p>
            <a href="/empresas">Ver parceiros</a>
        </div>
      </DivImage>

      {stats.currentEdition && (
        <EditionBanner>
          <EditionName>{stats.currentEdition.name}</EditionName>
          <EditionStat>{stats.currentEdition.redemptionCount} validações nesta edição</EditionStat>
        </EditionBanner>
      )}

      <StatsGrid>
        <StatCard>
          <StatInfo>
            <StatValue>{stats.totalUsers}</StatValue>
            <StatLabel>Usuários</StatLabel>
          </StatInfo>
          <StatIcon $bg="#3b82f6"><Users size={22} /></StatIcon>
        </StatCard>

        <StatCard>
          <StatInfo>
            <StatValue>{stats.activeSubscriptions}</StatValue>
            <StatLabel>Assinaturas ativas</StatLabel>
          </StatInfo>
          <StatIcon $bg="#22c55e"><CreditCard size={22} /></StatIcon>
        </StatCard>

        <StatCard>
          <StatInfo>
            <StatValue>{stats.activeCompanies}/{stats.totalCompanies}</StatValue>
            <StatLabel>Empresas ativas</StatLabel>
          </StatInfo>
          <StatIcon $bg="#feb621"><Building2 size={22} /></StatIcon>
        </StatCard>

        <StatCard>
          <StatInfo>
            <StatValue>{stats.totalRedemptions}</StatValue>
            <StatLabel>Validações totais</StatLabel>
          </StatInfo>
          <StatIcon $bg="#7c3aed"><ClipboardList size={22} /></StatIcon>
        </StatCard>

        <StatCard>
          <StatInfo>
            <StatValue>{stats.redemptionsThisMonth}</StatValue>
            <StatLabel>Validações (mês)</StatLabel>
          </StatInfo>
          <StatIcon $bg="#ef4444"><TrendingUp size={22} /></StatIcon>
        </StatCard>
      </StatsGrid>
    </Left>
    <Right>
      {stats.topCompanies.length > 0 && (
        <>
          <SectionTitle>Top parceiros</SectionTitle>
          <TopList>
            {stats.topCompanies.map((company, i) => (
              <TopItem key={company.id} $rank={i}>
                {company.logoUrl ? (
                  <TopLogo src={company.logoUrl} alt={company.name} />
                ) : (
                  <TopLogoFallback><Building size={18} /></TopLogoFallback>
                )}
                <TopInfo>
                  <TopName>{i + 1}. {company.name}</TopName>
                  <TopCount>{company.redemptionCount} validações</TopCount>
                </TopInfo>
              </TopItem>
            ))}
          </TopList>
        </>
      )}
    </Right>
    </>
  );
}
