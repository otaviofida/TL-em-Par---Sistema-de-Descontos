import { keyframes, css } from 'styled-components';

/* ── Keyframes ──────────────────────────────────────── */

export const fadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;

export const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
`;

export const fadeInDown = keyframes`
  from { opacity: 0; transform: translateY(-12px); }
  to   { opacity: 1; transform: translateY(0); }
`;

export const fadeInLeft = keyframes`
  from { opacity: 0; transform: translateX(-16px); }
  to   { opacity: 1; transform: translateX(0); }
`;

export const fadeInRight = keyframes`
  from { opacity: 0; transform: translateX(16px); }
  to   { opacity: 1; transform: translateX(0); }
`;

export const scaleIn = keyframes`
  from { opacity: 0; transform: scale(0.95); }
  to   { opacity: 1; transform: scale(1); }
`;

export const slideUp = keyframes`
  from { transform: translateY(100%); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
`;

/* ── Reusable CSS snippets ──────────────────────────── */

/** Standard page-enter: fade + slide up */
export const pageEnter = css`
  animation: ${fadeInUp} 0.4s ease-out both;
`;

/** Staggered child animation — use with nth-child via $delay prop */
export const staggerChild = (index: number) => css`
  animation: ${fadeInUp} 0.35s ease-out both;
  animation-delay: ${index * 0.06}s;
`;

/** Card hover lift */
export const cardHover = css`
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  }
`;
