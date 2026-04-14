import styled from 'styled-components';
import { useAuthStore } from '../../stores/authStore';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Button, SubscriptionBadge, Loading } from '../../components/ui';
import { UtensilsCrossed, QrCode, History, CheckCircle, Calendar, TicketCheck } from 'lucide-react';
import { formatDateShort } from '../../utils/format';
import type { SubscriptionInfo, ApiResponse, BenefitRedemption } from '../../types';
import { fadeInUp, fadeIn, fadeInRight } from '../../styles/animations';

import imageDiv from '../../assets/background-welcome.jpg';

/* ── Layout principal ───────────────────────────────── */

const PageGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 1.5rem;
  align-items: start;
  animation: ${fadeInUp} 0.45s ease-out both;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: 1fr;
  }
`;

const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    order: 1;
  }
`;

const RightColumn = styled.div`
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    order: 3;
  }
`;

/* ── Banner ─────────────────────────────────────────── */

const Banner = styled.div`
  width: 100%;
  min-height: 260px;
  border-radius: ${({ theme }) => theme.radii.xl};
  background-image: url(${imageDiv});
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  display: flex;
  flex-direction: column;
  justify-content: center;
  animation: ${fadeIn} 0.5s ease-out both;
  align-items: flex-end;
  padding: 2rem;
  box-shadow: ${({ theme }) => theme.shadows.lg};

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    min-height: 200px;
    align-items: center;
    text-align: center;
    padding: 1.5rem;
  }
`;

const BannerInner = styled.div`
  width: 55%;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    width: 100%;
  }
`;

const BannerTitle = styled.h2`
  color: ${({ theme }) => theme.colors.white};
  font-size: ${({ theme }) => theme.fontSizes['3xl']};
  strong { font-weight: ${({ theme }) => theme.fontWeights.extrabold}; }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    font-size: ${({ theme }) => theme.fontSizes['2xl']};
  }
`;

const BannerText = styled.p`
  color: ${({ theme }) => theme.colors.white};
  font-size: ${({ theme }) => theme.fontSizes.md};
  margin-top: 0.5rem;
`;

const BannerLink = styled(Link)`
  display: inline-block;
  margin-top: 1rem;
  padding: 0.5rem 1.5rem;
  border: 1px solid ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radii.full};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }
`;

/* ── Quick Links ────────────────────────────────────── */

const QuickLinksGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  grid-column: 1 / -1;
  order: -1;
  animation: ${fadeInUp} 0.45s ease-out 0.15s both;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: 1fr;
    order: 2;
  }
`;

const QuickLink = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.xl};
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: ${({ theme }) => theme.shadows.md};
    transform: translateY(-2px);
  }
`;

const QuickIcon = styled.div<{ $bg: string }>`
  width: 44px;
  height: 44px;
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ $bg }) => $bg};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const QuickContent = styled.div``;

const QuickTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
`;

const QuickDesc = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

/* ── Profile Card ───────────────────────────────────── */

const ProfileCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.xl};
  padding: 1.75rem 1.5rem;
  text-align: center;
  animation: ${fadeInRight} 0.45s ease-out 0.1s both;
`;

const AvatarCircle = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin: 0 auto 1rem;
  overflow: hidden;
  border: 3px solid ${({ theme }) => theme.colors.primary};
  background: ${({ theme }) => theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;

  img { width: 100%; height: 100%; object-fit: cover; }
`;

const AvatarInitials = styled.span`
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.white};
`;

const ProfileName = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  margin-bottom: 0.25rem;
`;

const ProfileEmail = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textLight};
  margin-bottom: 1rem;
`;

const BadgeRow = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 1.25rem;
`;

const Divider = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.colors.borderLight};
  margin: 0 -1.5rem 1.25rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
`;

const StatItem = styled.div`
  background: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: 0.85rem 0.75rem;
  text-align: center;
`;

const StatIcon = styled.div<{ $color: string }>`
  width: 32px;
  height: 32px;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ $color }) => `${$color}18`};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 0.4rem;
`;

const StatValue = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  line-height: 1.2;
`;

const StatLabel = styled.div`
  font-size: 0.65rem;
  color: ${({ theme }) => theme.colors.textLight};
  margin-top: 0.15rem;
`;

const NoSubMessage = styled.div`
  margin-top: 0.5rem;
  p {
    font-size: ${({ theme }) => theme.fontSizes.sm};
    color: ${({ theme }) => theme.colors.textSecondary};
    margin-bottom: 0.75rem;
  }
`;

/* ── helpers ─────────────────────────────────────────── */

function getSubscriptionDuration(start?: string): string {
  if (!start) return '—';
  const s = new Date(start).getTime();
  const now = Date.now();
  const diffDays = Math.floor((now - s) / (1000 * 60 * 60 * 24));
  if (diffDays < 30) return `${diffDays} dias`;
  const months = Math.floor(diffDays / 30);
  return months === 1 ? '1 mês' : `${months} meses`;
}

function getInitials(name?: string) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : parts[0].substring(0, 2).toUpperCase();
}

/* ── Component ──────────────────────────────────────── */

export function DashboardPage() {
  const { user } = useAuthStore();

  const { data: subscription, isLoading: loadingSub } = useQuery({
    queryKey: ['subscription-status'],
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; data: SubscriptionInfo }>('/subscriptions/status');
      return data.data;
    },
  });

  const { data: historyMeta } = useQuery({
    queryKey: ['benefit-history-count'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<BenefitRedemption[]>>('/benefits/history', {
        params: { limit: '1' },
      });
      return data.meta;
    },
  });

  const redemptionCount = historyMeta?.total ?? 0;

  return (
    <PageGrid>
      {/* ── Coluna esquerda: Banner ── */}
      <LeftColumn>
        <Banner>
          <BannerInner>
            <BannerTitle>Bem vindo, <strong>{user?.name?.split(' ')[0] || 'Usuário'}</strong></BannerTitle>
            <BannerText>Explore todos nossos restaurantes parceiros e curta cada experiência.</BannerText>
            <BannerLink to="/empresas">Ver parceiros</BannerLink>
          </BannerInner>
        </Banner>
      </LeftColumn>

      {/* ── Quick Links (entre banner e perfil no mobile) ── */}
      <QuickLinksGrid>
        <Link to="/empresas">
          <QuickLink>
            <QuickIcon $bg="#FFF3D6"><UtensilsCrossed size={20} color="#feb621" /></QuickIcon>
            <QuickContent>
              <QuickTitle>Restaurantes</QuickTitle>
              <QuickDesc>Veja os parceiros</QuickDesc>
            </QuickContent>
          </QuickLink>
        </Link>
        <Link to="/validar">
          <QuickLink>
            <QuickIcon $bg="#E8F5E9"><QrCode size={20} color="#22c55e" /></QuickIcon>
            <QuickContent>
              <QuickTitle>Validar QR</QuickTitle>
              <QuickDesc>Use seu benefício</QuickDesc>
            </QuickContent>
          </QuickLink>
        </Link>
        <Link to="/historico">
          <QuickLink>
            <QuickIcon $bg="#EDE7F6"><History size={20} color="#7c3aed" /></QuickIcon>
            <QuickContent>
              <QuickTitle>Histórico</QuickTitle>
              <QuickDesc>Seus resgates</QuickDesc>
            </QuickContent>
          </QuickLink>
        </Link>
      </QuickLinksGrid>

      {/* ── Coluna direita: Perfil ── */}}
      <RightColumn>
        <ProfileCard>
          <AvatarCircle>
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} />
            ) : (
              <AvatarInitials>{getInitials(user?.name)}</AvatarInitials>
            )}
          </AvatarCircle>

          <ProfileName>{user?.name}</ProfileName>
          <ProfileEmail>{user?.email}</ProfileEmail>

          <BadgeRow>
            {loadingSub ? (
              <Loading />
            ) : subscription ? (
              <SubscriptionBadge status={subscription.status} cancelAtPeriodEnd={subscription.cancelAtPeriodEnd} />
            ) : (
              <NoSubMessage>
                <p>Você ainda não possui assinatura</p>
                <Link to="/assinar"><Button $size="sm">Assinar agora</Button></Link>
              </NoSubMessage>
            )}
          </BadgeRow>

          {subscription && (
            <>
              <Divider />
              <StatsGrid>
                <StatItem>
                  <StatIcon $color="#3b82f6"><Calendar size={15} color="#3b82f6" /></StatIcon>
                  <StatValue>{getSubscriptionDuration(subscription.currentPeriodStart)}</StatValue>
                  <StatLabel>Tempo de assinatura</StatLabel>
                </StatItem>
                <StatItem>
                  <StatIcon $color="#22c55e"><TicketCheck size={15} color="#22c55e" /></StatIcon>
                  <StatValue>{redemptionCount}</StatValue>
                  <StatLabel>Utilizações</StatLabel>
                </StatItem>
                <StatItem style={{ gridColumn: '1 / -1' }}>
                  <StatIcon $color="#f59e0b"><CheckCircle size={15} color="#f59e0b" /></StatIcon>
                  <StatValue>
                    {subscription.currentPeriodEnd
                      ? formatDateShort(subscription.currentPeriodEnd)
                      : '—'}
                  </StatValue>
                  <StatLabel>Vencimento da assinatura</StatLabel>
                </StatItem>
              </StatsGrid>
            </>
          )}
        </ProfileCard>
      </RightColumn>
    </PageGrid>
  );
}
