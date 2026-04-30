import styled, { keyframes } from 'styled-components';
import { Link } from 'react-router-dom';
import bgFooter from '../../assets/bg-footer.jpg';
import imgFooterEsquerda from '../../assets/img-footer-esquerda.png';
import imgFooterDireita from '../../assets/img-footer-direita.png';

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

const BAIZIA_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="70" height="25" viewBox="0 0 70 25" fill="none"><path d="M25.6171 17.2636C26.5319 17.4318 27.2113 17.5172 27.6355 17.5172C28.5316 17.5172 29.2669 17.2479 29.82 16.7158C30.3731 16.1863 30.6536 15.4795 30.6536 14.6163C30.6536 13.8884 30.4302 13.2867 29.9902 12.8282C29.5487 12.3684 28.9212 12.103 28.1261 12.036L28.0822 12.032V11.81L28.1234 11.8047C28.7603 11.7193 29.2682 11.475 29.6352 11.0782C29.9995 10.6828 30.1856 10.1717 30.1856 9.55813C30.1856 8.8605 29.9543 8.29293 29.4995 7.87383C29.0422 7.45341 28.4359 7.23926 27.7006 7.23926H21.9209V17.3135H22.0166C22.5072 17.1112 23.0949 17.0087 23.761 17.0087C24.0735 17.0087 24.6984 17.0941 25.6185 17.2636H25.6171ZM24.3102 8.8224H26.4721C26.9095 8.8224 27.2592 8.93013 27.5131 9.14034C27.7697 9.35449 27.8987 9.64878 27.8987 10.0153C27.8987 10.3819 27.7697 10.6604 27.5131 10.8811C27.2605 11.0979 26.9148 11.2083 26.488 11.2083H24.3115V8.8224H24.3102ZM24.2929 12.706H26.629C27.1222 12.706 27.5211 12.8229 27.8163 13.0555C28.1154 13.2907 28.267 13.6112 28.267 14.0093C28.267 14.4297 28.1154 14.7753 27.8176 15.0393C27.5224 15.3008 27.1063 15.4335 26.5824 15.4335C26.258 15.4335 25.8232 15.3928 25.2874 15.3113C24.7476 15.243 24.4285 15.2075 24.3394 15.2075H24.2915V12.706H24.2929Z" fill="white"/><path d="M43.1955 7.53125H41.0283V17.3139H43.1955V7.53125Z" fill="white"/><path d="M54.2432 9.65234H52.064V17.3132H54.2432V9.65234Z" fill="white"/><path d="M53.1221 7.23926C52.2791 7.23926 51.8696 7.54538 51.8696 8.17732C51.8696 8.80926 52.2791 9.11538 53.1221 9.11538C53.9651 9.11538 54.3626 8.80926 54.3626 8.17732C54.3626 7.54538 53.9571 7.23926 53.1221 7.23926Z" fill="white"/><path d="M32.1932 17.0992C32.7636 17.3725 33.423 17.517 34.0998 17.517C34.621 17.517 36.4359 17.4027 37.8944 15.9325L37.925 15.901L38.171 16.1191L38.1351 16.1769C38.0008 16.3937 37.9383 16.4922 37.9383 16.9429V17.3134H40.3103V13.4389C40.3103 10.8297 38.869 9.4962 36.025 9.4778C33.9908 9.46204 31.9246 10.1531 31.6148 10.2608L31.9339 11.9793C32.2716 11.8729 34.2234 11.2817 35.7963 11.2817C37.0461 11.2817 37.7628 11.6469 37.925 12.3669L37.9396 12.4339L37.8745 12.4299C37.4397 12.401 37.0422 12.3866 36.6619 12.3866C31.9286 12.3866 31.1787 14.3074 31.0617 14.896C30.8862 15.7815 31.3608 16.709 32.1918 17.1005L32.1932 17.0992ZM33.5666 14.691C33.9908 14.0249 35.2073 13.7661 37.9037 13.7661H37.9516V13.8173C37.9516 15.1311 36.0623 15.7434 34.7858 15.7434C34.4907 15.7434 34.2194 15.7131 34.0041 15.654C33.7315 15.5752 33.56 15.4412 33.4922 15.2546C33.3938 14.9813 33.56 14.7028 33.5666 14.691Z" fill="white"/><path d="M55.8704 17.0993C56.4408 17.3725 57.1003 17.517 57.777 17.517C58.2982 17.517 60.1131 17.4027 61.5717 15.9326L61.6022 15.9011L61.8482 16.1192L61.8123 16.177C61.678 16.3937 61.6155 16.4923 61.6155 16.9429V17.3134H63.9875V13.439C63.9875 10.8298 62.5462 9.49624 59.7023 9.47785C57.6707 9.46077 55.6018 10.1531 55.292 10.2609L55.6111 11.9793C55.9488 11.8729 57.9007 11.2817 59.4736 11.2817C60.7234 11.2817 61.44 11.6469 61.6022 12.3669L61.6169 12.4339L61.5517 12.43C61.1169 12.4011 60.7194 12.3866 60.3391 12.3866C55.6058 12.3866 54.8559 14.3074 54.7389 14.896C54.5634 15.7815 55.0381 16.7091 55.8691 17.1006L55.8704 17.0993ZM57.2425 14.691C57.6667 14.0249 58.8832 13.7661 61.5796 13.7661H61.6275V13.8174C61.6275 15.1312 59.7382 15.7434 58.4618 15.7434C58.1666 15.7434 57.8954 15.7132 57.68 15.6541C57.4074 15.5752 57.2359 15.4412 57.1681 15.2547C57.0697 14.9814 57.2359 14.7029 57.2425 14.691Z" fill="white"/><path d="M51.5481 9.65302H43.8246V11.5515H45.9971C47.114 11.5515 47.7296 11.5515 48.8836 11.1442L48.9382 11.1245L49.0179 11.4569L48.9754 11.4726C47.8771 11.8957 47.3998 12.2925 46.7377 12.8416L46.5635 12.9862L43.8232 15.3681V17.3125H51.5468V15.4141H49.3756C48.2428 15.4141 47.5594 15.4141 46.4891 15.8161L46.4332 15.8371L46.3534 15.506L46.3947 15.489C47.4916 15.0409 48.0261 14.6232 48.8079 13.9768L51.5468 11.5791V9.65039L51.5481 9.65302Z" fill="white"/><path d="M12.1803 19.3727C15.586 19.3727 18.3469 18.3204 18.3469 17.0223C18.3469 15.7242 15.586 14.6719 12.1803 14.6719C8.77456 14.6719 6.01367 15.7242 6.01367 17.0223C6.01367 18.3204 8.77456 19.3727 12.1803 19.3727Z" fill="white"/><path d="M12.1803 14.377C15.586 14.377 18.3469 13.5747 18.3469 12.585C18.3469 11.5953 15.586 10.793 12.1803 10.793C8.77456 10.793 6.01367 11.5953 6.01367 12.585C6.01367 13.5747 8.77456 14.377 12.1803 14.377Z" fill="white"/><path d="M12.1803 10.4974C15.586 10.4974 18.3469 9.88563 18.3469 9.13101C18.3469 8.37639 15.586 7.76465 12.1803 7.76465C8.77456 7.76465 6.01367 8.37639 6.01367 9.13101C6.01367 9.88563 8.77456 10.4974 12.1803 10.4974Z" fill="white"/><path d="M12.1803 7.47012C15.586 7.47012 18.3469 7.00308 18.3469 6.42695C18.3469 5.85083 15.586 5.38379 12.1803 5.38379C8.77456 5.38379 6.01367 5.85083 6.01367 6.42695C6.01367 7.00308 8.77456 7.47012 12.1803 7.47012Z" fill="white"/></svg>`;

export function PublicFooter() {
  return (
    <FooterWrapper>
      <FooterMain>
        <FooterImgLeft>
          <img src={imgFooterEsquerda} alt="Personagem footer esquerda" />
        </FooterImgLeft>

        <FooterCol>
          <FooterColTitle>Institucional</FooterColTitle>
          <FooterLink to="/">Home</FooterLink>
          <FooterLink to="/sobre">Sobre nós</FooterLink>
          <FooterLink to="/parceiros">Parceiros</FooterLink>
          <FooterLink to="/contato">Contato</FooterLink>
        </FooterCol>

        <FooterCol>
          <FooterColTitle>Políticas</FooterColTitle>
          <FooterExternalLink href="#">Termos de Uso</FooterExternalLink>
          <FooterLink to="/privacidade">Política de Privacidade</FooterLink>
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
            <a href="https://balzia.com.br" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center' }}
              dangerouslySetInnerHTML={{ __html: BAIZIA_SVG }}
            />
          </FooterBottomRight>
        </FooterBottomInner>
      </FooterBottom>
    </FooterWrapper>
  );
}
