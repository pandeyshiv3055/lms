import React from 'react';

interface BadgeIconProps {
  id: string;
  size?: number;
  className?: string;
  unlocked?: boolean;
}

export const BadgeEmblem: React.FC<BadgeIconProps> = ({ id, size = 64, className = '', unlocked = true }) => {
  const filterStyle = unlocked ? {} : { filter: 'grayscale(100%) opacity(0.4)' };

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        transition: 'all 0.2s ease',
        ...filterStyle,
      }}
    >
      {renderBadgeSvg(id, size)}
    </div>
  );
};

function renderBadgeSvg(id: string, size: number) {
  switch (id) {
    case 'badge-junior-officer':
      return (
        <svg viewBox="0 0 100 100" width={size} height={size}>
          <circle cx="50" cy="50" r="44" fill="#173B3A" stroke="#B87955" strokeWidth="4" />
          <polygon points="50,22 58,38 76,40 62,53 66,71 50,62 34,71 38,53 24,40 42,38" fill="#D49B65" />
          <circle cx="50" cy="50" r="10" fill="#FAF8F3" />
        </svg>
      );
    case 'badge-patrol-specialist':
      return (
        <svg viewBox="0 0 100 100" width={size} height={size}>
          <circle cx="50" cy="50" r="44" fill="#242C2D" stroke="#DDE5D7" strokeWidth="4" />
          {/* Compass Rose */}
          <polygon points="50,18 56,44 50,40 44,44" fill="#B44D45" />
          <polygon points="50,82 56,56 50,60 44,56" fill="#F5F2EA" />
          <polygon points="18,50 44,44 40,50 44,56" fill="#DDE5D7" />
          <polygon points="82,50 56,44 60,50 56,56" fill="#DDE5D7" />
          <circle cx="50" cy="50" r="6" fill="#B87955" />
        </svg>
      );
    case 'badge-safety-observer':
      return (
        <svg viewBox="0 0 100 100" width={size} height={size}>
          <circle cx="50" cy="50" r="44" fill="#1B382F" stroke="#387A5A" strokeWidth="4" />
          {/* Inspection Eye */}
          <ellipse cx="50" cy="50" rx="28" ry="17" fill="#FAF8F3" stroke="#387A5A" strokeWidth="3" />
          <circle cx="50" cy="50" r="11" fill="#173B3A" />
          <circle cx="47" cy="47" r="4" fill="#FFFFFF" />
          {/* Safety Warning Accent */}
          <polygon points="50,20 54,28 46,28" fill="#C9882B" />
        </svg>
      );
    case 'badge-incident-reporter':
      return (
        <svg viewBox="0 0 100 100" width={size} height={size}>
          <circle cx="50" cy="50" r="44" fill="#2A2421" stroke="#B87955" strokeWidth="4" />
          {/* Report Clipboard */}
          <rect x="32" y="26" width="36" height="48" rx="4" fill="#FAF8F3" stroke="#8E9995" strokeWidth="2" />
          <rect x="42" y="22" width="16" height="8" rx="2" fill="#B87955" />
          <line x1="38" y1="38" x2="62" y2="38" stroke="#173B3A" strokeWidth="2.5" />
          <line x1="38" y1="46" x2="58" y2="46" stroke="#68716D" strokeWidth="2" />
          <line x1="38" y1="54" x2="62" y2="54" stroke="#68716D" strokeWidth="2" />
          <line x1="38" y1="62" x2="52" y2="62" stroke="#68716D" strokeWidth="2" />
          <circle cx="68" cy="68" r="8" fill="#387A5A" />
          <path d="M65 68 L67 70 L71 66" fill="none" stroke="#FFF" strokeWidth="2" />
        </svg>
      );
    case 'badge-course-completion':
    default:
      return (
        <svg viewBox="0 0 100 100" width={size} height={size}>
          <defs>
            <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E5C778" />
              <stop offset="50%" stopColor="#C49B45" />
              <stop offset="100%" stopColor="#966F24" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="44" fill="#173B3A" stroke="url(#goldGrad)" strokeWidth="4" />
          {/* Laurel Wreath */}
          <path d="M26 62 Q20 40 32 26 Q36 40 30 54 Z" fill="url(#goldGrad)" />
          <path d="M74 62 Q80 40 68 26 Q64 40 70 54 Z" fill="url(#goldGrad)" />
          {/* Center Award Shield */}
          <path d="M50 28 L64 36 L64 56 Q50 72 50 72 Q50 72 36 56 L36 36 Z" fill="url(#goldGrad)" stroke="#FFFFFF" strokeWidth="1" />
          <polygon points="50,42 53,49 60,50 55,55 56,62 50,58 44,62 45,55 40,50 47,49" fill="#173B3A" />
        </svg>
      );
  }
}
