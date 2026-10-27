import React from 'react';
import { Lock } from 'lucide-react';

export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'platinum';
export type BadgeStatus = 'earned' | 'in_progress' | 'locked';

interface AwardShieldBadgeProps {
  id: string;
  tier?: BadgeTier;
  size?: number;
  status?: BadgeStatus;
  unlocked?: boolean;
  className?: string;
  style?: React.CSSProperties;
  showGlow?: boolean;
}

export const AwardShieldBadge: React.FC<AwardShieldBadgeProps> = ({
  id,
  tier,
  size = 110,
  status,
  unlocked,
  className = '',
  style = {},
  showGlow = true,
}) => {
  // Determine resolved status
  const resolvedStatus: BadgeStatus =
    status || (unlocked === false ? 'locked' : unlocked === true ? 'earned' : 'earned');

  // Infer default tier from badge id if not explicitly passed
  const resolvedTier: BadgeTier =
    tier ||
    (id === 'badge-junior-officer'
      ? 'bronze'
      : id === 'badge-patrol-specialist' || id === 'badge-incident-reporter'
      ? 'silver'
      : id === 'badge-safety-observer'
      ? 'gold'
      : 'platinum');

  const isLocked = resolvedStatus === 'locked';
  const isInProgress = resolvedStatus === 'in_progress';
  const isEarned = resolvedStatus === 'earned';

  const filterStyle: React.CSSProperties = isLocked
    ? { filter: 'grayscale(100%) opacity(0.5)' }
    : isInProgress
    ? { filter: 'grayscale(40%) opacity(0.85)' }
    : {};

  return (
    <div
      className={`award-shield-badge-wrapper ${className}`}
      style={{
        width: size,
        height: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), filter 0.2s ease',
        ...filterStyle,
        ...style,
      }}
      title={isLocked ? 'Locked Training Milestone' : isInProgress ? 'In Progress' : 'Milestone Earned'}
    >
      {/* Golden Aura Glow for Earned Badges */}
      {isEarned && showGlow && (
        <div
          style={{
            position: 'absolute',
            width: '90%',
            height: '90%',
            borderRadius: '50%',
            background:
              resolvedTier === 'platinum'
                ? 'radial-gradient(circle, rgba(224, 184, 76, 0.45) 0%, rgba(224, 184, 76, 0) 70%)'
                : resolvedTier === 'gold'
                ? 'radial-gradient(circle, rgba(224, 184, 76, 0.4) 0%, rgba(224, 184, 76, 0) 70%)'
                : resolvedTier === 'silver'
                ? 'radial-gradient(circle, rgba(200, 215, 220, 0.4) 0%, rgba(200, 215, 220, 0) 70%)'
                : 'radial-gradient(circle, rgba(212, 155, 101, 0.35) 0%, rgba(212, 155, 101, 0) 70%)',
            filter: 'blur(8px)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
      )}

      {/* SVG Shield Artwork */}
      <svg
        viewBox="0 0 140 160"
        width={size}
        height={size * (160 / 140)}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: 'relative', zIndex: 1, display: 'block', maxWidth: '100%' }}
      >
        <defs>
          {/* Metallic Gradients */}
          {/* Platinum / Grand Gold */}
          <linearGradient id="platinumOuter" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="25%" stopColor="#E2E8F0" />
            <stop offset="50%" stopColor="#CBD5E1" />
            <stop offset="80%" stopColor="#94A3B8" />
            <stop offset="100%" stopColor="#64748B" />
          </linearGradient>
          <linearGradient id="goldOuter" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF2B2" />
            <stop offset="30%" stopColor="#F5D061" />
            <stop offset="65%" stopColor="#D49B28" />
            <stop offset="100%" stopColor="#8F5F0D" />
          </linearGradient>
          <linearGradient id="silverOuter" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="40%" stopColor="#E2E8F0" />
            <stop offset="70%" stopColor="#94A3B8" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>
          <linearGradient id="bronzeOuter" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F8D4B8" />
            <stop offset="35%" stopColor="#D49B65" />
            <stop offset="70%" stopColor="#B87955" />
            <stop offset="100%" stopColor="#6E3C1B" />
          </linearGradient>

          {/* Inner Shield Field Gradients */}
          <linearGradient id="fieldEvergreen" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1E4745" />
            <stop offset="60%" stopColor="#173B3A" />
            <stop offset="100%" stopColor="#0D2423" />
          </linearGradient>
          <linearGradient id="fieldNavy" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1E3E66" />
            <stop offset="60%" stopColor="#17365D" />
            <stop offset="100%" stopColor="#0F223D" />
          </linearGradient>
          <linearGradient id="fieldGraphite" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#303A3C" />
            <stop offset="60%" stopColor="#242C2D" />
            <stop offset="100%" stopColor="#14191A" />
          </linearGradient>

          {/* Drop shadow */}
          <filter id="badgeShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#0A1112" floodOpacity="0.35" />
          </filter>
        </defs>

        {/* 1. OUTER SHIELD BASE WITH BEVELED METALLIC RIM */}
        <g filter="url(#badgeShadow)">
          {/* Main Shield Outline: Top crown points at 70,12 -> curves out to 124,30 -> straight down to 124,90 -> curves to point 70,148 */}
          <path
            d="M70 12 L124 28 C124 28 126 90 70 148 C14 90 16 28 16 28 L70 12 Z"
            fill={
              resolvedTier === 'platinum'
                ? 'url(#platinumOuter)'
                : resolvedTier === 'gold'
                ? 'url(#goldOuter)'
                : resolvedTier === 'silver'
                ? 'url(#silverOuter)'
                : 'url(#bronzeOuter)'
            }
          />

          {/* Inner Bevel Border */}
          <path
            d="M70 18 L118 32 C118 32 120 86 70 140 C20 86 22 32 22 32 L70 18 Z"
            fill={
              resolvedTier === 'platinum'
                ? '#475569'
                : resolvedTier === 'gold'
                ? '#784E0B'
                : resolvedTier === 'silver'
                ? '#334155'
                : '#5C3114'
            }
          />

          {/* INNER SHIELD FIELD (Rich dark enamel) */}
          <path
            d="M70 21 L115 34 C115 34 117 84 70 136 C23 84 25 34 25 34 L70 21 Z"
            fill={
              resolvedTier === 'platinum'
                ? 'url(#fieldEvergreen)'
                : resolvedTier === 'gold'
                ? 'url(#fieldEvergreen)'
                : resolvedTier === 'silver'
                ? 'url(#fieldNavy)'
                : 'url(#fieldGraphite)'
            }
          />

          {/* High-gloss diagonal highlight line */}
          <path
            d="M26 36 L114 36 C114 36 100 80 70 110 C50 90 32 60 26 36 Z"
            fill="white"
            opacity="0.08"
          />
        </g>

        {/* 2. BADGE-SPECIFIC EMBLEM / INSIGNIA */}
        {renderBadgeInsignia(id, resolvedTier)}

        {/* 3. TIER STARS / PIPS AT BASE */}
        <g transform="translate(0, 0)">
          {renderTierPips(resolvedTier)}
        </g>
      </svg>

      {/* Lock Overlay Icon if Locked */}
      {isLocked && (
        <div
          style={{
            position: 'absolute',
            width: size * 0.36,
            height: size * 0.36,
            borderRadius: '50%',
            backgroundColor: '#1C2424',
            border: '2px solid #8E9995',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bottom: size * 0.1,
            zIndex: 3,
            boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
          }}
        >
          <Lock size={size * 0.2} color="#FAF8F3" />
        </div>
      )}

      {/* In Progress Ring */}
      {isInProgress && (
        <div
          style={{
            position: 'absolute',
            bottom: size * 0.04,
            padding: '2px 8px',
            backgroundColor: '#173B3A',
            border: '1px solid #D49B65',
            borderRadius: '999px',
            color: '#D49B65',
            fontSize: '9px',
            fontWeight: 800,
            letterSpacing: '0.04em',
            zIndex: 3,
            boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
          }}
        >
          IN PROGRESS
        </div>
      )}
    </div>
  );
};

function renderBadgeInsignia(id: string, tier: BadgeTier) {
  switch (id) {
    case 'badge-junior-officer':
      return (
        /* JUNIOR SECURITY OFFICER: Tactical Chevron & Central Star */
        <g>
          {/* Double Upper Chevrons */}
          <path d="M70 38 L96 56 L88 64 L70 50 L52 64 L44 56 Z" fill="url(#bronzeOuter)" />
          <path d="M70 52 L96 70 L88 78 L70 64 L52 78 L44 70 Z" fill="url(#goldOuter)" />

          {/* Central 5-Point Security Star */}
          <g transform="translate(70, 92)">
            <polygon
              points="0,-20 6,-6 20,-4 9,6 12,20 0,12 -12,20 -9,6 -20,-4 -6,-6"
              fill="url(#goldOuter)"
              stroke="#FAF8F3"
              strokeWidth="0.8"
            />
            <circle cx="0" cy="0" r="5" fill="#173B3A" />
          </g>
        </g>
      );

    case 'badge-patrol-specialist':
      return (
        /* PATROL SPECIALIST: Navigational Compass Rose & Radar Perimeter */
        <g>
          {/* Concentric radar circle rings */}
          <circle cx="70" cy="74" r="30" stroke="#94A3B8" strokeWidth="1" strokeDasharray="3,3" opacity="0.6" />
          <circle cx="70" cy="74" r="22" stroke="url(#silverOuter)" strokeWidth="1.5" fill="rgba(255,255,255,0.04)" />

          {/* 8-Point Compass Rose */}
          <g transform="translate(70, 74)">
            {/* Cardinal North Needle (Red alert) */}
            <polygon points="0,-24 5,-4 0,0" fill="#B44D45" />
            <polygon points="0,-24 -5,-4 0,0" fill="#882C26" />
            {/* South Needle */}
            <polygon points="0,24 5,4 0,0" fill="#F5F2EA" />
            <polygon points="0,24 -5,4 0,0" fill="#CBD5E1" />
            {/* East Needle */}
            <polygon points="24,0 4,5 0,0" fill="#E2E8F0" />
            <polygon points="24,0 4,-5 0,0" fill="#94A3B8" />
            {/* West Needle */}
            <polygon points="-24,0 -4,5 0,0" fill="#E2E8F0" />
            <polygon points="-24,0 -4,-5 0,0" fill="#94A3B8" />

            {/* Intermediate Diagonal Points */}
            <polygon points="14,-14 3,-2 0,0" fill="url(#silverOuter)" />
            <polygon points="-14,-14 -3,-2 0,0" fill="url(#silverOuter)" />
            <polygon points="14,14 3,2 0,0" fill="url(#silverOuter)" />
            <polygon points="-14,14 -3,2 0,0" fill="url(#silverOuter)" />

            {/* Central Brass Pivot */}
            <circle cx="0" cy="0" r="5" fill="url(#goldOuter)" stroke="#FFFFFF" strokeWidth="1" />
          </g>
        </g>
      );

    case 'badge-safety-observer':
      return (
        /* CERTIFIED SAFETY OBSERVER: Vigilant Eye with Security Iris & Hazard Shield */
        <g>
          {/* Upper Warning Beacon Triangle */}
          <polygon points="70,36 82,52 58,52" fill="url(#goldOuter)" stroke="#FAF8F3" strokeWidth="0.8" />
          <circle cx="70" cy="46" r="2.2" fill="#173B3A" />

          {/* Vigilant Inspection Eye */}
          <g transform="translate(70, 80)">
            {/* Sclera Shape */}
            <path
              d="M-36 0 Q0 -22 36 0 Q0 22 -36 0 Z"
              fill="#FAF8F3"
              stroke="url(#goldOuter)"
              strokeWidth="2.5"
            />
            {/* Outer Iris */}
            <circle cx="0" cy="0" r="15" fill="#387A5A" stroke="url(#goldOuter)" strokeWidth="1.5" />
            {/* Inner Pupil */}
            <circle cx="0" cy="0" r="8" fill="#102928" />
            {/* Lens Reflection Highlight */}
            <circle cx="-3" cy="-3" r="3.2" fill="#FFFFFF" />
            <circle cx="3" cy="3" r="1.2" fill="#FFFFFF" />
          </g>

          {/* Lower Scan Arc */}
          <path
            d="M44 104 Q70 118 96 104"
            fill="none"
            stroke="url(#goldOuter)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </g>
      );

    case 'badge-incident-reporter':
      return (
        /* INCIDENT REPORTER: Certified Documentation Clipboard & Quill Seal */
        <g>
          {/* Clipboard Backing */}
          <rect x="45" y="42" width="50" height="66" rx="5" fill="#FAF8F3" stroke="url(#silverOuter)" strokeWidth="2" />
          {/* Clipboard Top Metallic Clamp */}
          <rect x="58" y="37" width="24" height="10" rx="3" fill="url(#goldOuter)" stroke="#173B3A" strokeWidth="1" />
          <circle cx="70" cy="42" r="2.5" fill="#173B3A" />

          {/* Document Lines */}
          <line x1="53" y1="56" x2="87" y2="56" stroke="#173B3A" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="53" y1="66" x2="81" y2="66" stroke="#68716D" strokeWidth="2" strokeLinecap="round" />
          <line x1="53" y1="76" x2="87" y2="76" stroke="#68716D" strokeWidth="2" strokeLinecap="round" />
          <line x1="53" y1="86" x2="75" y2="86" stroke="#68716D" strokeWidth="2" strokeLinecap="round" />

          {/* Official Verification Stamp / Seal */}
          <g transform="translate(80, 94)">
            <circle cx="0" cy="0" r="11" fill="#387A5A" stroke="#FAF8F3" strokeWidth="1.5" />
            <path d="M-5 0 L-2 3 L5 -4" fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        </g>
      );

    case 'badge-course-completion':
    default:
      return (
        /* AEGIS CERTIFIED SECURITY PROFESSIONAL: Grand Laurel Wreath, Inner Shield & Star */
        <g>
          {/* Classical Laurel Wreath of Mastery (Left & Right) */}
          {/* Left Laurel Leaves */}
          <path d="M38 88 Q30 62 45 42 Q50 60 42 78 Z" fill="url(#goldOuter)" />
          <path d="M34 104 Q24 82 36 64 Q43 80 38 98 Z" fill="url(#goldOuter)" />
          <path d="M44 116 Q36 98 44 84 Q50 100 48 112 Z" fill="url(#goldOuter)" />

          {/* Right Laurel Leaves */}
          <path d="M102 88 Q110 62 95 42 Q90 60 98 78 Z" fill="url(#goldOuter)" />
          <path d="M106 104 Q116 82 104 64 Q97 80 102 98 Z" fill="url(#goldOuter)" />
          <path d="M96 116 Q104 98 96 84 Q90 100 92 112 Z" fill="url(#goldOuter)" />

          {/* Central Heart Shield */}
          <g transform="translate(0, 0)">
            <path
              d="M70 46 L92 56 L92 84 Q70 106 70 106 Q70 106 48 84 L48 56 Z"
              fill="url(#goldOuter)"
              stroke="#FFFFFF"
              strokeWidth="1.2"
            />
            {/* Inner Emerald Field */}
            <path
              d="M70 50 L88 58 L88 82 Q70 101 70 101 Q70 101 52 82 L52 58 Z"
              fill="#173B3A"
            />

            {/* Radiant Certification Star */}
            <g transform="translate(70, 72)">
              <polygon
                points="0,-14 4,-4 14,-3 6,5 8,15 0,9 -8,15 -6,5 -14,-3 -4,-4"
                fill="url(#goldOuter)"
              />
              <circle cx="0" cy="0" r="3.5" fill="#FAF8F3" />
            </g>
          </g>

          {/* Lower Banner Ribbon */}
          <path
            d="M52 114 L70 120 L88 114 L85 124 L70 128 L55 124 Z"
            fill="url(#platinumOuter)"
            stroke="#173B3A"
            strokeWidth="0.8"
          />
        </g>
      );
  }
}

function renderTierPips(tier: BadgeTier) {
  const pipsCount = tier === 'platinum' ? 4 : tier === 'gold' ? 3 : tier === 'silver' ? 2 : 1;
  const startX = 70 - (pipsCount - 1) * 8;

  return (
    <g transform="translate(0, 134)">
      {Array.from({ length: pipsCount }).map((_, i) => (
        <circle
          key={i}
          cx={startX + i * 16}
          cy={0}
          r={2.5}
          fill={tier === 'platinum' ? '#FFFFFF' : '#E0B84C'}
          stroke="#173B3A"
          strokeWidth="0.5"
        />
      ))}
    </g>
  );
}
