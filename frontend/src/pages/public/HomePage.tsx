import styled, { keyframes } from 'styled-components';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../../components/ui';
import { UtensilsCrossed, ArrowRight, Compass, Map, Play, X, Facebook, Instagram } from 'lucide-react';
import bgFooter from '../../assets/bg-footer.jpg';
import imgFooterEsquerda from '../../assets/img-footer-esquerda.png';
import imgFooterDireita from '../../assets/img-footer-direita.png';
import heroBg from '../../assets/bg-hero.jpg';
import bgComoFunciona from '../../assets/bg-comofunciona.jpg';
import imgPersonagem from '../../assets/img-personagem.png';
import imgStep1 from '../../assets/step-1.png';
import ctaLeft from '../../assets/cta-img-esquerda.png';
import ctaRight from '../../assets/cta-imagem-direita.png';
import gallery1 from '../../assets/galerry-1.jpg';
import gallery2 from '../../assets/galerry-2.jpg';
import gallery3 from '../../assets/galerry-3.jpg';
import gallery4 from '../../assets/galerry-4.jpg';
import gallery5 from '../../assets/galerry-5.jpg';
import gallery6 from '../../assets/galerry-6.jpg';
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

const TickerWrapper = styled.div<{ $noMargin?: boolean }>`
  background: ${({ theme }) => theme.colors.primary};
  overflow: hidden;
  padding: 0.85rem 0;
  margin-top: ${({ $noMargin }) => $noMargin ? '0' : '4rem'};
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

const ParceirosCTA = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 2.5rem;
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

/* ── Como Funciona ──────────────────────────────────── */

const ComoFuncionaOuter = styled.section`
  background: ${({ theme }) => theme.colors.background};
  padding: 5rem 1.5rem 4rem;
`;

const ComoFuncionaInner = styled.div`
  max-width: 1600px;
  margin: 0 auto;
`;

const ComoFuncionaCard = styled.div`
  background: url(${bgComoFunciona}) center / cover no-repeat;
  border-radius: 1.5rem;
  padding: 3.5rem 3rem;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  position: relative;
  overflow: visible;
  min-height: 260px;
`;

const ComoFuncionaLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  z-index: 1;
`;

const ComoFuncionaTitle = styled.h2`
  font-size: clamp(2.2rem, 5vw, 3.5rem);
  font-weight: ${({ theme }) => theme.fontWeights.extrabold};
  color: ${({ theme }) => theme.colors.white};
  line-height: 1.1;
`;

const VideoBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  background: ${({ theme }) => theme.colors.secondary};
  color: ${({ theme }) => theme.colors.white};
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 999px;
  cursor: pointer;
  width: fit-content;
  transition: background 0.2s, transform 0.15s;
  &:hover { background: #a06d48; transform: translateY(-2px); }
`;

const PersonagemWrap = styled.div`
  position: absolute;
  right: 3rem;
  bottom: 0;
  height: 130%;
  display: flex;
  align-items: flex-end;

  img {
    height: 100%;
    width: auto;
    object-fit: contain;
    display: block;
  }
`;

/* Steps */

const StepsContainer = styled.div`
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const StepRow = styled.div<{ $reverse?: boolean }>`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  align-items: stretch;
  direction: ${({ $reverse }) => $reverse ? 'rtl' : 'ltr'};

  & > * { direction: ltr; }

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: 1fr;
    direction: ltr;
  }
`;

const StepImageWrap = styled.div`
  border-radius: 1.25rem;
  overflow: hidden;
  min-height: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

const StepContent = styled.div`
  background: ${({ theme }) => theme.colors.surfaceAlt};
  border-radius: 1.25rem;
  padding: 2rem 2.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
`;

const StepNumber = styled.span`
  display: inline-flex;
  width: 40px;
  height: 40px;
  background: ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  align-items: center;
  justify-content: center;
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.extrabold};
  color: ${({ theme }) => theme.colors.dark};
`;

const StepTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  font-weight: ${({ theme }) => theme.fontWeights.extrabold};
  color: ${({ theme }) => theme.colors.secondary};
`;

const StepText = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.7;
`;

/* ── Galeria ─────────────────────────────────────────── */

const GaleriaOuter = styled.section`
  background: ${({ theme }) => theme.colors.background};
  padding: 5rem 1.5rem 5rem;
`;

const GaleriaInner = styled.div`
  max-width: 1600px;
  margin: 0 auto;
`;

const GaleriaHeader = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 2rem;
  gap: 1rem;
`;

const GaleriaLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

const GaleriaTitle = styled.h2`
  font-size: clamp(1.6rem, 3.5vw, 2.4rem);
  font-weight: ${({ theme }) => theme.fontWeights.extrabold};
  color: ${({ theme }) => theme.colors.secondary};
`;

const GaleriaSubtitle = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const GaleriaFeedLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.secondary};
  text-decoration: none;
  white-space: nowrap;
  transition: opacity 0.2s;
  &:hover { opacity: 0.7; }
`;

const BentoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: 220px 220px;
  gap: 0.5rem;
  border-radius: 1.25rem;
  overflow: hidden;
`;

const BentoImg = styled.div<{ $span?: boolean }>`
  grid-row: ${({ $span }) => $span ? 'span 2' : 'span 1'};
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.4s ease;
  }

  &:hover img { transform: scale(1.04); }
`;

/* Video modal */

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: ${fadeIn} 0.2s ease both;
`;

const ModalBox = styled.div`
  background: ${({ theme }) => theme.colors.dark};
  border-radius: 1rem;
  width: 90%;
  max-width: 840px;
  aspect-ratio: 16/9;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalClose = styled.button`
  position: absolute;
  top: -2.5rem;
  right: 0;
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  opacity: 0.7;
  &:hover { opacity: 1; }
`;

const ModalPlaceholder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: rgba(255,255,255,0.4);
  font-size: ${({ theme }) => theme.fontSizes.md};
`;

/* ── CTA Banner ─────────────────────────────────────── */

const CTABanner = styled.section`
  background: ${({ theme }) => theme.colors.surfaceAlt};
  position: relative;
  overflow: hidden;
  display: grid;
  grid-template-columns: 360px 1fr 300px;
  align-items: center;
  min-height: 420px;
`;

const CTAImageLeft = styled.div`
  align-self: flex-end;
  img {
    display: block;
    width: 100%;
    height: auto;
    object-fit: contain;
  }
`;

const CTACenter = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1rem;
  padding: 3rem 2rem;
`;

const CTABannerTitle = styled.h2`
  font-size: clamp(1.8rem, 4vw, 2.8rem);
  font-weight: ${({ theme }) => theme.fontWeights.extrabold};
  color: ${({ theme }) => theme.colors.secondary};
  line-height: 1.15;
  max-width: 535px;
`;

const CTABannerText = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.textSecondary};
  max-width: 535px;
`;

const CTASubscribeBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  padding: 0.9rem 2rem;
  border: none;
  border-radius: 999px;
  cursor: pointer;
  transition: background 0.2s, transform 0.15s;
  text-decoration: none;
  &:hover { background: ${({ theme }) => theme.colors.primaryDark}; transform: translateY(-2px); }
`;

const CTAImageRight = styled.div`
  align-self: flex-end;
  img {
    display: block;
    width: 100%;
    height: auto;
    object-fit: contain;
  }
`;

/* ── FAQ ─────────────────────────────────────────────── */

const FAQOuter = styled.section`
  background: ${({ theme }) => theme.colors.background};
  padding: 5rem 1.5rem;
`;

const FAQInner = styled.div`
  max-width: 1600px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1.6fr;
  gap: 5rem;
  align-items: flex-start;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: 1fr;
    gap: 2.5rem;
  }
`;

const FAQLeft = styled.div`
  position: sticky;
  top: 2rem;
`;

const FAQTitle = styled.h2`
  font-size: clamp(1.8rem, 3.5vw, 2.6rem);
  font-weight: ${({ theme }) => theme.fontWeights.extrabold};
  color: ${({ theme }) => theme.colors.secondary};
  margin-bottom: 1rem;
  line-height: 1.15;
`;

const FAQSubtitle = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.65;
  max-width: 320px;
`;

const FAQList = styled.div`
  display: flex;
  flex-direction: column;
`;

const FAQItem = styled.div<{ $open: boolean }>`
  border-bottom: 2px solid ${({ $open, theme }) => $open ? theme.colors.primary : theme.colors.border};
  transition: border-color 0.2s;
`;

const FAQQuestion = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 0;
  background: none;
  border: none;
  cursor: pointer;
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text};
  text-align: left;
  gap: 1rem;
  transition: color 0.2s;
  &:hover { color: ${({ theme }) => theme.colors.secondary}; }
`;

const FAQChevron = styled.span<{ $open: boolean }>`
  flex-shrink: 0;
  display: inline-flex;
  color: ${({ theme }) => theme.colors.primary};
  transform: ${({ $open }) => $open ? 'rotate(180deg)' : 'rotate(0deg)'};
  transition: transform 0.25s ease;
`;

const FAQAnswer = styled.div<{ $open: boolean }>`
  overflow: hidden;
  max-height: ${({ $open }) => $open ? '400px' : '0'};
  transition: max-height 0.3s ease;

  p {
    padding-bottom: 1.25rem;
    font-size: ${({ theme }) => theme.fontSizes.sm};
    color: ${({ theme }) => theme.colors.textSecondary};
    line-height: 1.7;
  }
`;

/* ── Footer ─────────────────────────────────────────── */

const FooterWrapper = styled.footer`
  background: url(${bgFooter}) center / cover no-repeat;
  background-color: #1a1208;
  position: relative;
  overflow: hidden;
`;

const FooterMain = styled.div`
  display: grid;
  grid-template-columns: 280px 1fr 1fr 1fr 160px;
  align-items: flex-end;
  max-width: 1600px;
  margin: 0 auto;
  padding: 0 1.5rem;
  min-height: 220px;
`;

const FooterImgLeft = styled.div`
  align-self: flex-end;
  img { display: block; width: 100%; height: auto; }
`;

const FooterCol = styled.div`
  padding: 2.5rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  align-self: flex-start;
`;

const FooterColTitle = styled.h4`
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.white};
  margin-bottom: 0.25rem;
`;

const FooterLink = styled(Link)`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: rgba(255,255,255,0.6);
  text-decoration: none;
  transition: color 0.2s;
  &:hover { color: ${({ theme }) => theme.colors.primary}; }
`;

const FooterExternalLink = styled.a`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: rgba(255,255,255,0.6);
  text-decoration: none;
  transition: color 0.2s;
  &:hover { color: ${({ theme }) => theme.colors.primary}; }
`;

const SocialIcons = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 0.25rem;
`;

const SocialIcon = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255,255,255,0.1);
  color: ${({ theme }) => theme.colors.white};
  transition: background 0.2s;
  &:hover { background: ${({ theme }) => theme.colors.primary}; color: ${({ theme }) => theme.colors.dark}; }
`;

const FooterImgRight = styled.div`
  align-self: flex-end;
  img { display: block; width: 100%; height: auto; }
`;

const FooterBottom = styled.div`
  background: ${({ theme }) => theme.colors.primary};
  padding: 0.85rem 1.5rem;
`;

const FooterBottomInner = styled.div`
  max-width: 1600px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
`;

const FooterBottomText = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.white};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
`;

const FooterBottomRight = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.white};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
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
  const [videoOpen, setVideoOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(0);

  const FAQ_ITEMS = [
    {
      q: 'Como funciona a assinatura?',
      a: 'A assinatura é mensal e dá acesso a todos os restaurantes parceiros da TL em Par. Após o pagamento, seu benefício é ativado imediatamente e você pode começar a usar as promoções do tipo compre 1 e leve outro.',
    },
    {
      q: 'Posso usar mais de uma vez no mesmo restaurante?',
      a: 'Cada benefício pode ser utilizado uma vez por período de vigência em cada restaurante parceiro. Você pode visitar o mesmo restaurante novamente no mês seguinte para aproveitar o desconto de novo.',
    },
    {
      q: 'Como valido o desconto?',
      a: 'No restaurante, o atendente exibe um QR Code. Você escaneia pelo app TL em Par, o benefício é validado na hora e você já pode aproveitar a promoção. Todo o processo leva menos de 30 segundos.',
    },
    {
      q: 'Quais cidades participam?',
      a: 'Por enquanto a TL em Par opera em Três Lagoas, MS, com dezenas de restaurantes parceiros espalhados pela cidade. Estamos expandindo — fique de olho nas novidades!',
    },
    {
      q: 'Posso cancelar quando quiser?',
      a: 'Sim. Você pode cancelar a assinatura a qualquer momento pela plataforma, em Meu Perfil. O acesso continua ativo até o fim do período já pago.',
    },
    {
      q: 'O desconto vale para quantas pessoas?',
      a: 'O benefício compre 1 e leve outro é válido por mesa ou pedido, conforme a política de cada restaurante parceiro. Consulte as regras do estabelecimento antes de ir.',
    },
  ];

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

          <ParceirosCTA>
            <Link to="/parceiros">
              <Button $variant="outline" $size="lg">
                Ver todos os parceiros
                <ArrowRight size={18} />
              </Button>
            </Link>
          </ParceirosCTA>
        </ParceirosInner>

        <TickerWrapper>
          <TickerTrack>
            <TickerContent />
            <TickerContent />
          </TickerTrack>
        </TickerWrapper>
      </ParceirosOuter>

      {/* Como funciona */}
      <ComoFuncionaOuter>
        <ComoFuncionaInner>
          <ComoFuncionaCard>
            <ComoFuncionaLeft>
              <ComoFuncionaTitle>Como<br />funciona?</ComoFuncionaTitle>
              <VideoBtn onClick={() => setVideoOpen(true)}>
                <Play size={16} />
                Assistir video
                <ArrowRight size={15} />
              </VideoBtn>
            </ComoFuncionaLeft>
            <PersonagemWrap>
              <img src={imgPersonagem} alt="Personagem TL em Par" />
            </PersonagemWrap>
          </ComoFuncionaCard>

          <StepsContainer>
            <StepRow>
              <StepImageWrap>
                <img src={imgStep1} alt="Passo 1 — Cadastro" />
              </StepImageWrap>
              <StepContent>
                <StepNumber>1</StepNumber>
                <StepTitle>Faça seu cadastro</StepTitle>
                <StepText>
                  Acesse a plataforma da TL em Par, preencha seus dados e crie sua conta de forma
                  rápida e simples. Esse é o primeiro passo para liberar o acesso às ofertas e
                  começar a aproveitar os benefícios disponíveis.
                </StepText>
              </StepContent>
            </StepRow>

            <StepRow $reverse>
              <StepImageWrap>
                <img src={imgStep1} alt="Passo 2 — Assinatura" />
              </StepImageWrap>
              <StepContent>
                <StepNumber>2</StepNumber>
                <StepTitle>Escolha sua assinatura</StepTitle>
                <StepText>
                  Após o cadastro, o usuário realiza a assinatura mensal da plataforma. Com a
                  assinatura ativa, ele passa a ter acesso aos descontos exclusivos oferecidos
                  pelos restaurantes parceiros participantes.
                </StepText>
              </StepContent>
            </StepRow>

            <StepRow>
              <StepImageWrap>
                <img src={imgStep1} alt="Passo 3 — Explorar" />
              </StepImageWrap>
              <StepContent>
                <StepNumber>3</StepNumber>
                <StepTitle>Explore os restaurantes participantes</StepTitle>
                <StepText>
                  Dentro da plataforma, o assinante pode visualizar quais restaurantes fazem
                  parte da TL em Par, conferir as promoções disponíveis e escolher em qual
                  local deseja utilizar o benefício.
                </StepText>
              </StepContent>
            </StepRow>

            <StepRow $reverse>
              <StepImageWrap>
                <img src={imgStep1} alt="Passo 4 — Ir ao restaurante" />
              </StepImageWrap>
              <StepContent>
                <StepNumber>4</StepNumber>
                <StepTitle>Vá até o restaurante escolhido</StepTitle>
                <StepText>
                  Depois de selecionar a opção desejada, basta ir presencialmente até o
                  estabelecimento participante. O benefício é válido diretamente no local,
                  tornando o processo simples, rápido e seguro.
                </StepText>
              </StepContent>
            </StepRow>

            <StepRow>
              <StepImageWrap>
                <img src={imgStep1} alt="Passo 5 — Validar desconto" />
              </StepImageWrap>
              <StepContent>
                <StepNumber>5</StepNumber>
                <StepTitle>Valide o desconto e aproveite a promoção</StepTitle>
                <StepText>
                  Após a leitura do QR Code, o benefício é validado na hora e o cliente pode
                  utilizar a promoção disponível, como por exemplo compre 1 e leve outro. Assim,
                  a experiência fica prática para o assinante e organizada para o restaurante parceiro.
                </StepText>
              </StepContent>
            </StepRow>
          </StepsContainer>
        </ComoFuncionaInner>
      </ComoFuncionaOuter>

      {/* Modal de vídeo */}
      {videoOpen && (
        <ModalOverlay onClick={() => setVideoOpen(false)}>
          <ModalBox onClick={e => e.stopPropagation()}>
            <ModalClose onClick={() => setVideoOpen(false)}>
              <X size={28} />
            </ModalClose>
            <ModalPlaceholder>
              <Play size={48} />
              <span>Vídeo em breve</span>
            </ModalPlaceholder>
          </ModalBox>
        </ModalOverlay>
      )}

      {/* Galeria Instagram */}
      <GaleriaOuter>
        <GaleriaInner>
          <GaleriaHeader>
            <GaleriaLeft>
              <GaleriaTitle>No radar da galera</GaleriaTitle>
              <GaleriaSubtitle>Siga @tl.em.par e veja o que está rolando.</GaleriaSubtitle>
            </GaleriaLeft>
            <GaleriaFeedLink href="https://www.instagram.com/tl.em.par/" target="_blank" rel="noopener noreferrer">
              Ver todo o feed
              <ArrowRight size={15} />
            </GaleriaFeedLink>
          </GaleriaHeader>

          <BentoGrid>
            <BentoImg $span><img src={gallery1} alt="Galeria 1" /></BentoImg>
            <BentoImg><img src={gallery2} alt="Galeria 2" /></BentoImg>
            <BentoImg $span><img src={gallery4} alt="Galeria 4" /></BentoImg>
            <BentoImg><img src={gallery5} alt="Galeria 5" /></BentoImg>
            <BentoImg><img src={gallery3} alt="Galeria 3" /></BentoImg>
            <BentoImg><img src={gallery6} alt="Galeria 6" /></BentoImg>
          </BentoGrid>
        </GaleriaInner>
      </GaleriaOuter>

      {/* CTA Banner */}
      <CTABanner>
        <CTAImageLeft>
          <img src={ctaLeft} alt="Personagem esquerda" />
        </CTAImageLeft>
        <CTACenter>
          <CTABannerTitle>Pronto para aproveitar descontos em dobro?</CTABannerTitle>
          <CTABannerText>Cadastre-se, assine e comece a usar seus benefícios hoje mesmo.</CTABannerText>
          <CTASubscribeBtn as={Link as any} to="/cadastro">
            Quero assinar agora
            <ArrowRight size={16} />
          </CTASubscribeBtn>
        </CTACenter>
        <CTAImageRight>
          <img src={ctaRight} alt="Personagem direita" />
        </CTAImageRight>
      </CTABanner>
      <TickerWrapper $noMargin>
        <TickerTrack>
          <TickerContent />
          <TickerContent />
        </TickerTrack>
      </TickerWrapper>

      {/* FAQ */}
      <FAQOuter>
        <FAQInner>
          <FAQLeft>
            <FAQTitle>Perguntas Frequentes</FAQTitle>
            <FAQSubtitle>
              Tire suas dúvidas sobre como funciona o clube, como usar os benefícios e muito mais.
            </FAQSubtitle>
          </FAQLeft>
          <FAQList>
            {FAQ_ITEMS.map((item, i) => (
              <FAQItem key={i} $open={faqOpen === i}>
                <FAQQuestion onClick={() => setFaqOpen(faqOpen === i ? null : i)}>
                  {item.q}
                  <FAQChevron $open={faqOpen === i}>
                    <ArrowRight size={18} style={{ transform: 'rotate(90deg)' }} />
                  </FAQChevron>
                </FAQQuestion>
                <FAQAnswer $open={faqOpen === i}>
                  <p>{item.a}</p>
                </FAQAnswer>
              </FAQItem>
            ))}
          </FAQList>
        </FAQInner>
      </FAQOuter>

      {/* Footer */}
      <FooterWrapper>
        <FooterMain>
          <FooterImgLeft>
            <img src={imgFooterEsquerda} alt="Personagem footer esquerda" />
          </FooterImgLeft>

          <FooterCol>
            <FooterColTitle>Institucional</FooterColTitle>
            <FooterLink to="/">Home</FooterLink>
            <FooterLink to="/sobre">Sobre nós</FooterLink>
            <FooterLink to="/restaurantes">Restaurantes Parceiros</FooterLink>
            <FooterLink to="/contato">Contato</FooterLink>
          </FooterCol>

          <FooterCol>
            <FooterColTitle>Políticas</FooterColTitle>
            <FooterExternalLink href="#">Termos de Uso</FooterExternalLink>
            <FooterExternalLink href="#">Política de Privacidade</FooterExternalLink>
            <FooterExternalLink href="#">Formas de Pagamento</FooterExternalLink>
          </FooterCol>

          <FooterCol>
            <FooterColTitle>Redes sociais</FooterColTitle>
            <SocialIcons>
              <SocialIcon href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </SocialIcon>
              <SocialIcon href="https://instagram.com/tl.em.par" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>
              </SocialIcon>
              <SocialIcon href="https://tiktok.com/@tlempar" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.95a8.16 8.16 0 0 0 4.77 1.52V7.02a4.85 4.85 0 0 1-1-.33z"/></svg>
              </SocialIcon>
            </SocialIcons>
          </FooterCol>

          <FooterImgRight>
            <img src={imgFooterDireita} alt="Personagem footer direita" />
          </FooterImgRight>
        </FooterMain>

        <FooterBottom>
          <FooterBottomInner>
            <FooterBottomText>TL em Par | Todos os direitos reservados © {new Date().getFullYear()}</FooterBottomText>
            <FooterBottomRight>
              Desenvolvido por
              <a href="https://balzia.com.br" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="70" height="25" viewBox="0 0 70 25" fill="none"><path d="M25.6171 17.2636C26.5319 17.4318 27.2113 17.5172 27.6355 17.5172C28.5316 17.5172 29.2669 17.2479 29.82 16.7158C30.3731 16.1863 30.6536 15.4795 30.6536 14.6163C30.6536 13.8884 30.4302 13.2867 29.9902 12.8282C29.5487 12.3684 28.9212 12.103 28.1261 12.036L28.0822 12.032V11.81L28.1234 11.8047C28.7603 11.7193 29.2682 11.475 29.6352 11.0782C29.9995 10.6828 30.1856 10.1717 30.1856 9.55813C30.1856 8.8605 29.9543 8.29293 29.4995 7.87383C29.0422 7.45341 28.4359 7.23926 27.7006 7.23926H21.9209V17.3135H22.0166C22.5072 17.1112 23.0949 17.0087 23.761 17.0087C24.0735 17.0087 24.6984 17.0941 25.6185 17.2636H25.6171ZM24.3102 8.8224H26.4721C26.9095 8.8224 27.2592 8.93013 27.5131 9.14034C27.7697 9.35449 27.8987 9.64878 27.8987 10.0153C27.8987 10.3819 27.7697 10.6604 27.5131 10.8811C27.2605 11.0979 26.9148 11.2083 26.488 11.2083H24.3115V8.8224H24.3102ZM24.2929 12.706H26.629C27.1222 12.706 27.5211 12.8229 27.8163 13.0555C28.1154 13.2907 28.267 13.6112 28.267 14.0093C28.267 14.4297 28.1154 14.7753 27.8176 15.0393C27.5224 15.3008 27.1063 15.4335 26.5824 15.4335C26.258 15.4335 25.8232 15.3928 25.2874 15.3113C24.7476 15.243 24.4285 15.2075 24.3394 15.2075H24.2915V12.706H24.2929Z" fill="white"/><path d="M43.1955 7.53125H41.0283V17.3139H43.1955V7.53125Z" fill="white"/><path d="M54.2432 9.65234H52.064V17.3132H54.2432V9.65234Z" fill="white"/><path d="M53.1221 7.23926C52.2791 7.23926 51.8696 7.54538 51.8696 8.17732C51.8696 8.80926 52.2791 9.11538 53.1221 9.11538C53.9651 9.11538 54.3626 8.80926 54.3626 8.17732C54.3626 7.54538 53.9571 7.23926 53.1221 7.23926Z" fill="white"/><path d="M32.1932 17.0992C32.7636 17.3725 33.423 17.517 34.0998 17.517C34.621 17.517 36.4359 17.4027 37.8944 15.9325L37.925 15.901L38.171 16.1191L38.1351 16.1769C38.0008 16.3937 37.9383 16.4922 37.9383 16.9429V17.3134H40.3103V13.4389C40.3103 10.8297 38.869 9.4962 36.025 9.4778C33.9908 9.46204 31.9246 10.1531 31.6148 10.2608L31.9339 11.9793C32.2716 11.8729 34.2234 11.2817 35.7963 11.2817C37.0461 11.2817 37.7628 11.6469 37.925 12.3669L37.9396 12.4339L37.8745 12.4299C37.4397 12.401 37.0422 12.3866 36.6619 12.3866C31.9286 12.3866 31.1787 14.3074 31.0617 14.896C30.8862 15.7815 31.3608 16.709 32.1918 17.1005L32.1932 17.0992ZM33.5666 14.691C33.9908 14.0249 35.2073 13.7661 37.9037 13.7661H37.9516V13.8173C37.9516 15.1311 36.0623 15.7434 34.7858 15.7434C34.4907 15.7434 34.2194 15.7131 34.0041 15.654C33.7315 15.5752 33.56 15.4412 33.4922 15.2546C33.3938 14.9813 33.56 14.7028 33.5666 14.691Z" fill="white"/><path d="M55.8704 17.0993C56.4408 17.3725 57.1003 17.517 57.777 17.517C58.2982 17.517 60.1131 17.4027 61.5717 15.9326L61.6022 15.9011L61.8482 16.1192L61.8123 16.177C61.678 16.3937 61.6155 16.4923 61.6155 16.9429V17.3134H63.9875V13.439C63.9875 10.8298 62.5462 9.49624 59.7023 9.47785C57.6707 9.46077 55.6018 10.1531 55.292 10.2609L55.6111 11.9793C55.9488 11.8729 57.9007 11.2817 59.4736 11.2817C60.7234 11.2817 61.44 11.6469 61.6022 12.3669L61.6169 12.4339L61.5517 12.43C61.1169 12.4011 60.7194 12.3866 60.3391 12.3866C55.6058 12.3866 54.8559 14.3074 54.7389 14.896C54.5634 15.7815 55.0381 16.7091 55.8691 17.1006L55.8704 17.0993ZM57.2425 14.691C57.6667 14.0249 58.8832 13.7661 61.5796 13.7661H61.6275V13.8174C61.6275 15.1312 59.7382 15.7434 58.4618 15.7434C58.1666 15.7434 57.8954 15.7132 57.68 15.6541C57.4074 15.5752 57.2359 15.4412 57.1681 15.2547C57.0697 14.9814 57.2359 14.7029 57.2425 14.691Z" fill="white"/><path d="M51.5481 9.65302H43.8246V11.5515H45.9971C47.114 11.5515 47.7296 11.5515 48.8836 11.1442L48.9382 11.1245L49.0179 11.4569L48.9754 11.4726C47.8771 11.8957 47.3998 12.2925 46.7377 12.8416L46.5635 12.9862L43.8232 15.3681V17.3125H51.5468V15.4141H49.3756C48.2428 15.4141 47.5594 15.4141 46.4891 15.8161L46.4332 15.8371L46.3534 15.506L46.3947 15.489C47.4916 15.0409 48.0261 14.6232 48.8079 13.9768L51.5468 11.5791V9.65039L51.5481 9.65302Z" fill="white"/><path d="M12.1803 19.3727C15.586 19.3727 18.3469 18.3204 18.3469 17.0223C18.3469 15.7242 15.586 14.6719 12.1803 14.6719C8.77456 14.6719 6.01367 15.7242 6.01367 17.0223C6.01367 18.3204 8.77456 19.3727 12.1803 19.3727Z" fill="white"/><path d="M12.1803 14.377C15.586 14.377 18.3469 13.5747 18.3469 12.585C18.3469 11.5953 15.586 10.793 12.1803 10.793C8.77456 10.793 6.01367 11.5953 6.01367 12.585C6.01367 13.5747 8.77456 14.377 12.1803 14.377Z" fill="white"/><path d="M12.1803 10.4974C15.586 10.4974 18.3469 9.88563 18.3469 9.13101C18.3469 8.37639 15.586 7.76465 12.1803 7.76465C8.77456 7.76465 6.01367 8.37639 6.01367 9.13101C6.01367 9.88563 8.77456 10.4974 12.1803 10.4974Z" fill="white"/><path d="M12.1803 7.47012C15.586 7.47012 18.3469 7.00308 18.3469 6.42695C18.3469 5.85083 15.586 5.38379 12.1803 5.38379C8.77456 5.38379 6.01367 5.85083 6.01367 6.42695C6.01367 7.00308 8.77456 7.47012 12.1803 7.47012Z" fill="white"/></svg>
              </a>
            </FooterBottomRight>
          </FooterBottomInner>
        </FooterBottom>
      </FooterWrapper>
    </>
  );
}
