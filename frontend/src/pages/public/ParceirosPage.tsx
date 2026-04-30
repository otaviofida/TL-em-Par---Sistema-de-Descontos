import styled, { keyframes } from 'styled-components';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { UtensilsCrossed, Search, Tag, MapPin } from 'lucide-react';
import { api } from '../../lib/api';
import { PublicFooter } from '../../components/layout/PublicFooter';
import { COMPANY_CATEGORIES } from '../../constants/categories';
import { fadeInUp, fadeIn } from '../../styles/animations';

interface PublicCompany {
  id: string;
  name: string;
  logoUrl?: string | null;
  coverUrl?: string | null;
  benefitDescription?: string | null;
  category: string;
}

/* ── Hero ───────────────────────────────────────────── */

const HeroOuter = styled.section`
  background: ${({ theme }) => theme.colors.background};
  padding: 4rem 1.5rem 3rem;
`;

const HeroInner = styled.div`
  max-width: 1600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const Badge = styled.span`
  display: inline-flex;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.dark};
  padding: 0.3rem 0.8rem;
  border-radius: ${({ theme }) => theme.radii.full};
  font-size: 0.68rem;
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  letter-spacing: 0.07em;
  text-transform: uppercase;
  width: fit-content;
  animation: ${fadeInUp} 0.5s ease-out both;
`;

const Title = styled.h1`
  font-size: clamp(2rem, 5vw, 3.2rem);
  font-weight: ${({ theme }) => theme.fontWeights.extrabold};
  color: ${({ theme }) => theme.colors.secondary};
  line-height: 1.1;
  animation: ${fadeInUp} 0.5s ease-out 0.1s both;
`;

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.textSecondary};
  max-width: 560px;
  line-height: 1.65;
  animation: ${fadeInUp} 0.5s ease-out 0.15s both;
`;

/* ── Content ────────────────────────────────────────── */

const ContentOuter = styled.div`
  background: ${({ theme }) => theme.colors.background};
  padding: 0 1.5rem 5rem;
`;

const ContentInner = styled.div`
  max-width: 1600px;
  margin: 0 auto;
`;

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: ${({ theme }) => theme.colors.surface};
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: 0.75rem 1rem;
  margin-bottom: 1.25rem;
  transition: border-color 0.2s;

  &:focus-within { border-color: ${({ theme }) => theme.colors.secondary}; }

  input {
    flex: 1;
    border: none;
    outline: none;
    font-family: ${({ theme }) => theme.fonts.body};
    font-size: ${({ theme }) => theme.fontSizes.md};
    background: transparent;
    color: ${({ theme }) => theme.colors.text};
    &::placeholder { color: ${({ theme }) => theme.colors.textLight}; }
  }
`;

const FilterBar = styled.div`
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  margin-bottom: 2.5rem;
  padding-bottom: 0.25rem;
  -webkit-overflow-scrolling: touch;
  &::-webkit-scrollbar { display: none; }
  scrollbar-width: none;
`;

const FilterChip = styled.button<{ $active?: boolean }>`
  padding: 0.4rem 1.1rem;
  border-radius: ${({ theme }) => theme.radii.full};
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  border: 1.5px solid ${({ theme, $active }) => $active ? theme.colors.secondary : theme.colors.border};
  background: ${({ theme, $active }) => $active ? theme.colors.secondary : 'transparent'};
  color: ${({ theme, $active }) => $active ? theme.colors.white : theme.colors.textSecondary};
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  flex-shrink: 0;
  &:hover { border-color: ${({ theme }) => theme.colors.secondary}; }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  animation: ${fadeIn} 0.4s ease-out both;
`;

const CompanyCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.xl};
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  transition: box-shadow 0.25s, transform 0.25s;

  &:hover {
    box-shadow: ${({ theme }) => theme.shadows.lg};
    transform: translateY(-4px);
  }
`;

const CoverWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 170px;
  background: ${({ theme }) => theme.colors.surfaceAlt};
`;

const CoverImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const CoverFallback = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.surfaceAlt} 0%, ${({ theme }) => theme.colors.borderLight} 100%);
`;

const LogoOverlay = styled.div`
  position: absolute;
  bottom: -20px;
  left: 16px;
  width: 48px;
  height: 48px;
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.surface};
  border: 2px solid ${({ theme }) => theme.colors.surface};
  box-shadow: ${({ theme }) => theme.shadows.md};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  z-index: 2;

  img { width: 100%; height: 100%; object-fit: cover; }
`;

const CardBody = styled.div`
  padding: 28px 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const CompanyName = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const BenefitRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: ${({ theme }) => theme.colors.secondary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
`;

const CategoryTag = styled.span`
  display: inline-flex;
  margin-top: 4px;
  background: ${({ theme }) => theme.colors.surfaceAlt};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  padding: 3px 10px;
  border-radius: ${({ theme }) => theme.radii.full};
  text-transform: capitalize;
  width: fit-content;
`;

const EmptyWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 5rem 0;
  color: ${({ theme }) => theme.colors.textLight};
  text-align: center;

  p { font-size: ${({ theme }) => theme.fontSizes.md}; }
`;

const SkeletonCard = styled.div`
  background: ${({ theme }) => theme.colors.surfaceAlt};
  border-radius: ${({ theme }) => theme.radii.xl};
  height: 260px;
  animation: pulse 1.5s ease-in-out infinite;

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;

export function ParceirosPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  const { data, isLoading } = useQuery<PublicCompany[]>({
    queryKey: ['companies-public-full', category],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (category) params.category = category;
      const { data } = await api.get<{ data: PublicCompany[] }>('/companies/public', { params });
      return data.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  const filtered = data?.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  return (
    <>
      <HeroOuter>
        <HeroInner>
          <Badge>Nossos Parceiros</Badge>
          <Title>Conheça quem<br />faz parte do clube</Title>
          <Subtitle>
            Todos os estabelecimentos abaixo oferecem benefícios exclusivos para assinantes do TL em Par.
            Escolha onde quer ir e aproveite!
          </Subtitle>
        </HeroInner>
      </HeroOuter>

      <ContentOuter>
        <ContentInner>
          <SearchBar>
            <Search size={18} color="#999" />
            <input
              placeholder="Buscar parceiro..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </SearchBar>

          <FilterBar>
            <FilterChip $active={!category} onClick={() => setCategory('')}>
              Todos
            </FilterChip>
            {COMPANY_CATEGORIES.map(cat => (
              <FilterChip
                key={cat.value}
                $active={category === cat.value}
                onClick={() => setCategory(category === cat.value ? '' : cat.value)}
              >
                {cat.label}
              </FilterChip>
            ))}
          </FilterBar>

          {isLoading ? (
            <Grid>
              {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
            </Grid>
          ) : !filtered.length ? (
            <EmptyWrap>
              <UtensilsCrossed size={48} />
              <p>Nenhum parceiro encontrado.</p>
            </EmptyWrap>
          ) : (
            <Grid>
              {filtered.map(company => (
                <CompanyCard key={company.id}>
                  <CoverWrapper>
                    {company.coverUrl ? (
                      <CoverImage src={company.coverUrl} alt={company.name} />
                    ) : (
                      <CoverFallback>
                        <UtensilsCrossed size={40} color="#ccc" />
                      </CoverFallback>
                    )}
                    <LogoOverlay>
                      {company.logoUrl ? (
                        <img src={company.logoUrl} alt={company.name} />
                      ) : (
                        <UtensilsCrossed size={20} color="#ccc" />
                      )}
                    </LogoOverlay>
                  </CoverWrapper>
                  <CardBody>
                    <CompanyName>{company.name}</CompanyName>
                    {company.benefitDescription && (
                      <BenefitRow>
                        <Tag size={14} />
                        {company.benefitDescription}
                      </BenefitRow>
                    )}
                    <CategoryTag>{company.category}</CategoryTag>
                  </CardBody>
                </CompanyCard>
              ))}
            </Grid>
          )}
        </ContentInner>
      </ContentOuter>

      <PublicFooter />
    </>
  );
}
