import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui';
import { UtensilsCrossed, QrCode, Star, ArrowRight } from 'lucide-react';
import heroBg from '../../assets/background-hero.jpg';
import { fadeInUp, fadeIn } from '../../styles/animations';

const HeroWrapper = styled.section`
  background: url(${heroBg}) center / cover no-repeat;
  color: ${({ theme }) => theme.colors.white};
  min-height: 75vh;
  display: flex;
  align-items: center;
`;

const Hero = styled.div`
  max-width: 1380px;
  width: 100%;
  margin: 0 auto;
  padding: 4rem 1.5rem;
  text-align: left;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1.5rem;
  animation: ${fadeInUp} 0.6s ease-out both;
`;

const HeroBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(254, 182, 33, 0.15);
  color: ${({ theme }) => theme.colors.primary};
  padding: 0.5rem 1rem;
  border-radius: ${({ theme }) => theme.radii.full};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
`;

const HeroTitle = styled.h1`
  font-size: clamp(2rem, 6vw, 3.5rem);
  font-weight: ${({ theme }) => theme.fontWeights.normal};
  max-width: 700px;
  line-height: 1.1;

  span {
    color: ${({ theme }) => theme.colors.white};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
  }
`;

const HeroSubtitle = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: rgba(255, 255, 255, 0.7);
  max-width: 500px;
`;

const HeroButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
  flex-wrap: wrap;
`;

const Features = styled.section`
  padding: 4rem 1.5rem;
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

export function HomePage() {
  return (
    <>
      <HeroWrapper>
        <Hero>
          <HeroBadge>
            <Star size={14} />
            1ª Edição — Março a Maio 2026
          </HeroBadge>
          <HeroTitle>
            Compre um prato e <span>ganhe outro!</span>
          </HeroTitle>
          <HeroSubtitle>
            O clube de benefícios gastronômicos de Três Lagoas. Dezenas de restaurantes, um só cartão.
          </HeroSubtitle>
          <HeroButtons>
            <Link to="/cadastro">
              <Button $size="lg">
                Quero participar
                <ArrowRight size={18} />
              </Button>
            </Link>
            <Link to="/login">
              <Button $variant="outline" $size="lg">
                Já tenho conta
              </Button>
            </Link>
          </HeroButtons>
        </Hero>
      </HeroWrapper>

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

      <FooterWrapper>
        <Footer>
          <p>© {new Date().getFullYear()} TL EM PAR — Três Lagoas, MS. Todos os direitos reservados.</p>
        </Footer>
      </FooterWrapper>
    </>
  );
}
