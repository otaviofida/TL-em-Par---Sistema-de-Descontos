import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const Overlay = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  width: 100%;
`;

const Spinner = styled.div<{ $size?: number }>`
  width: ${({ $size = 40 }) => $size}px;
  height: ${({ $size = 40 }) => $size}px;
  border: 3px solid ${({ theme }) => theme.colors.borderLight};
  border-top-color: ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;

export function Loading({ size }: { size?: number }) {
  return (
    <Overlay>
      <Spinner $size={size} />
    </Overlay>
  );
}
