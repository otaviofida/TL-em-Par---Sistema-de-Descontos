import styled from 'styled-components';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import toast from 'react-hot-toast';
import { Settings2, Users, ToggleLeft, ToggleRight } from 'lucide-react';

const Page = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const PageTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  font-weight: ${({ theme }) => theme.fontWeights.extrabold};
  color: ${({ theme }) => theme.colors.dark};
`;

const PageSubtitle = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const SectionTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.dark};
  display: flex;
  align-items: center;
  gap: 0.5rem;

  svg { color: ${({ theme }) => theme.colors.primary}; }
`;

const SettingCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.xl};
  padding: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  transition: box-shadow 0.2s;

  &:hover { box-shadow: ${({ theme }) => theme.shadows.md}; }

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const SettingInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const SettingLabel = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text};
`;

const SettingDescription = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.5;
`;

const StatusBadge = styled.span<{ $enabled: boolean }>`
  display: inline-flex;
  align-items: center;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  padding: 0.2rem 0.6rem;
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ $enabled, theme }) => $enabled ? theme.colors.successBg : theme.colors.errorBg};
  color: ${({ $enabled, theme }) => $enabled ? theme.colors.success : theme.colors.error};
  margin-top: 0.25rem;
`;

const ToggleButton = styled.button<{ $enabled: boolean; $loading: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  border-radius: ${({ theme }) => theme.radii.full};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  cursor: ${({ $loading }) => ($loading ? 'not-allowed' : 'pointer')};
  opacity: ${({ $loading }) => ($loading ? 0.6 : 1)};
  transition: all 0.2s;
  white-space: nowrap;
  flex-shrink: 0;

  background: ${({ $enabled, theme }) => $enabled ? theme.colors.errorBg : theme.colors.successBg};
  color: ${({ $enabled, theme }) => $enabled ? theme.colors.error : theme.colors.success};
  border: 1px solid ${({ $enabled, theme }) => $enabled ? theme.colors.error + '44' : theme.colors.success + '44'};

  &:hover:not(:disabled) {
    background: ${({ $enabled, theme }) => $enabled ? theme.colors.error : theme.colors.success};
    color: ${({ theme }) => theme.colors.white};
  }
`;

const Skeleton = styled.div`
  height: 96px;
  background: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.xl};
  animation: pulse 1.5s ease-in-out infinite;

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;

interface AppSettings {
  registrationEnabled?: string;
}

export function AdminSettingsPage() {
  const queryClient = useQueryClient();
  const [togglingKey, setTogglingKey] = useState<string | null>(null);

  const { data: settings, isLoading } = useQuery<AppSettings>({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; data: AppSettings }>('/admin/settings');
      return data.data;
    },
  });

  const mutation = useMutation({
    mutationFn: async (payload: Partial<AppSettings>) => {
      const { data } = await api.patch<{ success: boolean; data: AppSettings }>('/admin/settings', payload);
      return data.data;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(['admin-settings'], updated);
      queryClient.invalidateQueries({ queryKey: ['public-settings'] });
      toast.success('Configuração atualizada!');
    },
    onError: () => {
      toast.error('Erro ao atualizar configuração.');
    },
    onSettled: () => {
      setTogglingKey(null);
    },
  });

  const toggle = (key: string, currentValue: string) => {
    setTogglingKey(key);
    const newValue = currentValue === 'true' ? 'false' : 'true';
    mutation.mutate({ [key]: newValue });
  };

  const regEnabled = settings?.registrationEnabled !== 'false';

  return (
    <Page>
      <Header>
        <PageTitle>Configurações</PageTitle>
        <PageSubtitle>Controle global do comportamento do aplicativo.</PageSubtitle>
      </Header>

      <Section>
        <SectionTitle>
          <Settings2 size={20} />
          Acesso e cadastro
        </SectionTitle>

        {isLoading ? (
          <Skeleton />
        ) : (
          <SettingCard>
            <SettingInfo>
              <SettingLabel>
                <Users size={16} style={{ display: 'inline', marginRight: '0.4rem', verticalAlign: 'middle' }} />
                Novos cadastros
              </SettingLabel>
              <SettingDescription>
                Quando desativado, o formulário de cadastro é substituído por uma tela de lançamento
                e o endpoint <code>/api/auth/register</code> retorna erro 403.
              </SettingDescription>
              <StatusBadge $enabled={regEnabled}>
                {regEnabled ? 'Cadastros liberados' : 'Cadastros suspensos'}
              </StatusBadge>
            </SettingInfo>

            <ToggleButton
              $enabled={regEnabled}
              $loading={togglingKey === 'registrationEnabled'}
              disabled={togglingKey === 'registrationEnabled'}
              onClick={() => toggle('registrationEnabled', settings?.registrationEnabled ?? 'true')}
            >
              {regEnabled ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
              {togglingKey === 'registrationEnabled'
                ? 'Salvando...'
                : regEnabled
                ? 'Desativar cadastros'
                : 'Ativar cadastros'}
            </ToggleButton>
          </SettingCard>
        )}
      </Section>
    </Page>
  );
}
