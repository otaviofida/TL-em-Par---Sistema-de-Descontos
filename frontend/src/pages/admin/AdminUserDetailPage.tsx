import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, MessageCircle, Mail, CreditCard, Calendar } from 'lucide-react';
import { api } from '../../lib/api';
import { Card, Loading, SubscriptionBadge, EmptyState } from '../../components/ui';
import { formatDateShort, formatDateTime, formatCpf, formatPhone } from '../../utils/format';
import type { ApiResponse } from '../../types';

interface UserDetail {
  id: string;
  name: string;
  email: string;
  phone?: string;
  cpf?: string;
  role: string;
  createdAt: string;
  subscription?: {
    id: string;
    status: 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'INCOMPLETE';
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    currentPeriodStart?: string;
    currentPeriodEnd?: string;
    cancelAtPeriodEnd?: boolean;
    createdAt?: string;
  };
  benefitRedemptions: {
    id: string;
    redeemedAt: string;
    company: { id: string; name: string };
    edition: { id: string; name: string };
  }[];
  paymentHistory: {
    id: string;
    amount: number;
    currency: string;
    status: string;
    paidAt: string | null;
    invoiceUrl: string | null;
  }[];
}

// Styled components

const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  margin-bottom: 1rem;
  padding: 0;

  &:hover { color: ${({ theme }) => theme.colors.text}; }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const HeaderLeft = styled.div``;

const PageTitle = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
`;

const HeaderMeta = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: 0.25rem;
`;

const WhatsAppButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #25d366;
  color: #fff;
  padding: 0.625rem 1.25rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  text-decoration: none;
  transition: background 0.2s;

  &:hover { background: #1ebe57; }
`;

const SectionTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  margin-bottom: 1rem;
  margin-top: 2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${({ theme }) => theme.colors.text};

  svg { color: ${({ theme }) => theme.colors.primary}; }
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
`;

const InfoCard = styled(Card)`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const InfoLabel = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const InfoValue = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
`;

const TableWrapper = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: ${({ theme }) => theme.fontSizes.sm};

  th {
    text-align: left;
    padding: 0.75rem 1rem;
    font-weight: ${({ theme }) => theme.fontWeights.semibold};
    color: ${({ theme }) => theme.colors.textSecondary};
    border-bottom: 2px solid ${({ theme }) => theme.colors.border};
    font-size: ${({ theme }) => theme.fontSizes.xs};
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  td {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight};
    vertical-align: middle;
  }

  tr:last-child td { border-bottom: none; }
`;

const StatusDot = styled.span<{ $color: string }>`
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  margin-right: 0.5rem;
`;

const InvoiceLink = styled.a`
  color: ${({ theme }) => theme.colors.info};
  text-decoration: none;
  font-weight: ${({ theme }) => theme.fontWeights.medium};

  &:hover { text-decoration: underline; }
`;

const EmptyRow = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  padding: 2rem 0;
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

// Component

export function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: user, isLoading } = useQuery({
    queryKey: ['admin-user', id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<UserDetail>>(`/admin/users/${id}`);
      return data.data;
    },
    enabled: !!id,
  });

  if (isLoading) return <Loading />;
  if (!user) return <EmptyState title="Usuário não encontrado" message="Este usuário não existe ou foi removido." />;

  const whatsappNumber = user.phone?.replace(/\D/g, '') || '';
  const whatsappUrl = whatsappNumber
    ? `https://wa.me/55${whatsappNumber}`
    : null;

  return (
    <>
      <BackButton onClick={() => navigate('/admin/usuarios')}>
        <ArrowLeft size={16} /> Voltar para usuários
      </BackButton>

      <Header>
        <HeaderLeft>
          <PageTitle>{user.name}</PageTitle>
          <HeaderMeta>Cadastrado em {formatDateShort(user.createdAt)}</HeaderMeta>
        </HeaderLeft>
        {whatsappUrl && (
          <WhatsAppButton href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            <MessageCircle size={18} /> WhatsApp
          </WhatsAppButton>
        )}
      </Header>

      {/* Dados cadastrais */}
      <SectionTitle><Mail size={18} /> Dados cadastrais</SectionTitle>
      <InfoGrid>
        <InfoCard>
          <InfoLabel>Email</InfoLabel>
          <InfoValue>{user.email}</InfoValue>
        </InfoCard>
        <InfoCard>
          <InfoLabel>Telefone</InfoLabel>
          <InfoValue>{user.phone ? formatPhone(user.phone) : '—'}</InfoValue>
        </InfoCard>
        <InfoCard>
          <InfoLabel>CPF</InfoLabel>
          <InfoValue>{user.cpf ? formatCpf(user.cpf) : '—'}</InfoValue>
        </InfoCard>
        <InfoCard>
          <InfoLabel>Assinatura</InfoLabel>
          <InfoValue>
            {user.subscription ? (
              <SubscriptionBadge status={user.subscription.status} />
            ) : (
              <span style={{ color: '#999' }}>Sem assinatura</span>
            )}
          </InfoValue>
        </InfoCard>
        {user.subscription?.currentPeriodEnd && (
          <InfoCard>
            <InfoLabel>Válida até</InfoLabel>
            <InfoValue>{formatDateShort(user.subscription.currentPeriodEnd)}</InfoValue>
          </InfoCard>
        )}
      </InfoGrid>

      {/* Histórico de pagamentos */}
      <SectionTitle><CreditCard size={18} /> Histórico de pagamentos</SectionTitle>
      <Card>
        {user.paymentHistory.length === 0 ? (
          <EmptyRow>Nenhum pagamento registrado</EmptyRow>
        ) : (
          <TableWrapper>
            <Table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Valor</th>
                  <th>Status</th>
                  <th>Fatura</th>
                </tr>
              </thead>
              <tbody>
                {user.paymentHistory.map((payment) => (
                  <tr key={payment.id}>
                    <td>{payment.paidAt ? formatDateTime(payment.paidAt) : '—'}</td>
                    <td>
                      {(payment.amount / 100).toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: payment.currency.toUpperCase(),
                      })}
                    </td>
                    <td>
                      <StatusDot $color={payment.status === 'paid' ? '#22c55e' : '#f59e0b'} />
                      {payment.status === 'paid' ? 'Pago' : payment.status === 'open' ? 'Pendente' : payment.status}
                    </td>
                    <td>
                      {payment.invoiceUrl ? (
                        <InvoiceLink href={payment.invoiceUrl} target="_blank" rel="noopener noreferrer">
                          Ver fatura
                        </InvoiceLink>
                      ) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableWrapper>
        )}
      </Card>

      {/* Histórico de utilização */}
      <SectionTitle><Calendar size={18} /> Histórico de utilização</SectionTitle>
      <Card>
        {user.benefitRedemptions.length === 0 ? (
          <EmptyRow>Nenhum benefício utilizado</EmptyRow>
        ) : (
          <TableWrapper>
            <Table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Estabelecimento</th>
                  <th>Edição</th>
                </tr>
              </thead>
              <tbody>
                {user.benefitRedemptions.map((r) => (
                  <tr key={r.id}>
                    <td>{formatDateTime(r.redeemedAt)}</td>
                    <td>{r.company.name}</td>
                    <td>{r.edition.name}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableWrapper>
        )}
      </Card>
    </>
  );
}
