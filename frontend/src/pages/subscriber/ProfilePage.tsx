import styled from 'styled-components';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../../stores/authStore';
import { api } from '../../lib/api';
import { Button, Input, SubscriptionBadge } from '../../components/ui';
import { getErrorMessage } from '../../utils/errorMessages';
import toast from 'react-hot-toast';
import { useState, useRef } from 'react';
import { Camera, Mail, CreditCard, Shield, CalendarDays, User as UserIcon, XCircle } from 'lucide-react';
import { formatDateShort } from '../../utils/format';
import { fadeInUp, fadeInLeft } from '../../styles/animations';
import { CancelSubscriptionModal } from '../../components/CancelSubscriptionModal';

/* ── Page ───────────────────────────────────────────── */

const PageTitle = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  margin-bottom: 1.5rem;
  animation: ${fadeInUp} 0.4s ease-out both;
  span { color: ${({ theme }) => theme.colors.primary}; }
`;

const PageGrid = styled.div`
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 1.5rem;
  align-items: start;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: 1fr;
  }
`;

/* ── Sidebar (avatar card) ──────────────────────────── */

const SidebarCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  border-radius: ${({ theme }) => theme.radii.xl};
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  animation: ${fadeInLeft} 0.45s ease-out 0.08s both;
`;

const AvatarWrapper = styled.div`
  position: relative;
  width: 110px;
  height: 110px;
  cursor: pointer;
  margin-bottom: 1rem;

  &:hover > div:last-child {
    opacity: 1;
  }
`;

const AvatarImage = styled.div<{ $src?: string }>`
  width: 110px;
  height: 110px;
  border-radius: 50%;
  border: 3px solid ${({ theme }) => theme.colors.primary};
  background: ${({ $src, theme }) => $src ? `url(${$src}) center/cover no-repeat` : theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.25rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.dark};
`;

const AvatarOverlay = styled.div`
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
  color: white;
`;

const AvatarHint = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textLight};
`;

const SidebarName = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  margin-bottom: 0.15rem;
`;

const SidebarEmail = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 1rem;
  word-break: break-all;
`;

const Divider = styled.hr`
  width: 100%;
  border: none;
  border-top: 1px solid ${({ theme }) => theme.colors.borderLight};
  margin: 0.75rem 0;
`;

const SubRow = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.5rem;
`;

const SubLabel = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const MemberSince = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textLight};
  margin-top: 1rem;
  display: flex;
  align-items: center;
  gap: 0.35rem;
`;

const HiddenInput = styled.input`
  display: none;
`;

/* ── Main content ───────────────────────────────────── */

const MainColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const SectionCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  border-radius: ${({ theme }) => theme.radii.xl};
  padding: 1.5rem;
  animation: ${fadeInUp} 0.4s ease-out both;

  &:nth-child(1) { animation-delay: 0.1s; }
  &:nth-child(2) { animation-delay: 0.2s; }
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.25rem;

  svg { color: ${({ theme }) => theme.colors.primary}; }
`;

const SectionTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

/* ── Subscription section ───────────────────────────── */

const SubGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

const SubInfoCard = styled.div`
  background: ${({ theme }) => theme.colors.surfaceAlt};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const SubInfoIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.primary}20;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: ${({ theme }) => theme.colors.primary};
`;

const SubInfoContent = styled.div``;

const SubInfoLabel = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
  display: block;
`;

const SubInfoValue = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
`;

/* ── Component ──────────────────────────────────────── */

interface ProfileFormData {
  name: string;
  phone: string;
}

export function ProfilePage() {
  const { user, loadUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileFormData>({
    defaultValues: {
      name: user?.name ?? '',
      phone: user?.phone ?? '',
    },
  });

  const getInitials = (name?: string) => {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0].substring(0, 2).toUpperCase();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setAvatarLoading(true);
      const formData = new FormData();
      formData.append('avatar', file);
      await api.put('/auth/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await loadUser();
      toast.success('Foto atualizada!');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setAvatarLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const onSubmit = async (formData: ProfileFormData) => {
    try {
      setLoading(true);
      await api.put('/auth/profile', formData);
      await loadUser();
      toast.success('Perfil atualizado!');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const sub = user?.subscription;

  return (
    <>
      <PageTitle>Meu <span>perfil</span></PageTitle>

      <PageGrid>
        {/* ── Sidebar ──────────────────────────── */}
        <SidebarCard>
          <AvatarWrapper onClick={() => fileInputRef.current?.click()}>
            <AvatarImage $src={user?.avatarUrl ?? undefined}>
              {!user?.avatarUrl && getInitials(user?.name)}
            </AvatarImage>
            <AvatarOverlay>
              <Camera size={28} />
            </AvatarOverlay>
          </AvatarWrapper>
          <AvatarHint>
            {avatarLoading ? 'Enviando...' : 'Clique para alterar'}
          </AvatarHint>
          <HiddenInput
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleAvatarChange}
          />

          <Divider />

          <SidebarName>{user?.name}</SidebarName>
          <SidebarEmail>{user?.email}</SidebarEmail>

          <SubRow>
            <SubLabel>Assinatura</SubLabel>
            {sub ? (
              <SubscriptionBadge status={sub.status} />
            ) : (
              <span style={{ color: '#999', fontSize: '0.75rem' }}>Sem assinatura</span>
            )}
          </SubRow>

          {user?.createdAt && (
            <MemberSince>
              <CalendarDays size={13} />
              Membro desde {formatDateShort(user.createdAt)}
            </MemberSince>
          )}
        </SidebarCard>

        {/* ── Main column ──────────────────────── */}
        <MainColumn>
          {/* Dados pessoais */}
          <SectionCard>
            <SectionHeader>
              <UserIcon size={20} />
              <SectionTitle>Dados pessoais</SectionTitle>
            </SectionHeader>
            <Form onSubmit={handleSubmit(onSubmit)}>
              <FormRow>
                <Input
                  label="Nome"
                  error={errors.name?.message}
                  {...register('name', { required: 'Nome obrigatório' })}
                />
                <Input
                  label="Telefone"
                  error={errors.phone?.message}
                  {...register('phone')}
                />
              </FormRow>
              <FormRow>
                <Input
                  label="Email"
                  value={user?.email ?? ''}
                  disabled
                />
                <Input
                  label="CPF"
                  value={user?.cpf ?? ''}
                  disabled
                />
              </FormRow>
              <div>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Salvando...' : 'Salvar alterações'}
                </Button>
              </div>
            </Form>
          </SectionCard>

          {/* Assinatura */}
          {sub && (
            <SectionCard>
              <SectionHeader>
                <CreditCard size={20} />
                <SectionTitle>Assinatura</SectionTitle>
              </SectionHeader>
              <SubGrid>
                <SubInfoCard>
                  <SubInfoIcon><Shield size={20} /></SubInfoIcon>
                  <SubInfoContent>
                    <SubInfoLabel>Status</SubInfoLabel>
                    <SubInfoValue>
                      <SubscriptionBadge status={sub.status} />
                    </SubInfoValue>
                  </SubInfoContent>
                </SubInfoCard>

                {sub.currentPeriodEnd && (
                  <SubInfoCard>
                    <SubInfoIcon><CalendarDays size={20} /></SubInfoIcon>
                    <SubInfoContent>
                      <SubInfoLabel>Próxima renovação</SubInfoLabel>
                      <SubInfoValue>{formatDateShort(sub.currentPeriodEnd)}</SubInfoValue>
                    </SubInfoContent>
                  </SubInfoCard>
                )}

                {sub.currentPeriodStart && (
                  <SubInfoCard>
                    <SubInfoIcon><CalendarDays size={20} /></SubInfoIcon>
                    <SubInfoContent>
                      <SubInfoLabel>Início do período</SubInfoLabel>
                      <SubInfoValue>{formatDateShort(sub.currentPeriodStart)}</SubInfoValue>
                    </SubInfoContent>
                  </SubInfoCard>
                )}

                {sub.cancelAtPeriodEnd && (
                  <SubInfoCard>
                    <SubInfoIcon><Mail size={20} /></SubInfoIcon>
                    <SubInfoContent>
                      <SubInfoLabel>Cancelamento</SubInfoLabel>
                      <SubInfoValue style={{ color: '#ef4444' }}>Ao fim do período</SubInfoValue>
                    </SubInfoContent>
                  </SubInfoCard>
                )}
              </SubGrid>

              {sub.status === 'ACTIVE' && !sub.cancelAtPeriodEnd && (
                <div style={{ marginTop: '1.25rem' }}>
                  <Button
                    $variant="outline"
                    $size="sm"
                    onClick={() => setShowCancelModal(true)}
                    style={{ color: '#ef4444', borderColor: '#ef4444' }}
                  >
                    <XCircle size={16} />
                    Cancelar assinatura
                  </Button>
                </div>
              )}
            </SectionCard>
          )}
        </MainColumn>
      </PageGrid>

      {showCancelModal && (
        <CancelSubscriptionModal onClose={() => setShowCancelModal(false)} />
      )}
    </>
  );
}
