import React from 'react';
import { AwardShieldBadge, BadgeTier, BadgeStatus } from './AwardShieldBadge';

export { AwardShieldBadge };
export type { BadgeTier, BadgeStatus };

interface BadgeIconProps {
  id: string;
  size?: number;
  className?: string;
  unlocked?: boolean;
  status?: BadgeStatus;
  tier?: BadgeTier;
  showGlow?: boolean;
}

export const BadgeEmblem: React.FC<BadgeIconProps> = ({
  id,
  size = 64,
  className = '',
  unlocked = true,
  status,
  tier,
  showGlow = false,
}) => {
  return (
    <AwardShieldBadge
      id={id}
      size={size}
      className={className}
      unlocked={unlocked}
      status={status}
      tier={tier}
      showGlow={showGlow}
    />
  );
};
