import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { Card, Loading, EmptyState, SubscriptionBadge } from '../../components/ui';
import { formatDateShort } from '../../utils/format';
import type { User, ApiResponse } from '../../types';
import { fadeInUp } from '../../styles/animations';

const LIMIT = 20;

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.sm};

  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const TotalLabel = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
  white-space: nowrap;
`;

const Table = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  animation: ${fadeInUp} 0.4s ease-out both;
`;

const Row = styled(Card)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  cursor: pointer;
  transition: border-color 0.2s;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const UserInfo = styled.div`
  flex: 1;
  min-width: 200px;
`;

const UserName = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
`;

const UserMeta = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.error ?? '#e74c3c'};
  cursor: pointer;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  transition: background 0.2s;

  &:hover {
    background: rgba(231, 76, 60, 0.1);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Pagination = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.25rem;
`;

const PageButton = styled.button<{ $active?: boolean }>`
  padding: 0.4rem 0.9rem;
  border-radius: 8px;
  border: 1px solid ${({ theme, $active }) => $active ? theme.colors.primary : theme.colors.border};
  background: ${({ theme, $active }) => $active ? theme.colors.primary : 'transparent'};
  color: ${({ theme, $active }) => $active ? '#fff' : theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  cursor: pointer;
  transition: opacity 0.2s;

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

const PageInfo = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const ConfirmOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ConfirmDialog = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 12px;
  padding: 2rem;
  max-width: 400px;
  width: 90%;
  text-align: center;

  h3 {
    margin-bottom: 0.5rem;
    font-size: ${({ theme }) => theme.fontSizes.lg};
  }

  p {
    margin-bottom: 1.5rem;
    font-size: ${({ theme }) => theme.fontSizes.sm};
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const ConfirmActions = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: center;

  button {
    padding: 0.5rem 1.25rem;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    border: none;
    font-size: ${({ theme }) => theme.fontSizes.sm};
  }
`;

const CancelBtn = styled.button`
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
`;

const ConfirmDeleteBtn = styled.button`
  background: ${({ theme }) => theme.colors.error ?? '#e74c3c'};
  color: #fff;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export function AdminUsersPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data: response, isLoading } = useQuery({
    queryKey: ['admin-users', page, search],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<User[]>>('/admin/users', {
        params: { page: String(page), limit: String(LIMIT), search: search || undefined },
      });
      return data;
    },
  });

  const users = response?.data ?? [];
  const meta = response?.meta;

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setUserToDelete(null);
    },
    onError: () => {
      alert('Erro ao remover usuário. Tente novamente.');
    },
  });

  return (
    <>
      <Toolbar>
        <SearchInput
          placeholder="Buscar por nome ou e-mail..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        {meta && (
          <TotalLabel>{meta.total} usuário{meta.total !== 1 ? 's' : ''}</TotalLabel>
        )}
      </Toolbar>

      {isLoading ? (
        <Loading />
      ) : !users.length ? (
        <EmptyState
          title="Nenhum usuário"
          message={search ? `Nenhum resultado para "${search}".` : 'Ainda não há usuários cadastrados.'}
        />
      ) : (
        <>
          <Table>
            {users.map((user) => (
              <Row key={user.id} variant="bordered" onClick={() => navigate(`/admin/usuarios/${user.id}`)}>
                <UserInfo>
                  <UserName>{user.name}</UserName>
                  <UserMeta>{user.email} • Desde {user.createdAt ? formatDateShort(user.createdAt) : '...'}</UserMeta>
                </UserInfo>
                <Actions>
                  {user.subscription ? (
                    <SubscriptionBadge status={user.subscription.status} cancelAtPeriodEnd={user.subscription?.cancelAtPeriodEnd} />
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: '#999' }}>Sem assinatura</span>
                  )}
                  <DeleteButton onClick={(e) => { e.stopPropagation(); setUserToDelete(user); }}>
                    Remover
                  </DeleteButton>
                </Actions>
              </Row>
            ))}
          </Table>

          {meta && meta.totalPages > 1 && (
            <Pagination>
              <PageButton disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                ← Anterior
              </PageButton>
              <PageInfo>Página {page} de {meta.totalPages}</PageInfo>
              <PageButton disabled={page >= meta.totalPages} onClick={() => setPage((p) => p + 1)}>
                Próxima →
              </PageButton>
            </Pagination>
          )}
        </>
      )}

      {userToDelete && (
        <ConfirmOverlay onClick={() => setUserToDelete(null)}>
          <ConfirmDialog onClick={(e) => e.stopPropagation()}>
            <h3>Remover usuário</h3>
            <p>
              Tem certeza que deseja remover <strong>{userToDelete.name}</strong>?
              Essa ação não pode ser desfeita.
            </p>
            <ConfirmActions>
              <CancelBtn onClick={() => setUserToDelete(null)}>Cancelar</CancelBtn>
              <ConfirmDeleteBtn
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(userToDelete.id)}
              >
                {deleteMutation.isPending ? 'Removendo...' : 'Remover'}
              </ConfirmDeleteBtn>
            </ConfirmActions>
          </ConfirmDialog>
        </ConfirmOverlay>
      )}
    </>
  );
}
