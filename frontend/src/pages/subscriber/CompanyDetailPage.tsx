import styled from 'styled-components';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Card, Button, Loading } from '../../components/ui';
import { MapPin, Phone, Instagram, ArrowLeft, CheckCircle, UtensilsCrossed } from 'lucide-react';
import type { Company, ApiResponse } from '../../types';
import { fadeInUp, fadeIn } from '../../styles/animations';

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 1.5rem;
  &:hover { color: ${({ theme }) => theme.colors.text}; }
`;

const Cover = styled.div`
  height: 200px;
  background: ${({ theme }) => theme.colors.surfaceAlt};
  border-radius: ${({ theme }) => theme.radii.xl};
  margin-bottom: -40px;
  overflow: hidden;
  animation: ${fadeIn} 0.5s ease-out both;

  img { width: 100%; height: 100%; object-fit: cover; }
`;

const LogoWrapper = styled.div`
  width: 80px;
  height: 80px;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.xl};
  border: 4px solid ${({ theme }) => theme.colors.surface};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  margin-left: 1.5rem;
  position: relative;
  z-index: 1;
  box-shadow: ${({ theme }) => theme.shadows.md};

  img { width: 100%; height: 100%; object-fit: cover; }
`;

const Header = styled.div`
  padding: 1rem 0 1.5rem;
  animation: ${fadeInUp} 0.4s ease-out 0.15s both;
`;

const Name = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  margin-bottom: 0.25rem;
`;

const Description = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  margin-bottom: 0.75rem;
`;

const MetaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const MetaItem = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
`;

const MetaLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-decoration: none;
  transition: color 0.2s;

  &:hover, &:active {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const BenefitCard = styled(Card)`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary} 0%, ${({ theme }) => theme.colors.primaryDark} 100%);
  color: ${({ theme }) => theme.colors.dark};
  margin-top: 1.5rem;
`;

const BenefitLabel = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  opacity: 0.7;
`;

const BenefitText = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  margin: 0.5rem 0;
`;

const BenefitRules = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  opacity: 0.8;
`;

const UsedMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  padding: 0.75rem;
  background: rgba(0, 0, 0, 0.1);
  border-radius: ${({ theme }) => theme.radii.lg};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
`;

export function CompanyDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: company, isLoading } = useQuery({
    queryKey: ['company', id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Company>>(`/companies/${id}`);
      return data.data;
    },
    enabled: !!id,
  });

  if (isLoading) return <Loading />;
  if (!company) return null;

  return (
    <>
      <BackLink to="/empresas">
        <ArrowLeft size={16} /> Voltar
      </BackLink>

      {company.coverUrl ? (
        <Cover><img src={company.coverUrl} alt="" /></Cover>
      ) : (
        <Cover />
      )}

      <LogoWrapper>
        {company.logoUrl ? (
          <img src={company.logoUrl} alt={company.name} />
        ) : (
          <UtensilsCrossed size={32} color="#ccc" />
        )}
      </LogoWrapper>

      <Header>
        <Name>{company.name}</Name>
        {company.description && <Description>{company.description}</Description>}
        <MetaRow>
          {company.address && (
            <MetaItem><MapPin size={14} /> {company.address}{company.city ? `, ${company.city}` : ''}</MetaItem>
          )}
          {company.phone && (
            <MetaLink href={`tel:${company.phone.replace(/\D/g, '')}`}><Phone size={14} /> {company.phone}</MetaLink>
          )}
          {company.instagram && (
            <MetaLink href={`https://instagram.com/${company.instagram.replace(/^@/, '')}`} target="_blank" rel="noopener noreferrer"><Instagram size={14} /> {company.instagram}</MetaLink>
          )}
        </MetaRow>
      </Header>

      <BenefitCard>
        <BenefitLabel>Seu benefício</BenefitLabel>
        <BenefitText>{company.benefitDescription ?? 'Compre 1 e ganhe outro!'}</BenefitText>
        {company.benefitRules && <BenefitRules>{company.benefitRules}</BenefitRules>}
        {company.alreadyUsed && (
          <UsedMessage>
            <CheckCircle size={18} />
            Você já utilizou este benefício nesta edição.
          </UsedMessage>
        )}
      </BenefitCard>

      {!company.alreadyUsed && (
        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <Link to="/validar">
            <Button $size="lg" $fullWidth>
              Validar benefício via QR Code
            </Button>
          </Link>
        </div>
      )}
    </>
  );
}
