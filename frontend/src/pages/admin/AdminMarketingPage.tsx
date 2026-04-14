import styled from 'styled-components';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Card, Loading, EmptyState, Button, Input } from '../../components/ui';
import { formatDateTime } from '../../utils/format';
import type { ApiResponse, MarketingPush } from '../../types';
import { Plus, Send, Clock, CheckCircle, XCircle, AlertTriangle, Trash2, Edit, X, Users, Bell } from 'lucide-react';
import toast from 'react-hot-toast';
import { fadeInUp } from '../../styles/animations';

// ---- Styled Components ----

const PageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const StatsRow = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
`;

const StatCard = styled(Card)`
  flex: 1;
  min-width: 140px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  animation: ${fadeInUp} 0.3s ease-out both;
`;

const StatIcon = styled.div<{ $color: string }>`
  width: 44px;
  height: 44px;
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ $color }) => $color}15;
  color: ${({ $color }) => $color};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StatInfo = styled.div``;

const StatValue = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
`;

const StatLabel = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const FilterTabs = styled.div`
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
`;

const FilterTab = styled.button<{ $active: boolean }>`
  padding: 0.4rem 0.9rem;
  border-radius: ${({ theme }) => theme.radii.full};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  border: 1px solid ${({ $active, theme }) => ($active ? theme.colors.primary : theme.colors.border)};
  background: ${({ $active, theme }) => ($active ? theme.colors.primary : theme.colors.white)};
  color: ${({ $active, theme }) => ($active ? theme.colors.white : theme.colors.text)};
  cursor: pointer;
  transition: all 0.2s;
`;

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
  animation: ${fadeInUp} 0.3s ease-out both;
`;

const PushInfo = styled.div`
  flex: 1;
  min-width: 200px;
`;

const PushTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  margin: 0;
`;

const PushMessage = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0.25rem 0 0;
`;

const PushMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  margin-top: 0.5rem;
`;

const MetaItem = styled.span`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const StatusBadge = styled.span<{ $status: string }>`
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.2rem 0.6rem;
  border-radius: ${({ theme }) => theme.radii.full};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  white-space: nowrap;
  background: ${({ $status }) => {
    switch ($status) {
      case 'SCHEDULED': return '#3b82f615';
      case 'SENDING': return '#f59e0b15';
      case 'SENT': return '#10b98115';
      case 'FAILED': return '#ef444415';
      case 'CANCELLED': return '#6b728015';
      default: return '#6b728015';
    }
  }};
  color: ${({ $status }) => {
    switch ($status) {
      case 'SCHEDULED': return '#3b82f6';
      case 'SENDING': return '#f59e0b';
      case 'SENT': return '#10b981';
      case 'FAILED': return '#ef4444';
      case 'CANCELLED': return '#6b7280';
      default: return '#6b7280';
    }
  }};
`;

const Actions = styled.div`
  display: flex;
  gap: 0.4rem;
`;

const ActionBtn = styled.button<{ $variant?: 'danger' | 'warn' }>`
  background: none;
  border: none;
  padding: 0.35rem;
  border-radius: ${({ theme }) => theme.radii.sm};
  cursor: pointer;
  color: ${({ theme }) => theme.colors.textLight};
  transition: color 0.2s;

  &:hover {
    color: ${({ $variant, theme }) =>
      $variant === 'danger' ? theme.colors.error :
      $variant === 'warn' ? '#f59e0b' :
      theme.colors.primary};
  }
`;

// Modal
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const ModalCard = styled(Card)`
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
`;

const ModalTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  margin: 0;
`;

const CloseBtn = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textLight};
  cursor: pointer;
  padding: 0.25rem;
  &:hover { color: ${({ theme }) => theme.colors.text}; }
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  margin-bottom: 0.35rem;
  color: ${({ theme }) => theme.colors.text};
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.625rem 0.875rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-family: inherit;
  resize: vertical;
  min-height: 80px;
  background: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.text};
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const DateTimeInput = styled.input`
  width: 100%;
  padding: 0.625rem 0.875rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-family: inherit;
  background: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.text};
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  margin-top: 1.25rem;
`;

const ResultInfo = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

// ---- Component ----

const statusLabels: Record<string, string> = {
  SCHEDULED: 'Agendado',
  SENDING: 'Enviando',
  SENT: 'Enviado',
  FAILED: 'Falhou',
  CANCELLED: 'Cancelado',
};

const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case 'SCHEDULED': return <Clock size={12} />;
    case 'SENDING': return <Send size={12} />;
    case 'SENT': return <CheckCircle size={12} />;
    case 'FAILED': return <AlertTriangle size={12} />;
    case 'CANCELLED': return <XCircle size={12} />;
    default: return null;
  }
};

export function AdminMarketingPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPush, setEditingPush] = useState<MarketingPush | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [url, setUrl] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');

  // Fetch pushes
  const { data: pushes, isLoading } = useQuery({
    queryKey: ['admin-marketing', filter],
    queryFn: async () => {
      const params: Record<string, string> = { limit: '50' };
      if (filter) params.status = filter;
      const { data } = await api.get<ApiResponse<MarketingPush[]>>('/admin/marketing', { params });
      return data.data;
    },
  });

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ['admin-marketing-stats'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<{ subscriberCount: number }>>('/admin/marketing/stats');
      return data.data;
    },
  });

  // Create
  const createMutation = useMutation({
    mutationFn: (body: { title: string; message: string; url?: string; scheduledAt: string }) =>
      api.post('/admin/marketing', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-marketing'] });
      toast.success('Push agendado com sucesso!');
      closeModal();
    },
    onError: () => toast.error('Erro ao agendar push'),
  });

  // Update
  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, string> }) =>
      api.put(`/admin/marketing/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-marketing'] });
      toast.success('Push atualizado!');
      closeModal();
    },
    onError: () => toast.error('Erro ao atualizar push'),
  });

  // Cancel
  const cancelMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/admin/marketing/${id}/cancel`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-marketing'] });
      toast.success('Push cancelado');
    },
    onError: () => toast.error('Erro ao cancelar push'),
  });

  // Delete
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/marketing/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-marketing'] });
      toast.success('Push removido');
    },
    onError: () => toast.error('Erro ao remover push'),
  });

  const openCreate = () => {
    setEditingPush(null);
    setTitle('');
    setMessage('');
    setUrl('');
    setScheduledAt('');
    setModalOpen(true);
  };

  const openEdit = (push: MarketingPush) => {
    setEditingPush(push);
    setTitle(push.title);
    setMessage(push.message);
    setUrl(push.url || '');
    // Converte ISO para datetime-local format
    const dt = new Date(push.scheduledAt);
    const localStr = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    setScheduledAt(localStr);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingPush(null);
  };

  const handleSubmit = () => {
    if (!title.trim() || !message.trim() || !scheduledAt) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const body: Record<string, string> = {
      title: title.trim(),
      message: message.trim(),
      scheduledAt: new Date(scheduledAt).toISOString(),
    };
    if (url.trim()) body.url = url.trim();

    if (editingPush) {
      updateMutation.mutate({ id: editingPush.id, body });
    } else {
      createMutation.mutate(body as any);
    }
  };

  // Contagens
  const scheduled = pushes?.filter(p => p.status === 'SCHEDULED').length ?? 0;
  const sent = pushes?.filter(p => p.status === 'SENT').length ?? 0;

  if (isLoading) return <Loading />;

  return (
    <>
      <PageHeader>
        <div />
        <Button onClick={openCreate}>
          <Plus size={16} /> Agendar Push
        </Button>
      </PageHeader>

      <StatsRow>
        <StatCard>
          <StatIcon $color="#3b82f6"><Users size={20} /></StatIcon>
          <StatInfo>
            <StatValue>{stats?.subscriberCount ?? 0}</StatValue>
            <StatLabel>Inscritos</StatLabel>
          </StatInfo>
        </StatCard>
        <StatCard>
          <StatIcon $color="#f59e0b"><Clock size={20} /></StatIcon>
          <StatInfo>
            <StatValue>{scheduled}</StatValue>
            <StatLabel>Agendados</StatLabel>
          </StatInfo>
        </StatCard>
        <StatCard>
          <StatIcon $color="#10b981"><CheckCircle size={20} /></StatIcon>
          <StatInfo>
            <StatValue>{sent}</StatValue>
            <StatLabel>Enviados</StatLabel>
          </StatInfo>
        </StatCard>
      </StatsRow>

      <FilterTabs>
        <FilterTab $active={filter === null} onClick={() => setFilter(null)}>Todos</FilterTab>
        <FilterTab $active={filter === 'SCHEDULED'} onClick={() => setFilter('SCHEDULED')}>Agendados</FilterTab>
        <FilterTab $active={filter === 'SENT'} onClick={() => setFilter('SENT')}>Enviados</FilterTab>
        <FilterTab $active={filter === 'FAILED'} onClick={() => setFilter('FAILED')}>Falhos</FilterTab>
        <FilterTab $active={filter === 'CANCELLED'} onClick={() => setFilter('CANCELLED')}>Cancelados</FilterTab>
      </FilterTabs>

      {!pushes?.length ? (
        <EmptyState icon={<Bell size={40} />} title="Nenhum push encontrado" description="Agende seu primeiro push notification!" />
      ) : (
        <Table>
          {pushes.map((push) => (
            <Row key={push.id}>
              <PushInfo>
                <PushTitle>{push.title}</PushTitle>
                <PushMessage>{push.message}</PushMessage>
                <PushMeta>
                  <StatusBadge $status={push.status}>
                    <StatusIcon status={push.status} />
                    {statusLabels[push.status] || push.status}
                  </StatusBadge>
                  <MetaItem>
                    <Clock size={12} />
                    {formatDateTime(push.scheduledAt)}
                  </MetaItem>
                  {push.sentAt && (
                    <MetaItem>
                      <Send size={12} />
                      Enviado: {formatDateTime(push.sentAt)}
                    </MetaItem>
                  )}
                  {push.status === 'SENT' && (
                    <ResultInfo>
                      <span>✅ {push.sentCount}</span>
                      {push.failCount > 0 && <span>❌ {push.failCount}</span>}
                    </ResultInfo>
                  )}
                </PushMeta>
              </PushInfo>
              <Actions>
                {push.status === 'SCHEDULED' && (
                  <>
                    <ActionBtn title="Editar" onClick={() => openEdit(push)}>
                      <Edit size={16} />
                    </ActionBtn>
                    <ActionBtn $variant="warn" title="Cancelar" onClick={() => cancelMutation.mutate(push.id)}>
                      <XCircle size={16} />
                    </ActionBtn>
                  </>
                )}
                <ActionBtn $variant="danger" title="Remover" onClick={() => deleteMutation.mutate(push.id)}>
                  <Trash2 size={16} />
                </ActionBtn>
              </Actions>
            </Row>
          ))}
        </Table>
      )}

      {/* Modal Create/Edit */}
      {modalOpen && (
        <Overlay onClick={closeModal}>
          <ModalCard onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>{editingPush ? 'Editar Push' : 'Agendar Push Notification'}</ModalTitle>
              <CloseBtn onClick={closeModal}><X size={20} /></CloseBtn>
            </ModalHeader>

            <FormGroup>
              <Label>Título *</Label>
              <Input
                value={title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                placeholder="Ex: Nova edição disponível!"
                maxLength={100}
              />
            </FormGroup>

            <FormGroup>
              <Label>Mensagem *</Label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Mensagem que aparecerá na notificação..."
                maxLength={500}
              />
            </FormGroup>

            <FormGroup>
              <Label>URL (opcional)</Label>
              <Input
                value={url}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUrl(e.target.value)}
                placeholder="Ex: /empresas ou https://tlempar.com.br/empresas"
              />
            </FormGroup>

            <FormGroup>
              <Label>Data e Hora *</Label>
              <DateTimeInput
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
              />
            </FormGroup>

            <ButtonRow>
              <Button $variant="secondary" onClick={closeModal}>Cancelar</Button>
              <Button
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending
                  ? 'Salvando...'
                  : editingPush ? 'Salvar' : 'Agendar'}
              </Button>
            </ButtonRow>
          </ModalCard>
        </Overlay>
      )}
    </>
  );
}
