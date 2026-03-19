import { useState, useRef, useCallback } from 'react';
import styled, { keyframes, css } from 'styled-components';

const fadeOut = keyframes`
  from { opacity: 1; }
  to   { opacity: 0; }
`;

const Overlay = styled.div<{ $leaving: boolean }>`
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;

  ${({ $leaving }) =>
    $leaving &&
    css`
      animation: ${fadeOut} 0.5s ease-out forwards;
      pointer-events: none;
    `}
`;

const Video = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

interface VideoSplashProps {
  src: string;
  onFinished: () => void;
}

export function VideoSplash({ src, onFinished }: VideoSplashProps) {
  const [leaving, setLeaving] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const onFinishedRef = useRef(onFinished);
  onFinishedRef.current = onFinished;
  const calledRef = useRef(false);

  const finish = useCallback(() => {
    if (calledRef.current) return;
    calledRef.current = true;
    setLeaving(true);
    setTimeout(() => onFinishedRef.current(), 600);
  }, []);

  const handleClick = useCallback(() => {
    if (videoRef.current) videoRef.current.pause();
    finish();
  }, [finish]);

  return (
    <Overlay $leaving={leaving} onClick={handleClick}>
      <Video
        ref={videoRef}
        src={src}
        autoPlay
        muted
        playsInline
        onEnded={finish}
      />
    </Overlay>
  );
}
