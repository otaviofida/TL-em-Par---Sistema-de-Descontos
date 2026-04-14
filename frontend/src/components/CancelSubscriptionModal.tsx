import { useState } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import { X, Star, AlertTriangle } from 'lucide-react';
import { Button } from './ui';
import { api } from '../lib/api';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../utils/errorMessages';
import { fadeIn, scaleIn } from '../styles/animations';

/* ── Overlay/Modal ──────────────────────────────────── */

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
  animation: ${fadeIn} 0.2s ease-out;
`;

const Modal = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.xl};
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
  animation: ${scaleIn} 0.25s ease-out;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight};
`;

const HeaderTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CloseBtn = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textLight};
  cursor: pointer;
  padding: 4px;
  border-radius: ${({ theme }) => theme.radii.md};
  &:hover { background: ${({ theme }) => theme.colors.surfaceAlt}; }
`;

const Body = styled.div`
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Warning = styled.div`
  background: ${({ theme }) => theme.colors.warningBg};
  border: 1px solid ${({ theme }) => theme.colors.warning}30;
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: 1rem;
  display: flex;
  gap: 0.75rem;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text};
  line-height: 1.5;

  svg { flex-shrink: 0; margin-top: 2px; }
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text};
`;

const Required = styled.span`
  color: ${({ theme }) => theme.colors.error};
`;

const Select = styled.select`
  padding: 0.75rem 1rem;
  border: 1.5px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const StarsRow = styled.div`
  display: flex;
  gap: 6px;
`;

const StarBtn = styled.button<{ $active: boolean }>`
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px;
  color: ${({ $active, theme }) => $active ? theme.colors.primary : theme.colors.border};
  transition: color 0.15s, transform 0.15s;

  &:hover {
    transform: scale(1.15);
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const Textarea = styled.textarea`
  padding: 0.75rem 1rem;
  border: 1.5px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-family: inherit;
  resize: vertical;
  min-height: 80px;
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};

  &::placeholder { color: ${({ theme }) => theme.colors.textLight}; }
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const OptionsRow = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const OptionBtn = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 0.6rem;
  border: 1.5px solid ${({ $active, theme }) => $active ? theme.colors.primary : theme.colors.border};
  background: ${({ $active, theme }) => $active ? `${theme.colors.primary}15` : 'transparent'};
  color: ${({ $active, theme }) => $active ? theme.colors.text : theme.colors.textSecondary};
  font-weight: ${({ $active, theme }) => $active ? theme.fontWeights.semibold : theme.fontWeights.normal};
  border-radius: ${({ theme }) => theme.radii.lg};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const Footer = styled.div`
  padding: 1rem 1.5rem;
  border-top: 1px solid ${({ theme }) => theme.colors.borderLight};
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
`;

/* ── Motivos ────────────────────────────────────────── */

const REASONS = [
  { value: 'preco', label: 'Preço muito alto' },
  { value: 'pouco_uso', label: 'Não estou usando o suficiente' },
  { value: 'poucos_restaurantes', label: 'Poucos restaurantes disponíveis' },
  { value: 'beneficios_fracos', label: 'Benefícios não valem a pena' },
  { value: 'problemas_app', label: 'Problemas com o aplicativo' },
  { value: 'mudei_cidade', label: 'Mudei de cidade' },
  { value: 'financeiro', label: 'Dificuldade financeira' },
  { value: 'outro', label: 'Outro motivo' },
];

/* ── Component ──────────────────────────────────────── */

interface CancelModalProps {
  onClose: () => void;
}

export function CancelSubscriptionModal({ onClose }: CancelModalProps) {
  const { loadUser } = useAuthStore();
  const [reason, setReason] = useState('');
  const [rating, setRating] = useState(0);
  const [improvement, setImprovement] = useState('');
  const [wouldReturn, setWouldReturn] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const isValid = reason !== '' && rating > 0;

  const handleSubmit = async () => {
    if (!isValid) return;
    try {
      setLoading(true);
      await api.post('/subscriptions/cancel', {
        reason,
        rating,
        improvement: improvement || undefined,
        wouldReturn: wouldReturn || undefined,
      });
      await loadUser();
      toast.success('Assinatura cancelada. Você terá acesso até o fim do período.');
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Header>
          <HeaderTitle>
            <AlertTriangle size={20} color="#f59e0b" />
            Cancelar assinatura
          </HeaderTitle>
          <CloseBtn onClick={onClose}><X size={20} /></CloseBtn>
        </Header>

        <Body>
          <Warning>
            <AlertTriangle size={18} color="#f59e0b" />
            <span>
              Ao cancelar, você continuará com acesso até o <strong>fim do período atual</strong>.
              Depois disso, não poderá usar os benefícios dos restaurantes parceiros.
            </span>
          </Warning>

          {/* 1. Motivo */}
          <FieldGroup>
            <Label>Por que está cancelando? <Required>*</Required></Label>
            <Select value={reason} onChange={(e) => setReason(e.target.value)}>
              <option value="">Selecione um motivo...</option>
              {REASONS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </Select>
          </FieldGroup>

          {/* 2. Avaliação */}
          <FieldGroup>
            <Label>Como avalia sua experiência geral? <Required>*</Required></Label>
            <StarsRow>
              {[1, 2, 3, 4, 5].map((n) => (
                <StarBtn key={n} $active={n <= rating} onClick={() => setRating(n)}>
                  <Star size={28} fill={n <= rating ? 'currentColor' : 'none'} />
                </StarBtn>
              ))}
            </StarsRow>
          </FieldGroup>

          {/* 3. Melhoria */}
          <FieldGroup>
            <Label>O que poderíamos melhorar?</Label>
            <Textarea
              placeholder="Conte-nos o que podemos fazer para melhorar..."
              value={improvement}
              onChange={(e) => setImprovement(e.target.value)}
              maxLength={500}
            />
          </FieldGroup>

          {/* 4. Voltaria */}
          <FieldGroup>
            <Label>Voltaria a assinar no futuro?</Label>
            <OptionsRow>
              {[
                { value: 'sim', label: 'Sim' },
                { value: 'talvez', label: 'Talvez' },
                { value: 'nao', label: 'Não' },
              ].map((opt) => (
                <OptionBtn
                  key={opt.value}
                  $active={wouldReturn === opt.value}
                  onClick={() => setWouldReturn(opt.value)}
                >
                  {opt.label}
                </OptionBtn>
              ))}
            </OptionsRow>
          </FieldGroup>
        </Body>

        <Footer>
          <Button $variant="ghost" onClick={onClose} disabled={loading}>
            Voltar
          </Button>
          <Button $variant="danger" onClick={handleSubmit} disabled={!isValid || loading}>
            {loading ? 'Cancelando...' : 'Confirmar cancelamento'}
          </Button>
        </Footer>
      </Modal>
    </Overlay>,
    document.body,
  );
}
