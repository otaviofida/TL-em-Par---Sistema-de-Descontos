import styled, { keyframes } from 'styled-components';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../../components/ui';
import { UtensilsCrossed, QrCode, Star, ArrowRight, Compass, Map } from 'lucide-react';
import heroBg from '../../assets/bg-hero.jpg';
import { fadeInUp, fadeIn } from '../../styles/animations';
import { api } from '../../lib/api';

interface PublicCompany { id: string; name: string; logoUrl?: string | null; category: string; }

/* ── Hero ───────────────────────────────────────────── */

const HeroOuter = styled.div`
  padding: 0 1.5rem 2rem;
  background: ${({ theme }) => theme.colors.background};
`;

const HeroWrapper = styled.section`
  background: url(${heroBg}) center / cover no-repeat;
  border-radius: 1.5rem;
  min-height: 82vh;
  display: flex;
  align-items: center;
  overflow: hidden;
  position: relative;
  max-width: 1600px;
  margin: 0 auto;
`;

const HeroInner = styled.div`
  width: 100%;
  padding: 5rem 3rem;
`;

const HeroContent = styled.div`
  max-width: 520px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1.25rem;
  animation: ${fadeInUp} 0.7s ease-out both;
`;

const HeroBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(4px);
  color: ${({ theme }) => theme.colors.white};
  padding: 0.35rem 0.85rem;
  border-radius: ${({ theme }) => theme.radii.full};
  font-size: 0.7rem;
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  letter-spacing: 0.08em;
  text-transform: uppercase;
  border: 1px solid rgba(255, 255, 255, 0.3);
`;

const HeroTitle = styled.h1`
  font-size: clamp(2.4rem, 6vw, 4rem);
  font-weight: ${({ theme }) => theme.fontWeights.extrabold};
  line-height: 1.05;
  color: ${({ theme }) => theme.colors.white};

  .muted {
    color: ${({ theme }) => theme.colors.secondary};
  }
`;

const HeroSubtitle = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: rgba(255, 255, 255, 0.85);
  max-width: 440px;
  line-height: 1.65;
`;

const HeroButtons = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-top: 0.25rem;
`;

const HeroSubscribeBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: ${({ theme }) => theme.colors.secondary};
  color: ${({ theme }) => theme.colors.white};
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  padding: 0.75rem 1.4rem;
  border: none;
  border-radius: 999px;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.2s, transform 0.15s;
  text-decoration: none;

  &:hover {
    background: #a06d48;
    transform: translateY(-2px);
  }
`;

const HeroOutlineBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: ${({ theme }) => theme.colors.primaryLight};
  color: ${({ theme }) => theme.colors.dark};
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  padding: 0.75rem 1.4rem;
  border: none;
  border-radius: 999px;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.2s, transform 0.15s;
  text-decoration: none;

  &:hover {
    background: ${({ theme }) => theme.colors.primary};
    transform: translateY(-2px);
  }
`;

/* ── Vantagens ──────────────────────────────────────── */

const VantagensOuter = styled.section`
  background: ${({ theme }) => theme.colors.background};
  padding: 5rem 1.5rem 0;
`;

const VantagensInner = styled.div`
  max-width: 1600px;
  margin: 0 auto;
`;

const VantagensHeader = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 3rem;
  gap: 2rem;
`;

const VantagensLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const VantagensBadge = styled.span`
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
`;

const VantagensTitle = styled.h2`
  font-size: clamp(1.8rem, 4vw, 2.8rem);
  font-weight: ${({ theme }) => theme.fontWeights.extrabold};
  color: ${({ theme }) => theme.colors.secondary};
  max-width: 380px;
  line-height: 1.15;
`;

const VantagensDesc = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.textSecondary};
  max-width: 260px;
  line-height: 1.6;
  text-align: right;
`;

const VantagensGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  align-items: start;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: 1fr;
  }
`;

const VantagensCard = styled.div<{ $offset?: string }>`
  background: ${({ theme }) => theme.colors.surfaceAlt};
  border-radius: ${({ theme }) => theme.radii.xl};
  padding: 2rem;
  margin-top: ${({ $offset }) => $offset ?? '0'};
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  transition: transform 0.2s;
  &:hover { transform: translateY(-4px); }
`;

const VantagensIcon = styled.div<{ $bg?: string }>`
  width: 44px;
  height: 44px;
  background: ${({ $bg, theme }) => $bg ?? theme.colors.primary};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.dark};
`;

const VantagensCardTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.secondary};
`;

const VantagensCardText = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.65;

  strong { color: ${({ theme }) => theme.colors.text}; font-weight: ${({ theme }) => theme.fontWeights.semibold}; }
`;

/* ── Ticker ─────────────────────────────────────────── */

const tickerScroll = keyframes`
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
`;

const TickerWrapper = styled.div`
  background: ${({ theme }) => theme.colors.primary};
  overflow: hidden;
  padding: 0.85rem 0;
  margin-top: 4rem;
  margin-left: -1.5rem;
  margin-right: -1.5rem;
`;

const TickerTrack = styled.div`
  display: flex;
  gap: 0;
  white-space: nowrap;
  animation: ${tickerScroll} 28s linear infinite;
  will-change: transform;
`;

const TickerChunk = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 2rem;
  padding-right: 2rem;
  flex-shrink: 0;
`;

const TickerItem = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.white};
  text-transform: uppercase;
  letter-spacing: 0.06em;
`;

const TickerDot = styled.span`
  width: 5px;
  height: 5px;
  background: ${({ theme }) => theme.colors.white};
  border-radius: 50%;
  opacity: 0.5;
  flex-shrink: 0;
`;

/* ── Parceiros ──────────────────────────────────────── */

const ParceirosOuter = styled.section`
  background: ${({ theme }) => theme.colors.background};
  padding: 5rem 1.5rem 0;
`;

const ParceirosInner = styled.div`
  max-width: 1600px;
  margin: 0 auto;
`;

const ParceirosHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1rem;
  margin-bottom: 3.5rem;
`;

const ParceirosBadge = styled.span`
  display: inline-flex;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.dark};
  padding: 0.3rem 0.8rem;
  border-radius: ${({ theme }) => theme.radii.full};
  font-size: 0.68rem;
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  letter-spacing: 0.07em;
  text-transform: uppercase;
`;

const ParceirosTitle = styled.h2`
  font-size: clamp(1.8rem, 4vw, 2.8rem);
  font-weight: ${({ theme }) => theme.fontWeights.extrabold};
  color: ${({ theme }) => theme.colors.secondary};
  line-height: 1.15;
`;

const ParceirosDesc = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.textSecondary};
  max-width: 560px;
  line-height: 1.65;
`;

const LogosGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 2rem;
`;

const LogoItem = styled.div`
  width: 110px;
  height: 110px;
  border-radius: 50%;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: grayscale(100%);
    transition: filter 0.3s;
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${({ theme }) => theme.shadows.lg};
    img { filter: grayscale(0%); }
  }
`;

const LogoFallback = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.surfaceAlt};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.secondary};
`;

const LogoSkeleton = styled.div`
  width: 110px;
  height: 110px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.surfaceAlt};
  animation: pulse 1.5s ease-in-out infinite;

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }
`;

/* ── Features ───────────────────────────────────────── */

const Features = styled.section`
  padding: 5rem 1.5rem;
  max-width: 1380px;
  margin: 0 auto;
`;

const FeaturesTitle = styled.h2`
  text-align: center;
  font-size: ${({ theme }) => theme.fontSizes['3xl']};
  margin-bottom: 3rem;
  span { color: ${({ theme }) => theme.colors.primary}; }
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  animation: ${fadeIn} 0.5s ease-out both;
`;

const FeatureCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.xl};
  padding: 2rem;
  text-align: center;
  box-shadow: ${({ theme }) => theme.shadows.md};
  transition: transform 0.2s;
  &:hover { transform: translateY(-4px); }
`;

const FeatureIcon = styled.div`
  width: 56px;
  height: 56px;
  background: ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.radii.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  color: ${({ theme }) => theme.colors.dark};
`;

const FeatureTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  margin-bottom: 0.5rem;
`;

const FeatureText = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.6;
`;

/* ── CTA ────────────────────────────────────────────── */

const CTAWrapper = styled.section`
  background: ${({ theme }) => theme.colors.primary};
  padding: 4rem 1.5rem;
  text-align: center;
`;

const CTA = styled.div`
  max-width: 1380px;
  margin: 0 auto;
`;

const CTATitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes['3xl']};
  color: ${({ theme }) => theme.colors.dark};
  margin-bottom: 0.5rem;
`;

const CTAText = styled.p`
  color: rgba(0, 0, 0, 0.6);
  margin-bottom: 1.5rem;
`;

/* ── Footer ─────────────────────────────────────────── */

const FooterWrapper = styled.footer`
  background: ${({ theme }) => theme.colors.dark};
  color: rgba(255, 255, 255, 0.5);
  padding: 2rem 1.5rem;
  text-align: center;
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const Footer = styled.div`
  max-width: 1380px;
  margin: 0 auto;
`;

/* ── Ticker content ─────────────────────────────────── */

const TICKER_ITEMS = [
  'TL EM PAR', 'Restaurantes', 'Gastronomia', 'Hamburgueria',
  'Três Lagoas', 'Descontos', 'TL EM PAR', 'Restaurantes',
  'Gastronomia', 'Hamburgueria', 'Três Lagoas', 'Descontos',
];

function TickerContent() {
  return (
    <TickerChunk>
      {TICKER_ITEMS.map((item, i) => (
        <>
          <TickerItem key={`item-${i}`}>{item}</TickerItem>
          <TickerDot key={`dot-${i}`} />
        </>
      ))}
    </TickerChunk>
  );
}

/* ── Component ──────────────────────────────────────── */

export function HomePage() {
  const { data: parceiros, isLoading: loadingParceiros } = useQuery<PublicCompany[]>({
    queryKey: ['companies-public'],
    queryFn: async () => {
      const { data } = await api.get<{ data: PublicCompany[] }>('/companies/public');
      return data.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  return (
    <>
      {/* Hero */}
      <HeroOuter>
        <HeroWrapper>
          <HeroInner>
            <HeroContent>
              <HeroBadge>Clube Gastronômico Três Lagoas</HeroBadge>
              <HeroTitle>
                Acabe com a<br />
                <span className="muted">monotonia</span><br />
                gastronômica!
              </HeroTitle>
              <HeroSubtitle>
                Com a sua assinatura mensal, você desbloqueia ofertas exclusivas do tipo
                compre 1 e leve outro em restaurantes parceiros da cidade. Escolha onde
                quer ir, valide pelo celular e aproveite seu benefício de forma simples
                e rápida.
              </HeroSubtitle>
              <HeroButtons>
                <HeroSubscribeBtn as={Link as any} to="/cadastro">
                  Quero assinar agora
                  <ArrowRight size={16} />
                </HeroSubscribeBtn>
                <HeroOutlineBtn as={Link as any} to="/restaurantes">
                  Ver restaurantes parceiros
                </HeroOutlineBtn>
              </HeroButtons>
            </HeroContent>
          </HeroInner>
        </HeroWrapper>
      </HeroOuter>

      {/* Vantagens */}
      <VantagensOuter>
        <VantagensInner>
          <VantagensHeader>
            <VantagensLeft>
              <VantagensBadge>Vantagens</VantagensBadge>
              <VantagensTitle>Por que fazer parte do clube?</VantagensTitle>
            </VantagensLeft>
            <VantagensDesc>
              Experiências curadas para quem ama comer bem e economizar.
            </VantagensDesc>
          </VantagensHeader>

          <VantagensGrid>
            <VantagensCard $offset="0">
              <VantagensIcon>
                <UtensilsCrossed size={20} />
              </VantagensIcon>
              <VantagensCardTitle>Aproveite em dobro</VantagensCardTitle>
              <VantagensCardText>
                Promoções no estilo <strong>compre 1 e leve outro</strong> para tornar
                cada momento ainda melhor.
              </VantagensCardText>
            </VantagensCard>

            <VantagensCard $offset="3rem">
              <VantagensIcon>
                <Compass size={20} />
              </VantagensIcon>
              <VantagensCardTitle>Descubra novos lugares</VantagensCardTitle>
              <VantagensCardText>
                Tenha acesso a experiências gastronômicas com parceiros selecionados.
              </VantagensCardText>
            </VantagensCard>

            <VantagensCard $offset="6rem">
              <VantagensIcon $bg="#d6c5a4">
                <Map size={20} />
              </VantagensIcon>
              <VantagensCardTitle>Tour Gastronômico</VantagensCardTitle>
              <VantagensCardText>
                Roteiros exclusivos para aproveitar o melhor que a cidade oferece em cada bairro.
              </VantagensCardText>
            </VantagensCard>
          </VantagensGrid>
        </VantagensInner>

        {/* Ticker */}
        <TickerWrapper>
          <TickerTrack>
            <TickerContent />
            <TickerContent />
          </TickerTrack>
        </TickerWrapper>
      </VantagensOuter>

      {/* Nossos Parceiros */}
      <ParceirosOuter>
        <ParceirosInner>
          <ParceirosHeader>
            <ParceirosBadge>Variedades</ParceirosBadge>
            <ParceirosTitle>Nossos parceiros</ParceirosTitle>
            <ParceirosDesc>
              A TL em Par reúne estabelecimentos participantes para oferecer benefícios exclusivos aos assinantes.
              Basta escolher o restaurante desejado, conferir a promoção disponível e aproveitar sua visita com mais economia.
            </ParceirosDesc>
          </ParceirosHeader>

          <LogosGrid>
            {loadingParceiros
              ? Array.from({ length: 8 }).map((_, i) => <LogoSkeleton key={i} />)
              : parceiros?.map((company) => (
                  <LogoItem key={company.id}>
                    {company.logoUrl
                      ? <img src={company.logoUrl} alt={company.name} />
                      : <LogoFallback>{company.name.slice(0, 2).toUpperCase()}</LogoFallback>
                    }
                  </LogoItem>
                ))
            }
          </LogosGrid>
        </ParceirosInner>

        <TickerWrapper>
          <TickerTrack>
            <TickerContent />
            <TickerContent />
          </TickerTrack>
        </TickerWrapper>
      </ParceirosOuter>

      {/* Como funciona */}
      <Features>
        <FeaturesTitle>Como <span>funciona?</span></FeaturesTitle>
        <FeaturesGrid>
          <FeatureCard>
            <FeatureIcon><Star size={24} /></FeatureIcon>
            <FeatureTitle>Assine o clube</FeatureTitle>
            <FeatureText>
              Faça sua assinatura online e tenha acesso a todos os restaurantes parceiros.
            </FeatureText>
          </FeatureCard>
          <FeatureCard>
            <FeatureIcon><UtensilsCrossed size={24} /></FeatureIcon>
            <FeatureTitle>Escolha o restaurante</FeatureTitle>
            <FeatureText>
              Veja a lista de estabelecimentos participantes e escolha onde quer comer.
            </FeatureText>
          </FeatureCard>
          <FeatureCard>
            <FeatureIcon><QrCode size={24} /></FeatureIcon>
            <FeatureTitle>Escaneie o QR Code</FeatureTitle>
            <FeatureText>
              No restaurante, escaneie o QR Code para validar seu benefício. Simples assim!
            </FeatureText>
          </FeatureCard>
        </FeaturesGrid>
      </Features>

      {/* CTA */}
      <CTAWrapper>
        <CTA>
          <CTATitle>Pronto para economizar?</CTATitle>
          <CTAText>Dezenas de restaurantes parceiros te esperando.</CTAText>
          <Link to="/cadastro">
            <Button $variant="secondary" $size="lg">
              Criar minha conta
              <ArrowRight size={18} />
            </Button>
          </Link>
        </CTA>
      </CTAWrapper>

      {/* Footer */}
      <FooterWrapper>
        <Footer>
          <p>© {new Date().getFullYear()} TL EM PAR — Três Lagoas, MS. Todos os direitos reservados.</p>
        </Footer>
      </FooterWrapper>
    </>
  );
}
