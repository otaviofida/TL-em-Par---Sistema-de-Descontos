import styled from 'styled-components';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Bell, CheckCheck, Clock } from 'lucide-react';
import type { Notification, ApiResponse, PaginationMeta } from '../../types';
import { fadeIn } from '../../styles/animations';

const Container = styled.div`
  max-width: 640px;
  margin: 0 auto;
  animation: ${fadeIn} 0.3s ease-out both;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const Title = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.dark};
`;

const MarkAllButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  transition: opacity 0.2s;

  &:hover { opacity: 0.7; }
  &:disabled { opacity: 0.4; cursor: default; }
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const NotificationCard = styled.div<{ $read: boolean }>`
  display: flex;
  gap: 0.75rem;
  padding: 1rem;
  background: ${({ $read, theme }) => ($read ? theme.colors.surface : theme.colors.white)};
  border: 1px solid ${({ $read, theme }) => ($read ? theme.colors.border : theme.colors.primary + '40')};
  border-radius: ${({ theme }) => theme.radii.lg};
  cursor: pointer;
  transition: all 0.2s;
  position: relative;

  ${({ $read }) => !$read && `
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 3px;
      border-radius: 3px 0 0 3px;
    }
  `}

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }
`;

const IconWrapper = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primary}15;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: ${({ theme }) => theme.colors.primary};
`;

const NotifContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const NotifTitle = styled.p<{ $read: boolean }>`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ $read, theme }) => ($read ? theme.fontWeights.medium : theme.fontWeights.bold)};
  color: ${({ theme }) => theme.colors.dark};
  margin-bottom: 0.25rem;
`;

const NotifMessage = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textLight};
  line-height: 1.4;
`;

const NotifTime = styled.span`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.textLight};
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-top: 0.375rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: ${({ theme }) => theme.colors.textLight};

  svg { margin-bottom: 0.75rem; opacity: 0.3; }
  p { font-size: ${({ theme }) => theme.fontSizes.sm}; }
`;

function formatTimeAgo(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'agora';
  if (diffMin < 60) return `${diffMin}min atrás`;
  if (diffHours < 24) return `${diffHours}h atrás`;
  if (diffDays < 7) return `${diffDays}d atrás`;
  return date.toLocaleDateString('pt-BR');
}

export function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Notification[]>>('/notifications?limit=50');
      return res.data;
    },
  });

  const { data: unreadData } = useQuery({
    queryKey: ['notifications-unread'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<{ count: number }>>('/notifications/unread-count');
      return res.data.data.count;
    },
  });

  const markAsRead = useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
    },
  });

  const markAllAsRead = useMutation({
    mutationFn: () => api.patch('/notifications/read-all'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
    },
  });

  const notifications = data?.data ?? [];
  const unreadCount = unreadData ?? 0;

  return (
    <Container>
      <Header>
        <Title>Notificações</Title>
        {unreadCount > 0 && (
          <MarkAllButton onClick={() => markAllAsRead.mutate()} disabled={markAllAsRead.isPending}>
            <CheckCheck size={16} />
            Marcar todas como lidas
          </MarkAllButton>
        )}
      </Header>

      {notifications.length === 0 ? (
        <EmptyState>
          <Bell size={48} />
          <p>Nenhuma notificação ainda.</p>
        </EmptyState>
      ) : (
        <List>
          {notifications.map((n) => (
            <NotificationCard
              key={n.id}
              $read={n.read}
              onClick={() => !n.read && markAsRead.mutate(n.id)}
            >
              <IconWrapper>
                <Bell size={18} />
              </IconWrapper>
              <NotifContent>
                <NotifTitle $read={n.read}>{n.title}</NotifTitle>
                <NotifMessage>{n.message}</NotifMessage>
                <NotifTime>
                  <Clock size={12} />
                  {formatTimeAgo(n.createdAt)}
                </NotifTime>
              </NotifContent>
            </NotificationCard>
          ))}
        </List>
      )}
    </Container>
  );
}
