import styled from 'styled-components';
import { Star } from 'lucide-react';
import { useState } from 'react';

const Wrapper = styled.div<{ $size?: number }>`
  display: inline-flex;
  align-items: center;
  gap: 2px;
`;

const StarButton = styled.button<{ $filled: boolean; $hovered: boolean; $size: number }>`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: ${({ $filled, $hovered, theme }) =>
    $filled || $hovered ? theme.colors.primary : theme.colors.borderLight};
  transition: color 0.15s, transform 0.15s;

  &:hover { transform: scale(1.15); }
`;

const StarIcon = styled(Star)<{ $filled: boolean }>`
  fill: ${({ $filled, theme }) => ($filled ? theme.colors.primary : 'none')};
`;

const StaticStar = styled.span<{ $filled: boolean; $size: number }>`
  display: inline-flex;
  color: ${({ $filled, theme }) => ($filled ? theme.colors.primary : theme.colors.borderLight)};
`;

const Count = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-left: 4px;
`;

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  size?: number;
  count?: number;
  showCount?: boolean;
}

export function StarRating({ value, onChange, size = 16, count, showCount }: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState(0);
  const interactive = !!onChange;

  if (!interactive) {
    return (
      <Wrapper $size={size}>
        {[1, 2, 3, 4, 5].map((star) => (
          <StaticStar key={star} $filled={star <= Math.round(value)} $size={size}>
            <Star size={size} fill={star <= Math.round(value) ? 'currentColor' : 'none'} />
          </StaticStar>
        ))}
        {showCount && count !== undefined && <Count>({count})</Count>}
      </Wrapper>
    );
  }

  return (
    <Wrapper $size={size}>
      {[1, 2, 3, 4, 5].map((star) => (
        <StarButton
          key={star}
          type="button"
          $filled={star <= value}
          $hovered={star <= hoverValue}
          $size={size}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHoverValue(star)}
          onMouseLeave={() => setHoverValue(0)}
        >
          <StarIcon
            size={size}
            $filled={star <= (hoverValue || value)}
          />
        </StarButton>
      ))}
    </Wrapper>
  );
}
