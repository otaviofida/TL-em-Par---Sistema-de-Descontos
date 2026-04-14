import styled from 'styled-components';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Card, Button, Loading } from '../../components/ui';
import { StarRating } from '../../components/ui';
import { MapPin, Phone, Instagram, ArrowLeft, CheckCircle, UtensilsCrossed, MessageSquare } from 'lucide-react';
import type { Company, ApiResponse, Review } from '../../types';
import { fadeInUp, fadeIn } from '../../styles/animations';
import { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';

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

// Reviews section
const ReviewsSection = styled.section`
  margin-top: 2rem;
  animation: ${fadeInUp} 0.4s ease-out 0.3s both;
`;

const SectionTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ReviewForm = styled.form`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  border-radius: ${({ theme }) => theme.radii.xl};
  padding: 1.25rem;
  margin-bottom: 1.5rem;
`;

const FormLabel = styled.label`
  display: block;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme.colors.text};
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 80px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: 0.75rem;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-family: inherit;
  background: ${({ theme }) => theme.colors.surfaceAlt};
  color: ${({ theme }) => theme.colors.text};
  resize: vertical;
  margin-top: 0.75rem;

  &::placeholder { color: ${({ theme }) => theme.colors.textLight}; }
  &:focus { outline: none; border-color: ${({ theme }) => theme.colors.primary}; }
`;

const ReviewCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: 1rem;
  margin-bottom: 0.75rem;
`;

const ReviewHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
`;

const Avatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.surfaceAlt};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.textSecondary};

  img { width: 100%; height: 100%; object-fit: cover; }
`;

const ReviewInfo = styled.div`
  flex: 1;
`;

const ReviewName = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  display: block;
`;

const ReviewDate = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textLight};
`;

const ReviewComment = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
`;

const FormError = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.error};
  margin-top: 0.25rem;
  display: block;
`;

const RatingRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0.5rem 0 0.75rem;
`;

export function CompanyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [formError, setFormError] = useState('');

  const { data: company, isLoading } = useQuery({
    queryKey: ['company', id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Company>>(`/companies/${id}`);
      return data.data;
    },
    enabled: !!id,
  });

  const { data: reviews } = useQuery({
    queryKey: ['reviews', id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Review[]>>(`/reviews/company/${id}`, { params: { limit: '50' } });
      return data.data;
    },
    enabled: !!id,
  });

  const createReview = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/reviews', { companyId: id, rating, comment: comment.trim() || undefined });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', id] });
      queryClient.invalidateQueries({ queryKey: ['company', id] });
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      setRating(0);
      setComment('');
      setFormError('');
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.error?.message || 'Erro ao enviar avaliação.');
    },
  });

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setFormError('Selecione uma nota.');
      return;
    }
    setFormError('');
    createReview.mutate();
  };

  // Verificar se o usuário já avaliou
  const userAlreadyReviewed = reviews?.some((r) => r.user.id === user?.id);

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
        {(company.avgRating ?? 0) > 0 && (
          <RatingRow>
            <StarRating value={company.avgRating!} size={14} count={company.reviewCount} showCount />
          </RatingRow>
        )}
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

      {/* Reviews Section */}
      <ReviewsSection>
        <SectionTitle>
          <MessageSquare size={20} /> Avaliações
        </SectionTitle>

        {/* Review Form - só aparece se usou o benefício e ainda não avaliou */}
        {company.alreadyUsed && !userAlreadyReviewed && (
          <ReviewForm onSubmit={handleSubmitReview}>
            <FormLabel>Sua avaliação</FormLabel>
            <StarRating value={rating} onChange={setRating} size={28} />
            <TextArea
              placeholder="Deixe um comentário (opcional)..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={500}
            />
            {formError && <FormError>{formError}</FormError>}
            <div style={{ marginTop: '0.75rem' }}>
              <Button type="submit" disabled={createReview.isPending}>
                {createReview.isPending ? 'Enviando...' : 'Enviar avaliação'}
              </Button>
            </div>
          </ReviewForm>
        )}

        {/* Review List */}
        {reviews && reviews.length > 0 ? (
          reviews.map((review) => (
            <ReviewCard key={review.id}>
              <ReviewHeader>
                <Avatar>
                  {review.user.avatarUrl ? (
                    <img src={review.user.avatarUrl} alt={review.user.name} />
                  ) : (
                    review.user.name.charAt(0).toUpperCase()
                  )}
                </Avatar>
                <ReviewInfo>
                  <ReviewName>{review.user.name}</ReviewName>
                  <StarRating value={review.rating} size={12} />
                </ReviewInfo>
                <ReviewDate>
                  {new Date(review.createdAt).toLocaleDateString('pt-BR')}
                </ReviewDate>
              </ReviewHeader>
              {review.comment && <ReviewComment>{review.comment}</ReviewComment>}
            </ReviewCard>
          ))
        ) : (
          <p style={{ color: '#888', fontSize: '0.875rem' }}>Nenhuma avaliação ainda.</p>
        )}
      </ReviewsSection>
    </>
  );
}
